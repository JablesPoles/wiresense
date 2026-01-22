import os
import time
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# --- Configurações via Variáveis de Ambiente (Padrão GitOps/K8s) ---
INFLUX_URL = os.getenv("INFLUXDB_URL", "http://influxdb:8086")
INFLUX_TOKEN = os.getenv("INFLUXDB_TOKEN", "token-secreto-local")
INFLUX_ORG = os.getenv("INFLUXDB_ORG", "wiresense-org")
INFLUX_BUCKET = os.getenv("INFLUXDB_BUCKET", "wiresense")

app = FastAPI(title="WireSense API")

# Configuração de CORS (Para o Frontend React acessar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de dados que o ESP8266 envia
class SensorData(BaseModel):
    device_id: str
    current: float

def get_influx_client():
    return InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)

# --- Rota de Escrita (Substitui index.py) ---
@app.post("/data")
def receive_data(data: SensorData):
    try:
        client = get_influx_client()
        write_api = client.write_api(write_options=SYNCHRONOUS)
        
        # Cria o ponto para o InfluxDB
        point = Point("environment") \
            .tag("device", data.device_id) \
            .field("current", float(data.current))
            
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
        client.close()
        return {"status": "success", "message": "Dados salvos"}
    except Exception as e:
        print(f"Erro ao gravar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Rotas de Leitura (Substitui read_data.py) ---
@app.get("/api/latest")
def get_latest(device_id: Optional[str] = None, window: Optional[str] = None):
    # Se window for passado (ex: "5m"), retorna range de dados (Realtime Chart)
    if window:
        query = f'''
            from(bucket: "{INFLUX_BUCKET}") 
            |> range(start: -{window})
            |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
        '''
        if device_id:
            query += f'|> filter(fn: (r) => r["device"] == "{device_id}")'
            
        # Não usamos |> last() aqui, pois queremos todos os pontos do periodo
        return execute_flux_query(query)

    # Comportamento padrão: apenas o último valor
    query = f'''
        from(bucket: "{INFLUX_BUCKET}") 
        |> range(start: -5m)
        |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
    '''
    if device_id:
        query += f'|> filter(fn: (r) => r["device"] == "{device_id}")'
    
    query += '|> last()'
    
    return execute_flux_query(query)

@app.get("/api/history")
def get_history(period: str = "daily", limit: int = 7, device_id: Optional[str] = None):
    # Para simplificar o teste inicial, vou ler do bucket normal mesmo
    # Em produção, você reativaria a lógica do bucket _longterm
    range_start = "-30d" if period == "daily" else "-1y"
    window = "1d" if period == "daily" else "1mo"
    
    query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: {range_start})
        |> filter(fn: (r) => r["_measurement"] == "environment" and r["_field"] == "current")
    '''
    if device_id:
        query += f'|> filter(fn: (r) => r["device"] == "{device_id}")'

    query += f'''
        |> aggregateWindow(every: {window}, fn: mean, createEmpty: false)
        |> limit(n: {limit})
    '''
    return execute_flux_query(query)

def execute_flux_query(query):
    try:
        client = get_influx_client()
        query_api = client.query_api()
        result = query_api.query(org=INFLUX_ORG, query=query)
        output = []
        for table in result:
            for record in table.records:
                output.append({
                    "time": record.get_time(),
                    "value": record.get_value(),
                    "device": record.values.get("device")
                })
        client.close()
        return output
    except Exception as e:
        print(f"Erro na query: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao consultar InfluxDB: {str(e)}")