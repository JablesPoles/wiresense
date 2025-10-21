# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# SG para tasks Fargate (frontend e influxdb)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-ecs-tasks-sg"
  description = "Permite que tasks Fargate puxem imagens do ECR/S3 e se comuniquem internamente"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow HTTP from ALB"
    from_port = 80
    to_port = 80
    protocol = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Comunicação interna entre tasks
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  # Egress aberto para testes (pull de imagens e logs)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# SG do InfluxDB
resource "aws_security_group" "influxdb" {
  name        = "${var.project_name}-influxdb-sg"
  description = "Permite trafego para o InfluxDB"
  vpc_id      = aws_vpc.main.id

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

# Regra de conexão: InfluxDB -> EFS
resource "aws_security_group_rule" "influxdb_to_efs" {
  type                    = "ingress"
  from_port               = 2049
  to_port                 = 2049
  protocol                = "tcp"
  source_security_group_id = aws_security_group.influxdb.id
  security_group_id        = aws_security_group.efs.id
}

# # CloudWatch Log Group Frontend
# resource "aws_cloudwatch_log_group" "frontend" {
#   name              = "/ecs/frontend"
#   retention_in_days = 1
# }

# # ECS Task Definitions
# resource "aws_ecs_task_definition" "frontend" {
#   family                   = "frontend"
#   requires_compatibilities = ["FARGATE"]
#   network_mode             = "awsvpc"
#   cpu                      = "256"
#   memory                   = "512"
#   execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

#   container_definitions = jsonencode([
#     {
#       name      = "frontend"
#       image     = aws_ecr_repository.wiresense_frontend.repository_url
#       cpu       = 256
#       memory    = 512
#       essential = true
#       portMappings = [{ containerPort = 80, hostPort = 80 }]
#       environment = [
#         { name = "REACT_APP_INFLUXDB_URL", value = "http://influxdb.wiresense.local:8086" }
#       ]
#       logConfiguration = {
#         logDriver = "awslogs"
#         options = {
#           awslogs-group         = "/ecs/frontend"
#           awslogs-region        = var.aws_region
#           awslogs-stream-prefix = "frontend"
#         }
#       }
#     }
#   ])
# }

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
      file_system_id = aws_efs_file_system.influxdb_data.id
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
        {
          name = "DOCKER_INFLUXDB_INIT_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_INIT_USERNAME::"
        },
        {
          name      = "DOCKER_INFLUXDB_INIT_PASSWORD",
          valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_INIT_PASSWORD::"
        },
        {
          name      = "DOCKER_INFLUXDB_INIT_ADMIN_TOKEN",
          valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_INIT_ADMIN_TOKEN::"
        },
        {
          name      = "DOCKER_INFLUXDB_INIT_ORG",
          valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_ORG::"
        },
        {
          name      = "DOCKER_INFLUXDB_INIT_BUCKET",
          valueFrom = "${aws_secretsmanager_secret.influxdb_creds.arn}:INFLUXDB_BUCKET::"
        }
      ],
      environment = [
        { name = "DOCKER_INFLUXDB_INIT_MODE", value = "setup" }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = "/ecs/influxdb", # Nome do grupo de logs para o InfluxDB
          "awslogs-region"        = var.aws_region,
          "awslogs-stream-prefix" = "influxdb"
        }
      }
    }
  ])
}

# # ECS Services
# resource "aws_ecs_service" "frontend" {
#   name            = "frontend-service"
#   cluster         = aws_ecs_cluster.main.id
#   task_definition = aws_ecs_task_definition.frontend.arn
#   desired_count   = 1
#   launch_type     = "FARGATE"

#   network_configuration {
#     subnets          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
#     assign_public_ip = false
#     security_groups  = [aws_security_group.ecs_tasks.id]
#   }

#   load_balancer {
#     target_group_arn = aws_lb_target_group.frontend.arn
#     container_name   = "frontend"
#     container_port   = 80
#   }
# }

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

resource "aws_cloudwatch_log_group" "influxdb" {
  name              = "/ecs/influxdb"
  retention_in_days = 1
}
