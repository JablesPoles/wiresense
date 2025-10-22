import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * Componente de gráfico de barras para dados históricos (diário ou mensal)
 */
export function HistoricalBarChart({ title, unit, data, dateFormat = 'day-month', limit = 7 }) {
  const [series, setSeries] = useState([{ name: title, data: [] }]);
  const [options, setOptions] = useState({
    theme: { mode: 'dark' },
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { type: 'category', labels: { style: { colors: '#A0AEC0' }, rotate: -45, trim: true } },
    yaxis: {
      title: { text: unit, style: { color: '#A0AEC0' } },
      labels: { style: { colors: '#A0AEC0' }, formatter: (val) => val.toFixed(2) },
    },
    fill: { opacity: 1 },
    grid: { borderColor: '#4A5568' },
    tooltip: { y: { formatter: (val) => `${val.toFixed(2)} ${unit}` } },
  });

  useEffect(() => {
    // Funções auxiliares para formatar datas
    const getFormattedDate = (date) => date.toISOString().split('T')[0];
    const getFormattedMonth = (date) => date.toISOString().slice(0, 7);

    const dateRange = [];
    const today = new Date();

    // Gera o range de datas baseado em `limit` e `dateFormat`
    for (let i = limit - 1; i >= 0; i--) {
      const date = new Date();
      if (dateFormat === 'month') {
        date.setUTCMonth(today.getUTCMonth() - i, 1);
        dateRange.push({
          key: getFormattedMonth(date),
          label: date.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }),
        });
      } else {
        date.setUTCDate(today.getUTCDate() - i);
        dateRange.push({
          key: getFormattedDate(date),
          label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }),
        });
      }
    }

    // Mapear dados recebidos para o formato do gráfico
    const dataMap = new Map();
    if (data) {
      data.forEach((d) => {
        const date = new Date(d.x);
        const key = dateFormat === 'month' ? getFormattedMonth(date) : getFormattedDate(date);
        dataMap.set(key, d.y);
      });
    }

    // Preenche dados faltantes com 0
    const completeData = dateRange.map((rangeItem) => dataMap.get(rangeItem.key) || 0);
    const categories = dateRange.map((rangeItem) => rangeItem.label);

    setSeries([{ name: title, data: completeData }]);
    setOptions((prev) => ({ ...prev, xaxis: { ...prev.xaxis, categories } }));
  }, [data, title, dateFormat, limit]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white font-bold mb-4">{title}</h3>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}
