import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';

const MAX_DATA_POINTS = 30;

export function CurrentRealtimeChart({ data }) {
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
    yaxis: { 
      title: { text: 'Amperes (A)', style: { color: '#A0AEC0' }}, 
      labels: { 
        style: { colors: '#A0AEC0' },
        formatter: (val) => val.toFixed(2) // Arredonda para 2 casas decimais
      }
    },
    grid: { borderColor: '#4A5568' },
    legend: { show: true }
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map(point => ({
        x: new Date(point.time).getTime(),
        y: point.current
      }));

      setSeries([{ name: 'Corrente (A)', data: formattedData.slice(-MAX_DATA_POINTS) }]);
    }
  }, [data]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white font-bold mb-4">Corrente em Tempo Real</h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}

CurrentRealtimeChart.propTypes = {
  data: PropTypes.array.isRequired
};
