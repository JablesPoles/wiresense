# lambda_read_data/read_data.py

import os
import json
import boto3
from influxdb_client import InfluxDBClient
from datetime import datetime

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
        print(f"Erro ao buscar segredo: {e}")
        raise e

# --- Função de consulta ao InfluxDB ---
def query_influx(query, org):
    creds = get_influx_credentials()
    results = []
    try:
        with InfluxDBClient(url=influx_url, token=creds['token'], org=org) as client:
            query_api = client.query_api()
            tables = query_api.query(query, org=org)
            for table in tables:
                for record in table.records:
                    record_dict = record.values
                    for k in ['_time', 'x']:
                        if k in record_dict and isinstance(record_dict[k], datetime):
                            record_dict[k] = record_dict[k].isoformat()
                    results.append(record_dict)
    except Exception as e:
        print(f"Erro ao consultar InfluxDB: {e}")
    return results

# --- Função principal da Lambda ---
def handler(event, context):
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    }

    try:
        creds = get_influx_credentials()
        org = creds['org']
        bucket = creds['bucket']
        longterm_bucket = f"{bucket}_longterm"

        query_params = event.get('queryStringParameters') or {}
        query_type = query_params.get('type', 'range')

        # --- Lógica de consulta ---
        device_id = query_params.get('device_id')
        device_filter = f'|> filter(fn: (r) => r["device"] == "{device_id}")' if device_id else ''

        if query_type == 'devices':
            flux_query = f'''
                import "influxdata/influxdb/schema"
                schema.tagValues(bucket: "{bucket}", tag: "device")
            '''
            raw_results = query_influx(flux_query, org)
            # Extrair apenas os valores das tags
            results_body = [r.get('_value') for r in raw_results if r.get('_value')]

        elif query_type in ['latest', 'range']:
            time_range = '-5m' if query_type == 'latest' else query_params.get('range', '-5m')
            flux_query = f'''
                from(bucket: "{bucket}") |> range(start: {time_range}) 
                  |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
                  {device_filter}
                  {"|> last()" if query_type=="latest" else "|> aggregateWindow(every: 10s, fn: mean, createEmpty: false)"}
            '''
            raw_results = query_influx(flux_query, org)
            results_body = (
                {"time": raw_results[0]['_time'], "current": raw_results[0]['_value']} 
                if query_type=='latest' and raw_results else
                ([{"time": r.get('_time'), "current": r.get('_value')} for r in raw_results] if query_type != 'latest' else [])
            )
            if query_type == 'latest' and not raw_results:
                 results_body = {} # Retorna vazio se nao achar nada

        elif query_type == 'summary':
            # Nota: Para summary/history usando dados agregados 'energia_diaria', 
            # assumimos que a tag 'device' também foi preservada ou que o bucket longterm tem essa tag.
            # Se o bucket de longo prazo não tiver tag, o filtro pode não funcionar como esperado.
            # Vou aplicar o filtro se ele existir.
            
            today_query = f'''
                from(bucket: "{longterm_bucket}") |> range(start: -1d)
                  |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                  {device_filter}
                  |> last()
            '''
            month_query = f'''
                import "date"
                month_start = date.truncate(t: now(), unit: 1mo)
                from(bucket: "{longterm_bucket}") |> range(start: month_start)
                  |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                  {device_filter}
                  |> sum()
            '''
            today_result = query_influx(today_query, org)
            month_result = query_influx(month_query, org)
            results_body = {
                "today": today_result[0]['_value'] if today_result else 0,
                "month": month_result[0]['_value'] if month_result else (today_result[0]['_value'] if today_result else 0)
            }

        elif query_type == 'history':
            period = query_params.get('period', 'daily')
            limit = int(query_params.get('limit', 7))
            if period == 'daily':
                flux_query = f'''
                    from(bucket: "{longterm_bucket}")
                      |> range(start: -30d)
                      |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                      {device_filter}
                      |> aggregateWindow(every: 1d, fn: last, createEmpty: false)
                      |> sort(columns: ["_time"], desc: true)
                      |> limit(n: {limit})
                      |> sort(columns: ["_time"])
                      |> map(fn: (r) => ({{ "x": r._time, "y": r._value }}))
                '''
            else:  # monthly
                flux_query = f'''
                    from(bucket: "{longterm_bucket}")
                      |> range(start: -{limit * 31}d)
                      |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                      {device_filter}
                      |> aggregateWindow(every: 1mo, fn: sum, createEmpty: false)
                      |> sort(columns: ["_time"], desc: true)
                      |> limit(n: {limit})
                      |> sort(columns: ["_time"])
                      |> map(fn: (r) => ({{ "x": r._time, "y": r._value }}))
                '''
            raw_results = query_influx(flux_query, org)
            results_body = [{"x": r.get('x'), "y": r.get('y')} for r in raw_results if r.get('x') is not None and r.get('y') is not None]

        else:
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Tipo de query inválido"})}

        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps(results_body, default=str)}

    except Exception as e:
        print(f"Erro no handler: {e}")
        return {"statusCode": 500, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": str(e)})}
