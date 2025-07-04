// src/services/influxService.js

import { InfluxDB } from "@influxdata/influxdb-client";

// ... (suas variáveis de ambiente)
const url = import.meta.env.VITE_INFLUX_URL;
const token = import.meta.env.VITE_INFLUX_TOKEN;
const org = import.meta.env.VITE_INFLUX_ORG;
const bucket = import.meta.env.VITE_INFLUX_BUCKET;

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

export function getLatestCurrent() {
  // Envolvemos toda a lógica em uma Promise
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -10m)
        |> filter(fn: (r) => r._measurement == "current")
        |> filter(fn: (r) => r.Monitor == "A")
        |> filter(fn: (r) => r._field == "current")
        |> last()
    `;

    const data = [];

    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        data.push(tableMeta.toObject(row));
      },
      error(error) {
        console.error("Erro ao executar a query", error);
        reject(error); // Rejeita a promise se houver um erro
      },
      complete() {
        console.log("Busca de dados concluída.");
        // Resolve a promise com o valor quando a busca terminar
        if (data.length > 0) {
          resolve(data[0]._value);
        } else {
          resolve(null); // Resolve com null se nenhum dado for encontrado
        }
      },
    });
  });
}

export function getHourlyAverage() {
  return new Promise((resolve, reject) => {
    // A tarefa horária salva os dados no bucket de longo prazo, na measurement 'current'
    const fluxQuery = `
      from(bucket: "SCT013_longterm")
        |> range(start: -24h) // Buscamos em um range maior para garantir que pegamos o último ponto
        |> filter(fn: (r) => r._measurement == "current") // A tarefa horária salva aqui
        |> last()
    `;
    const data = [];
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        data.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        console.log("Busca da média horária concluída.");
        resolve(data[0]._value);
      },
    });
  });
}

export function getDailyAverage() {
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      from(bucket: "SCT013_longterm")
        |> range(start: -30d) // Buscamos em um range maior para garantir que pegamos o último ponto
        |> filter(fn: (r) => r._measurement == "current_diaria")
        |> last()
    `;
    const data = [];
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        data.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        console.log("Busca da média diária concluída.");
        resolve(data.length > 0 ? data[0]._value : null);
      },
    });
  });
}

export function getMonthlyAverage() {
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      from(bucket: "SCT013_longterm")
        |> range(start: -12mo) // Buscamos em um range bem grande
        |> filter(fn: (r) => r._measurement == "current_mensal")
        |> last()
    `;
    const data = [];
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        data.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        console.log("Busca da média mensal concluída.");
        resolve(data.length > 0 ? data[0]._value : null);
      },
    });
  });
}