import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getLatestCurrent } from '../../services/influxService';

const MAX_DATA_POINTS = 30;

// Gráfico de linhas para dados em tempo real (Corrente)
export function CurrentRealtimeChart() {
  const [series, setSeries] = useState([{ name: 'Corrente (A)', data: [] }]);
  const [options] = useState({
    theme: { mode: 'dark' },
    chart: {
      id: 'realtime-current',
      background: 'transparent',
      animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 }},
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 0 },
    xaxis: { type: 'datetime', range: 30000, labels: { style: { colors: '#A0AEC0' }}},
    yaxis: { title: { text: 'Amperes (A)', style: { color: '#A0AEC0' }}, labels: { style: { colors: '#A0AEC0' }}},
    grid: { borderColor: '#4A5568' },
    legend: { show: true }
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      getLatestCurrent().then(dataPoint => {
        if (dataPoint && typeof dataPoint._value === 'number') {
          const newPoint = {
            x: new Date(dataPoint._time).getTime(),
            y: dataPoint._value
          };
          setSeries(prev => {
            const data = [...prev[0].data, newPoint];
            if (data.length > MAX_DATA_POINTS) data.shift();
            return [{ ...prev[0], data }];
          });
        }
      });
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white font-bold mb-4">Corrente em Tempo Real</h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}