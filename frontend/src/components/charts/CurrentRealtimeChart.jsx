import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';

const MAX_DATA_POINTS = 30;

export function CurrentRealtimeChart({ data, color }) {
  const [series, setSeries] = useState([{ name: 'Corrente', data: [] }]);

  // Dynamic color from CSS variable or prop
  const strokeColor = color || '#06b6d4'; // Cyan default

  const [options, setOptions] = useState({
    theme: { mode: 'dark' },
    chart: {
      id: 'realtime-current',
      type: 'line',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          enabled: true,
          speed: 900
        },
        animateGradually: { enabled: false }, // Prevent 'redrawing' the whole line
        initialAnimation: { enabled: false }  // Prevent 'growing' animation on load
      },
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    stroke: {
      curve: 'straight',
      width: 4,
      colors: [strokeColor],
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 10,
        opacity: 0.6,
        color: strokeColor
      }
    },
    fill: {
      type: 'solid',
      opacity: 0
    },
    dataLabels: { enabled: false },
    xaxis: {
      type: 'datetime',
      // range removed to let chart auto-fit data
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      show: false, // Hide the entire axis
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
    legend: { show: false },
    colors: [strokeColor],
  });

  // Watch for color changes to update options
  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      stroke: { ...prev.stroke, colors: [color || '#06b6d4'] },
      colors: [color || '#06b6d4']
    }));
  }, [color]);

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
        <span className={`text-xs font-mono px-2 py-1 rounded ${color ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-400/10 text-cyan-400'}`}>Live</span>
      </div>
      <ReactApexChart options={options} series={series} type="area" height={250} />
    </div>
  );
}

CurrentRealtimeChart.propTypes = {
  data: PropTypes.array.isRequired,
  color: PropTypes.string
};
