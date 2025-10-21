import os
import json
import boto3
from influxdb_client import InfluxDBClient
from influxdb_client.client.flux_table import FluxStructureEncoder 
from datetime import datetime

# Clientes e cache
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
    """Executa uma consulta Flux e retorna uma lista de dicionários."""
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

def handler(event, context):
    try:
        creds = get_influx_credentials()
        org = creds['org']
        bucket = creds['bucket'] 
        longterm_bucket = f"{bucket}_longterm" 
        query_params = event.get('queryStringParameters') or {}
        query_type = query_params.get('type', 'range') 
        results = []
        status_code = 200

        if query_type == 'latest':
            flux_query = f'''
                from(bucket: "{bucket}")
                  |> range(start: -5m) 
                  |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
                  |> last()
            '''
            raw_results = query_influx(flux_query, org)
            if raw_results:
                latest_point = raw_results[0]
                results = {
                    "time": latest_point.get('_time'),
                    "current": latest_point.get('_value')
                }
            else:
                results = None

        elif query_type == 'range':
            time_range = query_params.get('range', '-5m') 
            flux_query = f'''
                from(bucket: "{bucket}")
                  |> range(start: {time_range})
                  |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
                  |> aggregateWindow(every: 10s, fn: mean, createEmpty: false) // Agrega um pouco para não retornar TANTOS pontos
            '''
            raw_results = query_influx(flux_query, org)
            results = [{"time": r.get('_time'), "current": r.get('_value')} for r in raw_results]

        elif query_type == 'summary':
            today_query = f'''
                import "timezone"
                option location = timezone.location(name: "America/Sao_Paulo")
                from(bucket: "{longterm_bucket}")
                  |> range(start: today())
                  |> filter(fn: (r) => r._measurement == "energia_intervalo" and r._field == "kwh_consumido")
                  |> sum()
                  |> yield(name: "today_sum")
            '''
            month_query = f'''
                import "timezone"
                import "date"
                option location = timezone.location(name: "America/Sao_Paulo")
                month_start = date.truncate(t: now(), unit: 1mo)
                from(bucket: "{longterm_bucket}")
                  |> range(start: month_start)
                  |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                  |> sum()
                  |> yield(name: "month_sum")
            '''
            today_result = query_influx(today_query, org)
            month_result = query_influx(month_query, org)
            results = {
                "today": today_result[0]['_value'] if today_result else 0,
                "month": month_result[0]['_value'] if month_result else 0
            }

        elif query_type == 'history':
            period = query_params.get('period', 'daily')
            limit = int(query_params.get('limit', 7))
            
            if period == 'daily':
                flux_query = f'''
                    import "timezone"
                    option location = timezone.location(name: "America/Sao_Paulo")
                    from(bucket: "{longterm_bucket}")
                      |> range(start: -{limit}d)
                      |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                      |> aggregateWindow(every: 1d, fn: sum, createEmpty: true) // Usa aggregateWindow para garantir todos os dias
                      |> map(fn: (r) => ({{ x: r._time, y: r._value }}))
                      |> sort(columns: ["x"])
                      |> limit(n: {limit})
                '''
            elif period == 'monthly':
                 flux_query = f'''
                    import "timezone"
                    option location = timezone.location(name: "America/Sao_Paulo")
                    from(bucket: "{longterm_bucket}")
                      |> range(start: -{limit}mo) 
                      |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
                      |> aggregateWindow(every: 1mo, fn: sum, createEmpty: true) 
                      |> map(fn: (r) => ({{ x: r._time, y: r._value }}))
                      |> sort(columns: ["x"])
                      |> limit(n: {limit})
                '''
            else:
                 return { "statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Período inválido para histórico"}) }

            raw_results = query_influx(flux_query, org)
            # A query já retorna no formato {x, y}, só precisamos converter time para ISO string
            results = [{"x": r['x'].isoformat() if isinstance(r.get('x'), datetime) else r.get('x'), "y": r.get('y')} for r in raw_results]

        else:
             return { "statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Tipo de query inválido"}) }

        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        }

        return {
            "statusCode": status_code,
            "headers": cors_headers,
            "body": json.dumps(results, default=str) # Usa default=str para lidar com datetime
        }

    except Exception as e:
        print(f"Erro no handler: {e}")
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }