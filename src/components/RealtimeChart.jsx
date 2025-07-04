// src/components/RealtimeChart.jsx

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getLatestCurrent } from '../services/influxService';

const MAX_DATA_POINTS = 30;

export function RealtimeChart() {
  const [series, setSeries] = useState([{
    name: 'Corrente (A)',
    data: []
  }]);

  const [options, setOptions] = useState({
    theme: {
      mode: 'dark',
    },
    chart: {
      id: 'realtime-current',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { speed: 1000 }
      },
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    markers: {
      size: 0,
      hover: { size: 5 }
    },
    xaxis: {
      type: 'datetime',
      range: 20000, // Janela de 20 segundos
      labels: {
        style: { colors: '#A0AEC0' },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => val.toFixed(2), // 2 casas decimais para mais precisão
        style: { colors: '#A0AEC0' },
      }
    },
    grid: {
      borderColor: '#4A5568'
    },
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

          setSeries(prevSeries => {
            const newData = [...prevSeries[0].data, newPoint];
            if (newData.length > MAX_DATA_POINTS) {
              newData.shift();
            }
            return [{ data: newData }];
          });
        }
      });
    }, 2000); // Atualiza a cada 2 segundos

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white font-bold mb-4">Corrente em Tempo Real</h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}