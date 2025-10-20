import os
import json
import boto3
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

# Clientes AWS e variáveis de ambiente
secrets_manager = boto3.client('secretsmanager')
influx_url = os.environ['INFLUXDB_URL']
secret_arn = os.environ['SECRET_ARN']
cached_secret = None

def get_influx_credentials():
    """Busca as credenciais do Secrets Manager, usando um cache simples."""
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
        print(f"Erro ao buscar segredo: {e}")
        raise e

def handler(event, context):
    """Lida com a requisição da API Gateway para buscar dados do InfluxDB."""
    try:
        # Busca as credenciais
        creds = get_influx_credentials()
        token = creds['token']
        org = creds['org']
        bucket = creds['bucket']

        # --- CORREÇÃO PRINCIPAL ---
        # Garante que query_params seja sempre um dicionário, mesmo se for nulo
        query_params = event.get('queryStringParameters') or {}
        
        # Agora podemos usar .get() com segurança para obter o parâmetro 'range'
        range_param = query_params.get('range', '1h') # Usa '1h' como padrão

        # Conecta ao InfluxDB
        client = InfluxDBClient(url=influx_url, token=token, org=org)
        query_api = client.query_api()

        # Monta a consulta Flux para buscar os dados de corrente
        query = f'''
            from(bucket: "{bucket}")
              |> range(start: -{range_param})
              |> filter(fn: (r) => r["_measurement"] == "environment")
              |> filter(fn: (r) => r["_field"] == "current")
              |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
              |> yield(name: "mean")
        '''
        
        tables = query_api.query(query, org=org)
        
        # Formata os resultados em um JSON simples
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "time": record.get_time().isoformat(),
                    "current": record.get_value()
                })

        # Retorna a resposta com sucesso e cabeçalhos CORS
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            "body": json.dumps(results, default=str)
        }

    except Exception as e:
        print(f"Erro no handler: {e}")
        # Retorna um erro genérico com cabeçalhos CORS
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }

