import { InfluxDB, Point } from "@influxdata/influxdb-client";

const url = import.meta.env.VITE_INFLUX_URL;
const token = import.meta.env.VITE_INFLUX_TOKEN;
const org = import.meta.env.VITE_INFLUX_ORG;
const bucket = import.meta.env.VITE_INFLUX_BUCKET;

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);
const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket);

export function setVoltagePreference(voltage) {
  const voltagePoint = new Point("config").floatField("voltage", voltage);
  writeApi.writePoint(voltagePoint);
  return writeApi.flush();
}

export function getLatestCurrent() {
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -1m)
        |> filter(fn: (r) => r._measurement == "current" and r.Monitor == "A" and r._field == "current")
        |> last()
    `;
    let data = null;
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        data = tableMeta.toObject(row);
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(data);
      },
    });
  });
}

export function getDailyEnergyHistory() {
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      from(bucket: "SCT013_longterm")
        |> range(start: -7d)
        |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
        |> sort(columns: ["_time"])
        |> map(fn: (r) => ({ x: r._time, y: r._value }))
    `;
    const result = [];
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        result.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(result);
      },
    });
  });
}

export function getMonthlyEnergyHistory() {
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      import "timezone"
      option location = timezone.location(name: "America/Sao_Paulo")

      from(bucket: "SCT013_longterm")
        |> range(start: -6mo)
        |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
        |> aggregateWindow(every: 1mo, fn: sum, createEmpty: false)
        |> map(fn: (r) => ({ x: r._time, y: r._value }))
    `;
    const result = [];
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        result.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(result);
      },
    });
  });
}

export function getTodaysEnergy() {
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      import "timezone"
      option location = timezone.location(name: "America/Sao_Paulo")

      from(bucket: "SCT013_longterm")
        |> range(start: today())
        |> filter(fn: (r) => r._measurement == "energia_intervalo" and r._field == "kwh_consumido")
        |> sum()
        |> last()
    `;
    let result = null;
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        result = tableMeta.toObject(row);
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(result);
      },
    });
  });
}

export function getMonthlyEnergy() {
  return new Promise((resolve, reject) => {
    const fluxQuery = `
      import "timezone"
      import "date"
      option location = timezone.location(name: "America/Sao_Paulo")

      month_start = date.truncate(t: now(), unit: 1mo)

      from(bucket: "SCT013_longterm")
        |> range(start: month_start)
        |> filter(fn: (r) => r._measurement == "energia_diaria" and r._field == "kwh_total_diario")
        |> sum()
        |> last()
    `;
    let result = null;
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        result = tableMeta.toObject(row);
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(result);
      },
    });
  });
}
