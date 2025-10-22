# EFS principal para dados do InfluxDB
resource "aws_efs_file_system" "influxdb_data" {
  creation_token = "${var.project_name}-influxdb-data"
  tags = {
    Name = "${var.project_name}-influxdb-data"
  }
}

# Access Point do EFS para InfluxDB
resource "aws_efs_access_point" "influxdb" {
  file_system_id = aws_efs_file_system.influxdb_data.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/influxdb"
    creation_info {
      owner_uid   = 1000
      owner_gid   = 1000
      permissions = "0755"
    }
  }

  tags = {
    Name = "${var.project_name}-influxdb-ap"
  }
}

# Mount Targets do EFS nas subnets privadas
resource "aws_efs_mount_target" "mount_private_a" {
  file_system_id  = aws_efs_file_system.influxdb_data.id
  subnet_id       = aws_subnet.private_a.id
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_mount_target" "mount_private_b" {
  file_system_id  = aws_efs_file_system.influxdb_data.id
  subnet_id       = aws_subnet.private_b.id
  security_groups = [aws_security_group.efs.id]
}

# Security Group do EFS para NFS
resource "aws_security_group" "efs" {
  name        = "${var.project_name}-efs-sg"
  description = "Permite acesso NFS para o EFS"
  vpc_id      = aws_vpc.main.id

  # Permite tráfego de saída para qualquer destino (necessário para updates e snapshots)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
