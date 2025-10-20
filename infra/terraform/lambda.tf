data "archive_file" "lambda_zip" {
  type = "zip"
  source_dir = "${path.module}/../lambda_function"
  output_path = "${path.module}/../lambda_function.zip"
}

resource "aws_lambda_function" "data_ingestor" {
  filename = data.archive_file.lambda_zip.output_path
  function_name = "${var.project_name}-data-ingestor"
  role = aws_iam_role.lambda_role.arn
  handler = "index.handler"
  runtime = "python3.9"

  vpc_config {
    subnet_ids = [ aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_group_ids = [ aws_security_group.lambda.id ]
  }

  environment {
    variables = {
      INFLUXDB_URL = "http://influxdb.wiresense.local:8086"
      SECRET_ARN = aws_secretsmanager_secret.influxdb_creds.arn
    }  
  }
}

resource "aws_security_group" "lambda" {
  name = "${var.project_name}-lambda-sg"
  vpc_id = aws_vpc.main.id
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [ "0.0.0.0/0" ]
  }
}

# --- API GATEWAY ---

resource "aws_api_gateway_rest_api" "wiresense_api" {
  name = "${var.project_name}-api"
  description = "API para receber os dados do IoT"
}

resource "aws_api_gateway_resource" "data_resource" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  parent_id = aws_api_gateway_rest_api.wiresense_api.root_resource_id
  path_part = "data"
}

resource "aws_api_gateway_method" "post_method" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  resource_id = aws_api_gateway_resource.data_resource.id
  http_method = "POST"
  authorization = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  resource_id = aws_api_gateway_resource.data_resource.id
  http_method = aws_api_gateway_method.post_method.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.data_ingestor.invoke_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id = "AllowAPIGatewayInvoke"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.data_ingestor.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.wiresense_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  lifecycle {
    create_before_destroy = true
  }
  depends_on = [ aws_api_gateway_integration.lambda_integration]
}

resource "aws_api_gateway_stage" "v1" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id = aws_api_gateway_rest_api.wiresense_api.id
  stage_name = "v1"
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