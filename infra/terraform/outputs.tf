# terraform/outputs.tf

output "frontend_url" {
  description = "URL para acessar o frontend do WireSense."
  value       = "http://${aws_lb.main.dns_name}"
}

output "api_gateway_invoke_url" {
  description = "URL do endpoint para enviar dados do IoT."
  value       = aws_api_gateway_stage.v1.invoke_url
}

output "endpoint_sg_id" {
  description = "ID do Security Group dos VPC Endpoints."
  value       = aws_security_group.vpc_endpoint.id
}