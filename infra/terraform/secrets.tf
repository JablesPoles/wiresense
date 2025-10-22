# --- INFLUXDB CREDENTIALS IN SECRETS MANAGER ---

# Secret principal
resource "aws_secretsmanager_secret" "influxdb_creds" {
  name = "${var.project_name}/influxdb-credentials"
  tags = { Project = var.project_name }
}

# Secret version inicial
resource "aws_secretsmanager_secret_version" "influxdb_creds_initial" {
  secret_id     = aws_secretsmanager_secret.influxdb_creds.id
  secret_string = jsonencode({
    INFLUXDB_INIT_USERNAME    = "admin"
    INFLUXDB_INIT_PASSWORD    = "admin123"
    INFLUXDB_INIT_ADMIN_TOKEN = "NfJNCNKBdcyO9Fflq892ZicVuAO9xy7uNiRIrlhF1kDYplEjKO15boQ6QaLZ6FRga5VKyIbk1o9SwQAvsEYkqA=="
    INFLUXDB_ORG              = "Energy Monitor"
    INFLUXDB_BUCKET           = "SCT013"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
