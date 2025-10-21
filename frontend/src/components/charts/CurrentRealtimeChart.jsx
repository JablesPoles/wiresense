import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getRealtimeData } from '../../services/apiService';

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
    const fetchData = async () => {
      // 👇 Chama a função para buscar dados em range (ex: últimos 2 minutos)
      const dataPoints = await getRealtimeData('2m'); 
      const formattedData = dataPoints.map(point => ({
        x: new Date(point.time).getTime(),
        y: point.value 
      }));

      setSeries([{ name: 'Corrente (A)', data: formattedData.slice(-MAX_DATA_POINTS) }]);
    };

    fetchData(); 
    const intervalId = setInterval(fetchData, 1000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white font-bold mb-4">Corrente em Tempo Real</h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}