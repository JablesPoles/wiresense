# backend-config.tf

terraform {
  backend "s3" { // Diz ao Terraform: "Seu backend (memória) será do tipo S3."
    
    // ONDE GUARDAR A PLANTA BAIXA (o arquivo .tfstate)
    bucket         = "wiresense-terraform-state-782329476114" // <<< O nome exato do bucket S3 que criamos.
    key            = "global/terraform.tfstate"            // <<< O nome e a pasta do arquivo dentro do bucket.
    region         = "sa-east-1"                           // <<< A região onde o bucket está.

    // COMO EVITAR CONFLITOS (o "semáforo")
    dynamodb_table = "wiresense-terraform-locks"             // <<< O nome da tabela DynamoDB que criamos.
  }
}