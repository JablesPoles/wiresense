# read_data.py
import os
import json
import boto3
from influxdb_client import InfluxDBClient
from influxdb_client.client.flux_table import FluxStructureEncoder

# Clientes AWS e variáveis de ambiente inicializados fora do handler para performance
secrets_manager = boto3.client('secretsmanager')
influx_url = os.environ.get('INFLUXDB_URL')
secret_arn = os.environ.get('SECRET_ARN')
cached_secret = None

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
        print(f"Erro ao buscar segredo: {e}")
        raise e

def handler(event, context):
    """
    Handler da Lambda que consulta o InfluxDB e retorna os dados.
    """
    try:
        creds = get_influx_credentials()
        token = creds['token']
        org = creds['org']
        bucket = creds['bucket']

        # Define o período da consulta (ex: últimos 30 minutos)
        # Você pode passar isso como um parâmetro da API se quiser mais flexibilidade
        time_range = event.get('queryStringParameters', {}).get('range', '-30m')

        # Query em Flux para buscar os dados de corrente
        query = f'''
            from(bucket: "{bucket}")
                |> range(start: {time_range})
                |> filter(fn: (r) => r["_measurement"] == "environment")
                |> filter(fn: (r) => r["_field"] == "current")
                |> filter(fn: (r) => r["device"] == "ESP8266_Monitor_A")
                |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
                |> yield(name: "mean")
        '''

        with InfluxDBClient(url=influx_url, token=token, org=org) as client:
            query_api = client.query_api()
            # O resultado vem como uma estrutura complexa, precisamos processá-lo
            result = query_api.query(query, org=org)
            
            # Converte o resultado para um formato JSON simples que o frontend pode usar
            # Ex: [{"time": "2025-10-20T18:00:00Z", "value": 1.23}, ...]
            output = []
            for table in result:
                for record in table.records:
                    output.append({
                        "time": record.get_time(),
                        "value": record.get_value()
                    })

        return {
            'statusCode': 200,
            # Permite que seu frontend (de qualquer domínio) acesse esta API
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            # Retorna os dados como uma string JSON
            'body': json.dumps(output, cls=FluxStructureEncoder)
        }

    except Exception as e:
        print(f"Erro no handler: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Access-Control-Allow-Origin': '*' },
            'body': json.dumps({'error': str(e)})
        }

