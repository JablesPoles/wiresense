terraform {
  backend "s3" {
    # Backend S3 para armazenar o estado do Terraform
    bucket         = "wiresense-terraform-state-782329476114"  # Bucket S3 onde o .tfstate será armazenado
    key            = "global/terraform.tfstate"               # Caminho e nome do arquivo de estado
    region         = "sa-east-1"                               # Região do bucket S3

    # Tabela DynamoDB para travamento do estado (evita alterações simultâneas)
    dynamodb_table = "wiresense-terraform-locks"
  }
}
