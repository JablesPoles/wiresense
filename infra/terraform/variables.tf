# terraform/variables.tf

variable "aws_region" {
  description = "Região da AWS para criar os recursos."
  type        = string
  default     = "sa-east-1"
}

variable "project_name" {
  description = "Nome do projeto para usar em tags."
  type        = string
  default     = "wiresense"
}

# Adicione outras variáveis aqui (versão do InfluxDB, portas, etc.)