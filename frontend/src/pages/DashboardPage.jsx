import { useState, useEffect } from 'react';
import { Settings, AlertTriangle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { DataCard } from '../components/DataCard';
import { CurrentRealtimeChart } from '../components/charts/CurrentRealtimeChart';
import { RealtimePowerChart } from '../components/charts/RealtimePowerChart';
import { HistoricalBarChart } from '../components/charts/HistoricalBarChart';
import { 
  getLatestDataPoint, 
  getEnergySummary,
  getDailyEnergyHistory,
  getMonthlyEnergyHistory
} from '../services/apiService';

// FORCANDO A EXECUCAO DO TRIGGER
const DashboardPage = () => {
  const { voltage, tarifaKwh, moeda, setIsSettingsOpen } = useSettings(); 
  const [needsAttention, setNeedsAttention] = useState(false);

  const [current, setCurrent] = useState(null);
  const [powerInWatts, setPowerInWatts] = useState(null);
  const [todaysEnergy, setTodaysEnergy] = useState(null);
  const [monthlyEnergy, setMonthlyEnergy] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [custoHoje, setCustoHoje] = useState(null);
  const [custoMes, setCustoMes] = useState(null);
  const currencySymbols = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' };
  const symbol = currencySymbols[moeda] || '$';

  useEffect(() => {
    const voltageIsConfigured = localStorage.getItem('user_voltage');
    if (!voltageIsConfigured) {
      setNeedsAttention(true);
    }
  }, []);
  
  const openSettings = () => {
    setIsSettingsOpen(true);
    setNeedsAttention(false); 
  }

  useEffect(() => {
    const fetchCurrent = async () => {
      const latestData = await getLatestDataPoint();
      setCurrent(latestData ? latestData.current : 0); 
    };
    fetchCurrent();
    const realtimeInterval = setInterval(fetchCurrent, 5000); 
    return () => clearInterval(realtimeInterval);
  }, []);

  useEffect(() => {
    if (current !== null && voltage !== null) {
      setPowerInWatts(current * voltage);
    } else {
      setPowerInWatts(null);
    }
  }, [current, voltage]);

  // Busca os resumos e históricos (agora da API)
  useEffect(() => {
    const fetchAllData = async () => {
      const summary = await getEnergySummary();
      setTodaysEnergy(summary?.today ?? 0);
      setMonthlyEnergy(summary?.month ?? 0);

      const daily = await getDailyEnergyHistory();
      setDailyHistory(daily); 

      const monthly = await getMonthlyEnergyHistory();
      setMonthlyHistory(monthly);
    };
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (todaysEnergy !== null && tarifaKwh) {
      setCustoHoje((todaysEnergy * tarifaKwh).toFixed(2));
    }
    if (monthlyEnergy !== null && tarifaKwh) {
      setCustoMes((monthlyEnergy * tarifaKwh).toFixed(2));
    }
  }, [todaysEnergy, monthlyEnergy, tarifaKwh]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        
        <div className="flex items-center gap-3">
          {needsAttention && (
            <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
              <AlertTriangle size={16} />
              <span className="text-sm font-semibold hidden sm:inline">Ajuste a voltagem</span>
            </div>
          )}

          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/50">
             <span className="text-sm font-bold text-white">{voltage}V</span>
            <button 
              onClick={openSettings}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white transition-colors"
              aria-label="Abrir configurações"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DataCard title="Potência Instantânea" value={powerInWatts?.toFixed(0) ?? '...'} unit="W" />
        <DataCard title="Corrente Atual" value={current?.toFixed(1) ?? '...'} unit="A" />
        <DataCard 
          title="Consumo de Hoje" 
          value={todaysEnergy?.toFixed(2) ?? '...'} 
          unit="kWh"
          cost={custoHoje ?? '...'}
          currencySymbol={symbol}
        />
        <DataCard 
          title="Consumo no Mês" 
          value={monthlyEnergy?.toFixed(2) ?? '...'} 
          unit="kWh"
          cost={custoMes ?? '...'}
          currencySymbol={symbol}
        />
      </div>
      
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
    </div>
  );
};

export default DashboardPage;