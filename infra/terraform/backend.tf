# backend.tf

# Bucket S3 para armazenar o arquivo de estado do Terraform
resource "aws_s3_bucket" "terraform_state" {
  bucket = "wiresense-terraform-state-782329476114" # <<< NOME ÚNICO GLOBALMENTE! Mude se necessário.

  # Evita a destruição acidental do bucket de estado
  lifecycle {
    prevent_destroy = true
  }
}

# Habilita o versionamento para o bucket de estado (forma moderna)
resource "aws_s3_bucket_versioning" "terraform_state_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Configura a criptografia do lado do servidor para o bucket (forma moderna)
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_encryption" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Tabela DynamoDB para travamento do estado (state locking)
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "wiresense-terraform-locks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "Terraform State Locks"
  }
}

