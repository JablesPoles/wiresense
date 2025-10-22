# ECS Cluster principal
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# Security Group para Fargate tasks (frontend e InfluxDB)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-ecs-tasks-sg"
  description = "Permite pull de imagens do ECR/S3 e comunicacao interna entre tasks"
  vpc_id      = aws_vpc.main.id

  # Permite comunicação interna entre tasks
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  # Egress aberto para internet (pull de imagens e logs)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group do InfluxDB
resource "aws_security_group" "influxdb" {
  name        = "${var.project_name}-influxdb-sg"
  description = "Permite trafego para o InfluxDB"
  vpc_id      = aws_vpc.main.id

  lifecycle {
    create_before_destroy = true
  }

  ingress {
    protocol        = "tcp"
    from_port       = 8086
    to_port         = 8086
    security_groups = [aws_security_group.ecs_tasks.id, aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Regra de segurança: InfluxDB -> EFS
resource "aws_security_group_rule" "influxdb_to_efs" {
  type                     = "ingress"
  from_port                = 2049
  to_port                  = 2049
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.influxdb.id
  security_group_id        = aws_security_group.efs.id
}

# Task Definition ECS - InfluxDB
resource "aws_ecs_task_definition" "influxdb" {
  family                   = "influxdb"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  volume {
    name = "influxdb-data"
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.influxdb_data.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.influxdb.id
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "influxdb"
      image     = "${aws_ecr_repository.wiresense_influxdb.repository_url}:2.7"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [{ containerPort = 8086, hostPort = 8086 }]
      mountPoints = [{ sourceVolume = "influxdb-data", containerPath = "/var/lib/influxdb2" }]
      secrets = [
        { name = "DOCKER_INFLUXDB_INIT_USERNAME", valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_INIT_USERNAME::" },
        { name = "DOCKER_INFLUXDB_INIT_PASSWORD", valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_INIT_PASSWORD::" },
        { name = "DOCKER_INFLUXDB_INIT_ADMIN_TOKEN", valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_INIT_ADMIN_TOKEN::" },
        { name = "DOCKER_INFLUXDB_INIT_ORG", valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_ORG::" },
        { name = "DOCKER_INFLUXDB_INIT_BUCKET", valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_BUCKET::" }
      ]
      environment = [{ name = "DOCKER_INFLUXDB_INIT_MODE", value = "setup" }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/influxdb"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "influxdb"
        }
      }
    }
  ])
}

# ECS Service - InfluxDB
resource "aws_ecs_service" "influxdb" {
  name            = "influxdb-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.influxdb.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    assign_public_ip = false
    security_groups  = [aws_security_group.influxdb.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.influxdb.arn
  }
}

# Service Discovery
resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "wiresense.local"
  vpc  = aws_vpc.main.id
}

resource "aws_service_discovery_service" "influxdb" {
  name = "influxdb"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

# CloudWatch Log Group para InfluxDB
resource "aws_cloudwatch_log_group" "influxdb" {
  name              = "/ecs/influxdb"
  retention_in_days = 1
}
