// src/App.jsx

import { useState, useEffect } from 'react';
import { DataCard } from './components/DataCard';
import { getLatestCurrent, getHourlyAverage, getDailyAverage, getMonthlyAverage } from './services/influxService';

function App() {
  const [current, setCurrent] = useState(null);
  const [hourlyAvg, setHourlyAvg] = useState(null);
  const [dailyAvg, setDailyAvg] = useState(null);
  const [monthlyAvg, setMonthlyAvg] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      // ✅ LÓGICA CORRIGIDA ABAIXO
      getLatestCurrent().then(value => {
        // Agora 'value' é o número diretamente.
        if (typeof value === 'number') {
          setCurrent(value.toFixed(1));
        }
      });

      getHourlyAverage().then(value => {
        if (typeof value === 'number') {
          setHourlyAvg(value.toFixed(1));
        }
      });

      getDailyAverage().then(value => {
        if (typeof value === 'number') {
          setDailyAvg(value.toFixed(1));
        }
      });

      getMonthlyAverage().then(value => {
        if (typeof value === 'number') {
          setMonthlyAvg(value.toFixed(1));
        }
      });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Dashboard de Energia</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard
          title="Corrente Atual"
          value={current ?? '...'}
          unit="A"
        />
        <DataCard
          title="Média da Última Hora"
          value={hourlyAvg ?? '...'}
          unit="A"
        />
        <DataCard
          title="Média do Último Dia"
          value={dailyAvg ?? '...'}
          unit="A"
        />
        <DataCard
          title="Média do Último Mês"
          value={monthlyAvg ?? '...'}
          unit="A"
        />
      </div>
    </div>
  );
}

export default App;