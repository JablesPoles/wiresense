import os
import json
import boto3
from influxdb_client import InfluxDBClient
from datetime import datetime

# --- Clientes e Cache (sem alterações) ---
secrets_manager = boto3.client('secretsmanager')
influx_url = os.environ['INFLUXDB_URL']
secret_arn = os.environ['SECRET_ARN']
cached_secret = None

def get_influx_credentials():
    global cached_secret
    if cached_secret: return cached_secret
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
        print(f"Erro ao buscar segredo: {e}"); raise e

def query_influx(query, org):
    creds = get_influx_credentials()
    token = creds['token']
    results = []
    try:
        with InfluxDBClient(url=influx_url, token=token, org=org) as client:
            query_api = client.query_api()
            tables = query_api.query(query, org=org)
            for table in tables:
                for record in table.records:
                    record_dict = record.values
                    record_dict['_time'] = record.get_time().isoformat()
                    results.append(record_dict)
    except Exception as e:
        print(f"Erro ao consultar InfluxDB: {e}")
    return results

# --- Função Principal ---
def handler(event, context):
    try:
        creds = get_influx_credentials()
        org = creds['org']
        bucket = creds['bucket']
        longterm_bucket = f"{bucket}_longterm"

        query_params = event.get('queryStringParameters') or {}
        query_type = query_params.get('type', 'range')
        
        results = []
        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        }

        # --- LÓGICA DE CONSULTA (COM CORREÇÃO FINAL NO 'HISTORY') ---

        if query_type == 'latest' or query_type == 'range':
            # Mantém a lógica para tempo real
            time_range = '-5m' if query_type == 'latest' else query_params.get('range', '-5m')
            
            flux_query = f'''
                from(bucket: "{bucket}")
                  |> range(start: {time_range}) 
                  |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
                  |> last()
            ''' if query_type == 'latest' else f'''
                from(bucket: "{bucket}")
                  |> range(start: {time_range})
                  |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
                  |> aggregateWindow(every: 10s, fn: mean, createEmpty: false)
            '''
            raw_results = query_influx(flux_query, org)
            if query_type == 'latest':
                results = {"time": raw_results[0]['_time'], "current": raw_results[0]['_value']} if raw_results else None
            else:
                results = [{"time": r.get('_time'), "current": r.get('_value')} for r in raw_results]

        elif query_type == 'summary':
            # Mantém a lógica do summary que já está funcionando
            today_query = f'''
                from(bucket: "{longterm_bucket}")
                  |> range(start: -1d)
                  |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                  |> last()
            '''
            month_query = f'''
                import "date"
                month_start = date.truncate(t: now(), unit: 1mo)
                from(bucket: "{longterm_bucket}")
                  |> range(start: month_start)
                  |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                  |> sum()
            '''
            today_result = query_influx(today_query, org)
            month_result = query_influx(month_query, org)
            
            results = {
                "today": today_result[0]['_value'] if today_result else 0,
                "month": month_result[0]['_value'] if month_result else (today_result[0]['_value'] if today_result else 0)
            }

        elif query_type == 'history':
            period = query_params.get('period', 'daily')
            limit = int(query_params.get('limit', 7))
            
            range_duration = "7d"
            if period == 'monthly':
                range_duration = "6mo" # Ajuste para 6 meses

            # ▼▼▼ ESTA É A CONSULTA CORRIGIDA E SIMPLIFICADA ▼▼▼
            # Ela busca os dados diários e depois agrupa para o caso mensal.
            flux_query = f'''
                import "timezone"
                option location = timezone.location(name: "America/Sao_Paulo")
                
                from(bucket: "{longterm_bucket}")
                  |> range(start: -{range_duration})
                  |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                  // Agrupa por dia, pegando o último valor (o total consolidado do dia)
                  |> aggregateWindow(every: 1d, fn: last, createEmpty: false, location: location) 
                  |> map(fn: (r) => ({{ "x": r._time, "y": r._value }}))
            '''
            # Para o mensal, adicionamos uma agregação extra
            if period == 'monthly':
                flux_query += f' |> aggregateWindow(every: 1mo, fn: sum, createEmpty: false, location: location) |> map(fn: (r) => ({{ "x": r._time, "y": r._value }}))'

            flux_query += f' |> sort(columns: ["x"]) |> limit(n: {limit})'
            # ▲▲▲ FIM DA CONSULTA CORRIGIDA ▲▲▲

            print(f"Executando query de histórico ({period}): {flux_query}") # Log para depuração
            raw_results = query_influx(flux_query, org)
            results = raw_results # A query já formata os dados

        else:
             return { "statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Tipo de query inválido"}) }

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps(results, default=str)
        }

    except Exception as e:
        print(f"Erro no handler: {e}")
        return { "statusCode": 500, "headers": { "Access-Control-Allow-Origin": "*" }, "body": json.dumps({"error": str(e)}) }

