# --- LAMBDA DE ESCRITA DE DADOS (EXISTENTE, MAS AJUSTADA) ---

# Prepara o .zip para a Lambda de escrita
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda_function" # Caminho corrigido para a pasta raiz do projeto
  output_path = "${path.module}/../lambda_function.zip"
}

resource "aws_lambda_function" "data_ingestor" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = "${var.project_name}-data-ingestor"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "python3.9"

  # CORREÇÃO: Movido para as subnets privadas para segurança
  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      INFLUXDB_URL = "http://influxdb.wiresense.local:8086"
      SECRET_ARN   = aws_secretsmanager_secret.influxdb_creds.arn
    }
  }
}

# --- LAMBDA DE LEITURA DE DADOS (NOVA) ---

# Prepara o .zip para a nova Lambda de leitura
data "archive_file" "lambda_read_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda_read_data" # Aponta para a nova pasta da Lambda de leitura
  output_path = "${path.module}/lambda_read_data.zip"
}

resource "aws_lambda_function" "read_data" {
  filename         = data.archive_file.lambda_read_zip.output_path
  source_code_hash = data.archive_file.lambda_read_zip.output_base64sha256
  function_name    = "${var.project_name}-read-data"
  role             = aws_iam_role.lambda_role.arn
  handler          = "read_data.handler" # O arquivo é read_data.py
  runtime          = "python3.9"

  # Colocada nas subnets privadas para acessar o InfluxDB
  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      INFLUXDB_URL = "http://influxdb.wiresense.local:8086"
      SECRET_ARN   = aws_secretsmanager_secret.influxdb_creds.arn
    }
  }
}

# --- SECURITY GROUP PARA AS LAMBDAS ---

# Um único SG para ambas as Lambdas, com acesso à internet (via NAT/Endpoints)
resource "aws_security_group" "lambda" {
  name   = "${var.project_name}-lambda-sg"
  vpc_id = aws_vpc.main.id
  
  # Regra de saída para permitir que as Lambdas acessem outros serviços (AWS, internet)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- API GATEWAY (EXISTENTE E EXPANDIDA) ---

resource "aws_api_gateway_rest_api" "wiresense_api" {
  name        = "${var.project_name}-api"
  description = "API para receber e fornecer os dados do IoT"
}

# O recurso /data continua o mesmo
resource "aws_api_gateway_resource" "data_resource" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  parent_id   = aws_api_gateway_rest_api.wiresense_api.root_resource_id
  path_part   = "data"
}

# --- MÉTODO POST (EXISTENTE) ---
resource "aws_api_gateway_method" "post_method" {
  rest_api_id      = aws_api_gateway_rest_api.wiresense_api.id
  resource_id      = aws_api_gateway_resource.data_resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.wiresense_api.id
  resource_id             = aws_api_gateway_resource.data_resource.id
  http_method             = aws_api_gateway_method.post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.data_ingestor.invoke_arn
}

# --- MÉTODO GET (NOVO) ---
resource "aws_api_gateway_method" "get_method" {
  rest_api_id      = aws_api_gateway_rest_api.wiresense_api.id
  resource_id      = aws_api_gateway_resource.data_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false # Não precisa de chave para ler os dados (acesso público)
}

resource "aws_api_gateway_integration" "lambda_read_integration" {
  rest_api_id             = aws_api_gateway_rest_api.wiresense_api.id
  resource_id             = aws_api_gateway_resource.data_resource.id
  http_method             = aws_api_gateway_method.get_method.http_method
  integration_http_method = "POST" # Lambda Proxy integration sempre usa POST
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.read_data.invoke_arn
}

# --- PERMISSÕES E DEPLOY DA API ---

# Permissão para o POST (existente)
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.data_ingestor.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.wiresense_api.execution_arn}/*/${aws_api_gateway_method.post_method.http_method}/*"
}

# Permissão para o GET (nova)
resource "aws_lambda_permission" "apigw_lambda_read" {
  statement_id  = "AllowAPIGatewayInvokeRead"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.read_data.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.wiresense_api.execution_arn}/*/${aws_api_gateway_method.get_method.http_method}/*"
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id

  # Este 'triggers' garante que um novo deploy seja feito sempre que a API mudar
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.data_resource.id,
      aws_api_gateway_method.post_method.id,
      aws_api_gateway_method.get_method.id,
      aws_api_gateway_integration.lambda_integration.id,
      aws_api_gateway_integration.lambda_read_integration.id,
    ]))
  }

  lifecycle { create_before_destroy = true }
}

resource "aws_api_gateway_stage" "v1" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.wiresense_api.id
  stage_name    = "v1"
}

resource "aws_api_gateway_api_key" "iot_device_key" {
  name = "${var.project_name}-iot-device-key"
  description = "Chave de API para o dispositivo IoT WireSense"
  enabled = true
  tags = {
    Project = var.project_name
  }
}

resource "aws_api_gateway_usage_plan" "iot_usage_plan" {
  name = "${var.project_name}-iot-usage-plan"
  description = "Plano de uso para dispositivos IoT WireSense"
  api_stages {
    api_id = aws_api_gateway_rest_api.wiresense_api.id
    stage = aws_api_gateway_stage.v1.stage_name
  }

  throttle_settings {
    burst_limit = 5 # Requisições em "burst"
    rate_limit  = 10 # Requisições médias por segundo
  }

  quota_settings {
    limit  = 1000
    period = "DAY"
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id = aws_api_gateway_api_key.iot_device_key.id
  key_type = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.iot_usage_plan.id
}