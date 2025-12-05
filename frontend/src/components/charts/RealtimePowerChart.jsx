import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';

const MAX_DATA_POINTS = 30;

export function RealtimePowerChart({ voltage, data }) {
  const [series, setSeries] = useState([{ name: 'Potência', data: [] }]);

  // Dynamic color
  const strokeColor = '#8b5cf6'; // Violet (Primary)

  const [options] = useState({
    theme: { mode: 'dark' },
    chart: {
      id: 'realtime-power',
      type: 'area',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { speed: 1000 },
      },
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    stroke: { curve: 'smooth', width: 3, colors: [strokeColor] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    xaxis: {
      type: 'datetime',
      range: 30000,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      // title: { text: 'Watts (W)', style: { color: '#94a3b8' } },
      labels: {
        style: { colors: '#94a3b8' },
        formatter: (val) => val.toFixed(0),
      },
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
    legend: { show: false },
    colors: [strokeColor],
    tooltip: { theme: 'dark' }
  });

  useEffect(() => {
    if (data && data.length > 0 && voltage) {
      const formattedData = data.map((point) => ({
        x: new Date(point.time).getTime(),
        y: parseFloat((point.current * voltage).toFixed(0)),
      }));
      setSeries([{ name: 'Potência', data: formattedData.slice(-MAX_DATA_POINTS) }]);
    }
  }, [data, voltage]);

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-semibold text-lg">Potência em Tempo Real</h3>
        <span className="text-xs font-mono text-violet-400 bg-violet-400/10 px-2 py-1 rounded">Live</span>
      </div>
      <ReactApexChart options={options} series={series} type="area" height={250} />
    </div>
  );
}

RealtimePowerChart.propTypes = {
  voltage: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
};
