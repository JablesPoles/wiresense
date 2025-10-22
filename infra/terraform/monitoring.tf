resource "aws_sns_topic" "alarms_topic" {
  name = "${var.project_name}-alarms-topic"
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.alarms_topic.arn
  protocol = "email"
  endpoint = "matheuspolesnunes@gmail.com"
}

resource "aws_cloudwatch_metric_alarm" "influxdb_down" {
  alarm_name = "${var.project_name}-influxdb-down"
  comparison_operator = "LessThanThreshold"
  evaluation_periods = 1
  metric_name = "RunningTaskCount"
  namespace = "AWS/ECS"
  period = "60"
  statistic = "Average"
  threshold = "1"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.influxdb.name
  }

  alarm_description = "Este alarme dispara se o servico do InfluxDB nao possuir nenhuma task rodando"
  alarm_actions = [aws_sns_topic.alarms_topic.arn]
  ok_actions = [aws_sns_topic.alarms_topic.arn]
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300" # 5 minutos
  statistic           = "Sum"
  threshold           = "3" # Dispara se houver 3 ou mais erros na Lambda em 5 minutos

  dimensions = {
    FunctionName = aws_lambda_function.data_ingestor.function_name
  }

  alarm_description = "Este alarme dispara se a função Lambda 'data_ingestor' tiver 3 ou mais erros em 5 minutos."
  alarm_actions     = [aws_sns_topic.alarms_topic.arn]
  ok_actions        = [aws_sns_topic.alarms_topic.arn]
}