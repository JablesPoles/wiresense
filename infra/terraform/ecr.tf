# Containers

resource "aws_ecr_repository" "wiresense_frontend" {
  name = "wiresense/frontend"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "wiresense_influxdb" {
  name = "wiresense/influxdb"
  image_tag_mutability = "MUTABLE"
}