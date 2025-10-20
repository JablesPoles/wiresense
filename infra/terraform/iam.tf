resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs_task_execution_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda_execution_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow", # <-- Comma was missing here
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_role.name 
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_policy" "read_influxdb_secret" {
  name = "${var.project_name}-ReadInfluxDBSecretPolicy"
  description = "Permite ler as credenciais do influxdb"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "secretsmanager:GetSecretValue"
        Resource = aws_secretsmanager_secret.influxdb_creds.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_read_secret" {
  role = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.read_influxdb_secret.arn 
}

resource "aws_iam_role_policy_attachment" "lambda_read_secret" {
  role = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.read_influxdb_secret.arn
}