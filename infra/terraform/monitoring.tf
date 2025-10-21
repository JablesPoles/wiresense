resource "aws_sns_topic" "alarms_topic" {
  name = "${var.project_name}-alarms-topic"
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.alarms_topic.arn
  protocol = "email"
  endpoint = "matheuspolesnunes@gmail.com"
}

# resource "aws_cloudwatch_metric_alarm" "frontend_high_cpu" {
#   alarm_name = "${var.project_name}-frontend-high-cpu"
#   comparison_operator = "GreaterThanOrEqualToThreshold"
#   evaluation_periods = 2
#   metric_name = "CPUUtilization"
#   namespace = "AWS/ECS"
#   period = "300"
#   statistic = "Average"
#   threshold = "80"

#   dimensions = {
#     ClusterName = aws_ecs_cluster.main.name
#     ServiceName = aws_ecs_service.frontend.name
#   }

#   alarm_description = "Este alarme dispara se a utilizacao de CPU do frontend for 80% ou mais por 10 minutos"
#   alarm_actions = [aws_sns_topic.alarms_topic.arn]
#   ok_actions = [aws_sns_topic.alarms_topic.arn]
# }

# resource "aws_cloudwatch_metric_alarm" "frontend_down" {
#   alarm_name = "${var.project_name}-frontend-down"
#   comparison_operator = "LessThanThreshold"
#   evaluation_periods = 1
#   metric_name = "RunningTaskCount"
#   namespace = "AWS/ECS"
#   period = "60"
#   statistic = "Average"
#   threshold = "1"

#   dimensions = {
#     ClusterName = aws_ecs_cluster.main.name
#     ServiceName = aws_ecs_service.frontend.name
#   }

#   alarm_description = "Este alarme dispara se o servico de frontend nao possuir nenhuma task rodando"
#   alarm_actions = [aws_sns_topic.alarms_topic.arn]
#   ok_actions = [aws_sns_topic.alarms_topic.arn]
# }

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

resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name = "${var.project_name}-alb-5xx-erros"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods = "1"
  metric_name = "HTTPCode_Target_5XX_Count"
  namespace = "AWS/ApplicationELB"
  period = "300"
  statistic = "Sum"
  threshold = "5"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_description = "Este alarme dispara se o ALB registrar 5 ou mais erros 5xx em 5 minutos."
  alarm_actions     = [aws_sns_topic.alarms_topic.arn]
  ok_actions        = [aws_sns_topic.alarms_topic.arn]
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