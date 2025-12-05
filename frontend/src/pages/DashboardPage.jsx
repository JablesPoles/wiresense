import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { DataCard } from '../components/DataCard';
import { CurrentRealtimeChart } from '../components/charts/CurrentRealtimeChart';
import { RealtimePowerChart } from '../components/charts/RealtimePowerChart';
import { EnergyHistoryChart } from '../components/charts/EnergyHistoryChart';
import { Link } from 'react-router-dom';
import {
  getLatestDataPoint,
  getRealtimeData,
  getEnergySummary,
  getDailyEnergyHistory
} from '../services/apiService';

const DashboardPage = () => {
  // Pegando configurações do usuário
  const { voltage, tarifaKwh, moeda, setIsSettingsOpen } = useSettings();
  const [needsAttention, setNeedsAttention] = useState(false);

  // Estados para dados em tempo real e históricos
  const [current, setCurrent] = useState(null);
  const [powerInWatts, setPowerInWatts] = useState(null);
  const [todaysEnergy, setTodaysEnergy] = useState(null);
  const [monthlyEnergy, setMonthlyEnergy] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [custoHoje, setCustoHoje] = useState(null);
  const [custoMes, setCustoMes] = useState(null);
  const [realtimeData, setRealtimeData] = useState([]); // Centraliza dados de tempo real

  // Símbolo da moeda
  const currencySymbols = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' };
  const symbol = currencySymbols[moeda] || '$';

  // Verifica se a voltagem foi configurada
  useEffect(() => {
    const voltageIsConfigured = localStorage.getItem('user_voltage');
    if (!voltageIsConfigured) {
      setNeedsAttention(true);
    }
  }, []);

  // Buscar dados de tempo real a cada 5 segundos
  useEffect(() => {
    const fetchRealtime = async () => {
      const latest = await getLatestDataPoint();
      setCurrent(latest ? latest.current : 0);

      const range = await getRealtimeData('2m');
      setRealtimeData(range);
    };

    fetchRealtime();
    const interval = setInterval(fetchRealtime, 5000);
    return () => clearInterval(interval);
  }, []);

  // Buscar resumos e históricos a cada 5 minutos
  useEffect(() => {
    const fetchAggregates = async () => {
      const summary = await getEnergySummary();
      setTodaysEnergy(summary?.today ?? 0);
      setMonthlyEnergy(summary?.month ?? 0);

      const daily = await getDailyEnergyHistory(7); // Last 7 days for summary chart
      setDailyHistory(daily);
    };
    fetchAggregates();
    const intervalId = setInterval(fetchAggregates, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Calcula potência em watts
  useEffect(() => {
    if (current !== null && voltage !== null) {
      setPowerInWatts(current * voltage);
    } else {
      setPowerInWatts(null);
    }
  }, [current, voltage]);

  // Calcula custos com base na tarifa
  useEffect(() => {
    if (todaysEnergy !== null && tarifaKwh) {
      setCustoHoje((todaysEnergy * tarifaKwh).toFixed(2));
    }
    if (monthlyEnergy !== null && tarifaKwh) {
      setCustoMes((monthlyEnergy * tarifaKwh).toFixed(2));
    }
  }, [todaysEnergy, monthlyEnergy, tarifaKwh]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real do seu consumo.</p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-4">
          {needsAttention && (
            <Link to="/settings" className="flex items-center gap-2 text-yellow-400 animate-pulse bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
              <AlertTriangle size={16} />
              <span className="text-xs font-semibold">Configurar sistema</span>
            </Link>
          )}
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Sistema Online
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard title="Potência Agora" value={powerInWatts?.toFixed(0) ?? '...'} unit="W" />
        <DataCard title="Corrente" value={current?.toFixed(1) ?? '...'} unit="A" />
        <DataCard
          title="Consumo (Hoje)"
          value={todaysEnergy?.toFixed(2) ?? '...'}
          unit="kWh"
          cost={custoHoje ?? '...'}
          currencySymbol={symbol}
        />
        <DataCard
          title="Consumo (Mês)"
          value={monthlyEnergy?.toFixed(2) ?? '...'}
          unit="kWh"
          cost={custoMes ?? '...'}
          currencySymbol={symbol}
        />
      </div>

      {/* Gráficos em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentRealtimeChart data={realtimeData} />
        <RealtimePowerChart voltage={voltage} data={realtimeData} />
      </div>

      {/* Resumo Histórico Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnergyHistoryChart data={dailyHistory} type="daily" />
        </div>
        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4">
          <div className="p-4 bg-primary/20 rounded-full text-primary">
            <TrendingUp size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Análise Rápida</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Seu consumo está estável hoje. Verifique o histórico completo para mais detalhes.
            </p>
          </div>
          <Link to="/history" className="text-sm font-medium text-primary hover:underline">
            Ver histórico completo &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
