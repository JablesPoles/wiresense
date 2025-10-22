# lambda_function/index.py

import os
import json
import boto3
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# --- Configuração inicial ---
secrets_manager = boto3.client('secretsmanager')
influx_url = os.environ['INFLUXDB_URL']
secret_arn = os.environ['SECRET_ARN']
cached_secret = None

# --- Função para obter credenciais do InfluxDB ---
def get_influx_credentials():
    global cached_secret
    if cached_secret:
        return cached_secret
    try:
        response = secrets_manager.get_secret_value(SecretId=secret_arn)
        secret_data = json.loads(response['SecretString'])
        cached_secret = {
            'token': secret_data['INFLUXDB_INIT_ADMIN_TOKEN'],
            'org': secret_data['INFLUXDB_ORG'],
            'bucket': secret_data['INFLUXDB_BUCKET']
        }
        return cached_secret
    except Exception as e:
        print(f"Erro ao buscar segredo do Secrets Manager: {e}")
        raise e

# --- Função principal da Lambda ---
def handler(event, context):
    try:
        creds = get_influx_credentials()
        client = InfluxDBClient(url=influx_url, token=creds['token'], org=creds['org'])
        write_api = client.write_api(write_options=SYNCHRONOUS)

        body = json.loads(event.get('body', '{}'))
        device_id = body.get('device_id')
        current_value = body.get('current')

        if not device_id or current_value is None:
            return {
                'statusCode': 400,
                'body': json.dumps('Dados inválidos. Esperado: {"device_id": "...", "current": ...}')
            }

        point = Point("environment").tag("device", device_id).field("current", float(current_value))
        write_api.write(bucket=creds['bucket'], org=creds['org'], record=point)

        return {'statusCode': 200, 'body': json.dumps('Dado inserido com sucesso!')}

    except Exception as e:
        print(f"Erro no handler: {e}")
        return {'statusCode': 500, 'body': json.dumps(f'Erro interno: {str(e)}')}
