# --- LAMBDA FUNCTIONS ---

# Data ingestor Lambda (.zip)
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda_function"
  output_path = "${path.module}/../lambda_function.zip"
}

resource "aws_lambda_function" "data_ingestor" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = "${var.project_name}-data-ingestor"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "python3.9"
  timeout          = 30

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

# Read data Lambda (.zip)
data "archive_file" "lambda_read_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda_read_data"
  output_path = "${path.module}/../lambda_read_data.zip"
}

resource "aws_lambda_function" "read_data" {
  filename         = data.archive_file.lambda_read_zip.output_path
  source_code_hash = data.archive_file.lambda_read_zip.output_base64sha256
  function_name    = "${var.project_name}-read-data"
  role             = aws_iam_role.lambda_role.arn
  handler          = "read_data.handler"
  runtime          = "python3.9"
  timeout          = 30

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

# Security Group para Lambdas
resource "aws_security_group" "lambda" {
  name   = "${var.project_name}-lambda-sg"
  vpc_id = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- API GATEWAY ---

# API Gateway REST API
resource "aws_api_gateway_rest_api" "wiresense_api" {
  name        = "${var.project_name}-api"
  description = "API para receber e fornecer os dados do IoT"
}

# Recurso /data
resource "aws_api_gateway_resource" "data_resource" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  parent_id   = aws_api_gateway_rest_api.wiresense_api.root_resource_id
  path_part   = "data"
}

# POST method
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

# GET method
resource "aws_api_gateway_method" "get_method" {
  rest_api_id      = aws_api_gateway_rest_api.wiresense_api.id
  resource_id      = aws_api_gateway_resource.data_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "lambda_read_integration" {
  rest_api_id             = aws_api_gateway_rest_api.wiresense_api.id
  resource_id             = aws_api_gateway_resource.data_resource.id
  http_method             = aws_api_gateway_method.get_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.read_data.invoke_arn
}

# OPTIONS method (CORS)
resource "aws_api_gateway_method" "cors_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.wiresense_api.id
  resource_id   = aws_api_gateway_resource.data_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "cors_options_200" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  resource_id = aws_api_gateway_resource.data_resource.id
  http_method = aws_api_gateway_method.cors_options_method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "cors_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  resource_id = aws_api_gateway_resource.data_resource.id
  http_method = aws_api_gateway_method.cors_options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "cors_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  resource_id = aws_api_gateway_resource.data_resource.id
  http_method = aws_api_gateway_method.cors_options_method.http_method
  status_code = aws_api_gateway_method_response.cors_options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,GET,POST'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = { "application/json" = "" }

  depends_on = [aws_api_gateway_integration.cors_options_integration]
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.data_ingestor.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.wiresense_api.execution_arn}/*/${aws_api_gateway_method.post_method.http_method}/*"
}

resource "aws_lambda_permission" "apigw_lambda_read" {
  statement_id  = "AllowAPIGatewayInvokeRead"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.read_data.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.wiresense_api.execution_arn}/*/${aws_api_gateway_method.get_method.http_method}/*"
}

# Deployment and Stage
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.data_resource.id,
      aws_api_gateway_method.post_method.id,
      aws_api_gateway_method.get_method.id,
      aws_api_gateway_method.cors_options_method.id,
      aws_api_gateway_integration.lambda_integration.id,
      aws_api_gateway_integration.lambda_read_integration.id,
      aws_api_gateway_integration.cors_options_integration.id,
      aws_api_gateway_integration_response.cors_options_integration_response.id,
    ]))
  }

  lifecycle { create_before_destroy = true }
}

resource "aws_api_gateway_stage" "v1" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.wiresense_api.id
  stage_name    = "v1"
}

# API Key and Usage Plan
resource "aws_api_gateway_api_key" "iot_device_key" {
  name        = "${var.project_name}-iot-device-key"
  description = "Chave de API para o dispositivo IoT WireSense"
  enabled     = true
  tags = { Project = var.project_name }
}

resource "aws_api_gateway_usage_plan" "iot_usage_plan" {
  name        = "${var.project_name}-iot-usage-plan"
  description = "Plano de uso para dispositivos IoT WireSense"

  api_stages {
    api_id = aws_api_gateway_rest_api.wiresense_api.id
    stage  = aws_api_gateway_stage.v1.stage_name
  }

  throttle_settings { 
    burst_limit = 5 
    rate_limit = 10 
  }
  quota_settings { 
    limit = 1000
    period = "DAY"
 }

  tags = { Project = var.project_name }
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.iot_device_key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.iot_usage_plan.id
}
