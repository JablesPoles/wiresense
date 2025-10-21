# resource "aws_appautoscaling_target" "frontend_target" {
#   service_namespace = "ecs"

#   resource_id = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"

#   scalable_dimension = "ecs:service:DesiredCount"

#   min_capacity = 1
#   max_capacity = 3
# }

# resource "aws_appautoscaling_policy" "frontend_cpu_policy" {
#   name = "${var.project_name}-frontend-cpu-scaling-policy"
#   service_namespace = aws_appautoscaling_target.frontend_target.service_namespace
#   resource_id = aws_appautoscaling_target.frontend_target.resource_id
#   scalable_dimension = aws_appautoscaling_target.frontend_target.scalable_dimension

#   policy_type = "TargetTrackingScaling"

#   target_tracking_scaling_policy_configuration {
#     predefined_metric_specification {
#       predefined_metric_type = "ECSServiceAverageCPUUtilization"
#     }
  
#     target_value = 75.0
#     scale_out_cooldown = 60
#     scale_in_cooldown = 300
#   }
# }