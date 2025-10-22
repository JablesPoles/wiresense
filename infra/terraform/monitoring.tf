# --- SNS TOPIC PARA ALARMES ---
resource "aws_sns_topic" "alarms_topic" {
  name = "${var.project_name}-alarms-topic"
}

# Assinatura de e-mail para receber alertas
resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.alarms_topic.arn
  protocol  = "email"
  endpoint  = "matheuspolesnunes@gmail.com"
}

# --- CLOUDWATCH ALARMS ---

# Alarme se o serviço InfluxDB não tiver nenhuma task rodando
resource "aws_cloudwatch_metric_alarm" "influxdb_down" {
  alarm_name          = "${var.project_name}-influxdb-down"
  alarm_description   = "Dispara se o serviço InfluxDB não possuir nenhuma task ativa"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RunningTaskCount"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 1

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.influxdb.name
  }

  alarm_actions = [aws_sns_topic.alarms_topic.arn]
  ok_actions    = [aws_sns_topic.alarms_topic.arn]
}

# Alarme para erros na Lambda 'data_ingestor'
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  alarm_description   = "Dispara se a função Lambda 'data_ingestor' tiver >= 3 erros em 5 minutos"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 3

  dimensions = {
    FunctionName = aws_lambda_function.data_ingestor.function_name
  }

  alarm_actions = [aws_sns_topic.alarms_topic.arn]
  ok_actions    = [aws_sns_topic.alarms_topic.arn]
}
