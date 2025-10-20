# lambda_function/index.py
import os
import json
import boto3 
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

secrets_manager = boto3.client('secretsmanager')
influx_url = os.environ['INFLUXDB_URL']
secret_arn = os.environ['SECRET_ARN'] 
cached_secret = None

def get_influx_credentials():
    global cached_secret
    if cached_secret:
        return cached_secret
    try:
        response = secrets_manager.get_secret_value(SecretId=secret_arn)
        if 'SecretString' in response:
            secret_data = json.loads(response['SecretString'])
            cached_secret = {
                'token': secret_data['INFLUXDB_INIT_ADMIN_TOKEN'],
                'org': secret_data['INFLUXDB_ORG'],
                'bucket': secret_data['INFLUXDB_BUCKET']
            }
            return cached_secret
        else:
            raise ValueError("SecretString não encontrado na resposta do Secrets Manager")
    except Exception as e:
        print(f"Erro ao buscar segredo do Secrets Manager: {e}")
        raise e

def handler(event, context):
    try:
        creds = get_influx_credentials()
        token = creds['token']
        org = creds['org']
        bucket = creds['bucket']
        data = json.loads(event['body'])
        device_id = data.get('device_id')
        current_value = data.get('current') 

        if not device_id or current_value is None: 
            return {'statusCode': 400, 'body': json.dumps('Dados inválidos. Esperado: {"device_id": "...", "current": ...}')}

        client = InfluxDBClient(url=influx_url, token=token, org=org)
        write_api = client.write_api(write_options=SYNCHRONOUS)

        point = Point("environment") \
            .tag("device", device_id) \
            .field("current", float(current_value))

        write_api.write(bucket=bucket, org=org, record=point)

        return {'statusCode': 200, 'body': json.dumps('Dado inserido com sucesso!')}

    except Exception as e:
        print(f"Erro no handler: {e}")
        # print(f"Evento recebido: {json.dumps(event)}") # Descomente para depuração profunda
        return {'statusCode': 500, 'body': json.dumps(f'Erro interno: {str(e)}')}