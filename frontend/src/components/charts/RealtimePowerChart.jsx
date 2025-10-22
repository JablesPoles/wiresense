import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';

// Número máximo de pontos exibidos no gráfico em tempo real
const MAX_DATA_POINTS = 30;

/**
 * Componente de gráfico de linha mostrando potência instantânea
 */
export function RealtimePowerChart({ voltage, data }) {
  const [series, setSeries] = useState([{ name: 'Potência (W)', data: [] }]);

  // Configurações do gráfico ApexCharts
  const [options] = useState({
    theme: { mode: 'dark' },
    chart: {
      id: 'realtime-power',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { speed: 1000 },
      },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: 'smooth', width: 2, colors: ['#F59E0B'] },
    markers: { size: 0 },
    xaxis: { type: 'datetime', range: 30000, labels: { style: { colors: '#A0AEC0' } } },
    yaxis: {
      title: { text: 'Watts (W)', style: { color: '#A0AEC0' } },
      labels: {
        style: { colors: '#A0AEC0' },
        formatter: (val) => val.toFixed(0), // Arredonda para inteiro
      },
    },
    grid: { borderColor: '#4A5568' },
    legend: { show: true },
  });

  // Atualiza os dados do gráfico sempre que `data` ou `voltage` mudar
  useEffect(() => {
    if (data && data.length > 0 && voltage) {
      const formattedData = data.map((point) => ({
        x: new Date(point.time).getTime(),
        y: parseFloat((point.current * voltage).toFixed(0)),
      }));

      setSeries([{ name: 'Potência (W)', data: formattedData.slice(-MAX_DATA_POINTS) }]);
    }
  }, [data, voltage]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white font-bold mb-4">Potência em Tempo Real</h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}

RealtimePowerChart.propTypes = {
  voltage: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
};
