import { useState, useEffect } from 'react';
import { DataCard } from '../components/DataCard';
import { VoltageSelector } from '../components/VoltageSelector';
// Importar os componentes de gráficos
import { CurrentRealtimeChart } from '../components/charts/CurrentRealtimeChart';
import { RealtimePowerChart } from '../components/charts/RealtimePowerChart';
import { HistoricalBarChart } from '../components/charts/HistoricalBarChart';
import { 
  getLatestCurrent, 
  getTodaysEnergy,
  getMonthlyEnergy,
  setVoltagePreference,
  getDailyEnergyHistory,
  getMonthlyEnergyHistory
} from '../services/influxService';

const DashboardPage = () => {
  // Estados para os DataCards
  const [current, setCurrent] = useState(null);
  const [voltage, setVoltage] = useState(127);
  const [powerInWatts, setPowerInWatts] = useState(null);
  const [todaysEnergy, setTodaysEnergy] = useState(null);
  const [monthlyEnergy, setMonthlyEnergy] = useState(null);
  
  // Estados para os dados dos gráficos
  const [dailyHistory, setDailyHistory] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);

  const handleVoltageChange = (newVoltage) => {
    setVoltage(newVoltage);
    setVoltagePreference(newVoltage);
  };

  // Efeito para buscar dados em tempo real
  useEffect(() => {
    const fetchRealtime = () => {
      getLatestCurrent().then(latestCurrent => {
        if (latestCurrent && typeof latestCurrent._value === 'number') {
          const currentVal = latestCurrent._value;
          setCurrent(currentVal);
          setPowerInWatts(currentVal * voltage);
        } else {
          setCurrent(0);
          setPowerInWatts(0);
        }
      });
    };
    fetchRealtime();
    const realtimeInterval = setInterval(fetchRealtime, 2000);
    return () => clearInterval(realtimeInterval);
  }, [voltage]);

  // Efeito para buscar dados históricos e agregados
  useEffect(() => {
    const fetchAllData = () => {
      // Dados para os DataCards
      getTodaysEnergy().then(data => setTodaysEnergy(data?._value ?? 0));
      getMonthlyEnergy().then(data => setMonthlyEnergy(data?._value ?? 0));

      // Dados para os gráficos
      getDailyEnergyHistory().then(data => setDailyHistory(data));
      getMonthlyEnergyHistory().then(data => setMonthlyHistory(data));
    };
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 5 * 60 * 1000); // A cada 5 minutos
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <VoltageSelector 
        selectedVoltage={voltage} 
        onVoltageChange={handleVoltageChange} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DataCard title="Potência Instantânea" value={powerInWatts?.toFixed(0) ?? '...'} unit="W" />
        <DataCard title="Corrente Atual" value={current?.toFixed(1) ?? '...'} unit="A" />
        <DataCard title="Consumo de Hoje" value={todaysEnergy?.toFixed(2) ?? '...'} unit="kWh" />
        <DataCard title="Consumo no Mês" value={monthlyEnergy?.toFixed(2) ?? '...'} unit="kWh" />
      </div>

      {/* Grelha para os gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentRealtimeChart />
        <RealtimePowerChart voltage={voltage} />
        <HistoricalBarChart 
          title="Consumo Diário (Últimos 7 Dias)" 
          unit="kWh"
          data={dailyHistory}
          limit={7}
        />
        <HistoricalBarChart 
          title="Consumo Mensal (Últimos 6 Meses)" 
          unit="kWh"
          data={monthlyHistory}
          dateFormat="month"
          limit={6}
        />
      </div>
    </>
  );
};

export default DashboardPage;