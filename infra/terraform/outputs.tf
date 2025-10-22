# --- OUTPUTS ---

output "api_gateway_invoke_url" {
  description = "URL do endpoint para envio de dados do IoT"
  value       = aws_api_gateway_stage.v1.invoke_url
}

output "endpoint_sg_id" {
  description = "ID do Security Group usado pelos VPC Endpoints"
  value       = aws_security_group.vpc_endpoint.id
}

output "cloudfront_url" {
  description = "URL para acessar o frontend via CloudFront"
  value       = "https://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
}

output "frontend_bucket_name" {
  description = "Nome do bucket S3 contendo os assets do frontend"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "cloudfront_distribution_id" {
  description = "ID da distribuição CloudFront"
  value       = aws_cloudfront_distribution.frontend_distribution.id
}

output "rest_api_id" {
  description = "ID da REST API no API Gateway"
  value       = aws_api_gateway_rest_api.wiresense_api.id
}
