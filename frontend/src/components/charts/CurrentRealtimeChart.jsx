import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';

const MAX_DATA_POINTS = 30;

export function CurrentRealtimeChart({ data }) {
  const [series, setSeries] = useState([{ name: 'Corrente', data: [] }]);

  // Dynamic color from CSS variable
  const strokeColor = '#06b6d4'; // Cyan

  const [options] = useState({
    theme: { mode: 'dark' },
    chart: {
      id: 'realtime-current',
      type: 'area', // Area chart looks better for fills
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
    dataLabels: { enabled: false },
    xaxis: {
      type: 'datetime',
      range: 30000,
      labels: { show: false }, // Cleaner look
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      // title: { text: 'Amperes (A)', style: { color: '#94a3b8' } },
      labels: {
        style: { colors: '#94a3b8' },
        formatter: (val) => val.toFixed(1),
      },
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
    legend: { show: false }, // Title handles context
    colors: [strokeColor],
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((point) => ({
        x: new Date(point.time).getTime(),
        y: point.current,
      }));
      setSeries([{ name: 'Corrente', data: formattedData.slice(-MAX_DATA_POINTS) }]);
    }
  }, [data]);

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-semibold text-lg">Corrente em Tempo Real</h3>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">Live</span>
      </div>
      <ReactApexChart options={options} series={series} type="area" height={250} />
    </div>
  );
}

CurrentRealtimeChart.propTypes = {
  data: PropTypes.array.isRequired,
};
