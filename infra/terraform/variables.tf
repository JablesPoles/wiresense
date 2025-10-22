# --- VARIÁVEIS GLOBAIS ---

variable "aws_region" {
  description = "Região da AWS para criação dos recursos."
  type        = string
  default     = "sa-east-1"
}

variable "project_name" {
  description = "Nome do projeto para usar em tags e nomes de recursos."
  type        = string
  default     = "wiresense"
}

# Exemplo de variáveis adicionais que podem ser adicionadas:
# variable "influxdb_version" { type = string, default = "2.7" }
# variable "ecs_instance_type" { type = string, default = "t3.micro" }
# variable "nat_instance_type" { type = string, default = "t3.micro" }