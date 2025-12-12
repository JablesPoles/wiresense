import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';

const MAX_DATA_POINTS = 30;

export function RealtimePowerChart({ voltage, data, color }) {
  const [series, setSeries] = useState([{ name: 'Potência', data: [] }]);

  // Dynamic color
  const strokeColor = color || '#8b5cf6'; // Violet (Primary)

  const [options, setOptions] = useState({
    theme: { mode: 'dark' },
    chart: {
      id: 'realtime-power',
      type: 'line',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          enabled: true,
          speed: 900 // Slightly faster than update to ensure completion
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
    tooltip: { theme: 'dark' }
  });

  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      stroke: { ...prev.stroke, colors: [color || '#8b5cf6'] },
      colors: [color || '#8b5cf6'],
      // Re-enforce axis hiding in case of weird merge
      yaxis: { show: false, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } }
    }));
  }, [color]);

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
        <span className={`text-xs font-mono px-2 py-1 rounded ${color ? 'bg-emerald-500/10 text-emerald-400' : 'text-violet-400 bg-violet-400/10'}`}>Live</span>
      </div>
      <ReactApexChart options={options} series={series} type="area" height={250} />
    </div>
  );
}

RealtimePowerChart.propTypes = {
  voltage: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  color: PropTypes.string
};
