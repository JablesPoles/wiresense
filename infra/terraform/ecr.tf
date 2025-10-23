# Repositórios ECR para imagens de containers
resource "aws_ecr_repository" "wiresense_frontend" {
  name                 = "wiresense/frontend"
  force_delete = true
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "wiresense_influxdb" {
  name                 = "wiresense/influxdb"
  image_tag_mutability = "MUTABLE"
}
