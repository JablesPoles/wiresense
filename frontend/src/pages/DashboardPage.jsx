import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Sun, Zap } from 'lucide-react';
import { useSettings, useDeviceSettings } from '../contexts/SettingsContext';
import { useDevice } from '../contexts/DeviceContext'; // Import Device Context
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
import { Skeleton } from '../components/common/Skeleton';


const DashboardPage = () => {
  const { currentDeviceId, isGenerator } = useDevice();

  // Device configuration settings
  const { voltage, tarifaKwh, moeda, budgetLimit } = useDeviceSettings(currentDeviceId);

  const symbol = moeda === 'BRL' ? 'R$' : (moeda === 'EUR' ? '€' : '$');

  // Realtime and historical data states
  const [current, setCurrent] = useState(null);
  const [powerInWatts, setPowerInWatts] = useState(null);
  const [todaysEnergy, setTodaysEnergy] = useState(null);
  const [monthlyEnergy, setMonthlyEnergy] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [custoHoje, setCustoHoje] = useState(null);
  const [custoMes, setCustoMes] = useState(null);
  const [realtimeData, setRealtimeData] = useState([]);

  const [needsAttention, setNeedsAttention] = useState(false);

  // Theme Logic - Dual Colors
  const isSolar = isGenerator;
  // Generator: Emerald (Primary) & Amber/Gold (Secondary)
  // Consumer: Cyan (Primary) & Violet/Purple (Secondary)
  const themeColor = isSolar ? 'emerald' : 'cyan';
  const themeHex = isSolar ? '#10b981' : '#06b6d4';
  const secondaryHex = isSolar ? '#fbbf24' : '#8b5cf6'; // Gold vs Purple
  const ThemeIcon = isSolar ? Sun : Zap;

  const bgGradient = isSolar
    ? "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1), transparent 50%)" // Emerald + Gold hints
    : "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1), transparent 50%)"; // Cyan + Purple hints

  // Helper for budget progress
  const getBudgetProgress = () => {
    if (!budgetLimit || !custoMes) return 0;
    return Math.min((parseFloat(custoMes) / budgetLimit) * 100, 100);
  };

  const progressColor = () => {
    if (isGenerator) return 'bg-amber-500'; // Gold for earnings progress
    const p = getBudgetProgress();
    if (p < 70) return 'bg-emerald-500';
    if (p < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Data fetching effect with polling
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [latest, realtime, summary, daily] = await Promise.all([
          getLatestDataPoint(currentDeviceId),
          getRealtimeData(currentDeviceId),
          getEnergySummary(currentDeviceId),
          getDailyEnergyHistory(7, currentDeviceId) // Fix: Pass limit first
        ]);

        if (!isMounted) return;

        if (latest) {
          setCurrent(latest.current);
          let pwr = latest.power;
          // If power is not directly returned, use V*A:
          if (pwr === undefined && voltage) {
            pwr = latest.current * voltage;
          }
          setPowerInWatts(pwr);
        }

        if (realtime) setRealtimeData(realtime);

        if (summary) {
          setTodaysEnergy(summary.today);
          setMonthlyEnergy(summary.month);
          // Calculate costs
          if (tarifaKwh) {
            setCustoHoje((summary.today * tarifaKwh).toFixed(2));
            setCustoMes((summary.month * tarifaKwh).toFixed(2));
          }
        }

        if (daily) setDailyHistory(daily);

      } catch (error) {
        if (isMounted) console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentDeviceId, voltage, tarifaKwh]);

  // Check for settings needs
  useEffect(() => {
    if (!voltage || !tarifaKwh) {
      setNeedsAttention(true);
    } else {
      setNeedsAttention(false);
    }
  }, [voltage, tarifaKwh]);

  return (
    <div
      key={currentDeviceId}
      className="space-y-8 relative" // Removed animate-in
    >
      {/* Ambient Background Glow - Enhanced */}
      <div
        className="fixed inset-0 h-full w-full pointer-events-none -z-10" // Removed transition/opacity delay
        style={{ background: bgGradient, opacity: 0.6 }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Dashboard
            <span
              className={`text-sm px-3 py-1 rounded-full border backdrop-blur-md ${isSolar ? 'bg-emerald-500/10 border-amber-500/20 text-emerald-400 shadow-emerald-900/20' : 'bg-cyan-500/10 border-violet-500/20 text-cyan-400 shadow-cyan-900/20'} shadow-lg`}
            >
              {isSolar ? 'Produção' : 'Consumo'}
            </span>
          </h1>
          <p className="text-muted-foreground">
            {isSolar ? 'Monitoramento da sua usina solar em tempo real.' : 'Monitoramento do consumo elétrico da residência.'}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-4">
          {needsAttention && (
            <Link to="/settings" className="flex items-center gap-2 text-red-400 animate-pulse bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
              <AlertTriangle size={16} />
              <span className="text-xs font-semibold">Configurar sistema</span>
            </Link>
          )}
          <div className={`px-3 py-1.5 rounded-full border backdrop-blur-md transition-colors duration-500 ${isSolar ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'} text-xs font-medium flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${isSolar ? 'bg-emerald-500' : 'bg-cyan-500'} animate-pulse shadow-[0_0_8px] ${isSolar ? 'shadow-amber-500' : 'shadow-violet-500'}`} />
            Sistema Online
          </div>
        </div>
      </div>

      {/* Budget Goal Progress - Adjusted label if generator */}
      {budgetLimit > 0 && custoMes !== null && (
        <div className={`mt-6 bg-card border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden transition-colors duration-500 ${isSolar ? 'border-emerald-500/20' : 'border-cyan-500/20'}`}>
          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${isSolar ? 'from-emerald-500 to-amber-400' : 'from-cyan-500 to-violet-500'}`} />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">
                {isSolar ? 'Meta de Geração Mensal' : 'Orçamento Mensal Utilizado'}
              </span>
              <span className="font-bold text-foreground">
                {Math.floor(getBudgetProgress())}% <span className="text-muted-foreground font-normal">({symbol} {custoMes} / {budgetLimit})</span>
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor()} transition-all duration-1000 ease-out`}
                style={{ width: `${getBudgetProgress()}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard
          title="Potência Agora"
          value={powerInWatts !== null ? powerInWatts.toFixed(0) : <Skeleton className="h-8 w-24" />}
          unit={powerInWatts !== null ? "W" : ""}
          className={isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50"}
          currencySymbol={symbol} // Not used but prop passed
        />
        <DataCard
          title="Corrente"
          value={current !== null ? current.toFixed(1) : <Skeleton className="h-8 w-24" />}
          unit={current !== null ? "A" : ""}
          className={isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50"}
        />
        <DataCard
          title={isSolar ? "Geração (Hoje)" : "Consumo (Hoje)"}
          value={todaysEnergy !== null ? todaysEnergy.toFixed(2) : <Skeleton className="h-8 w-24" />}
          unit={todaysEnergy !== null ? "kWh" : ""}
          cost={custoHoje ?? '...'}
          costLabel={isSolar ? "Economia" : "Custo"}
          currencySymbol={symbol}
          className={isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50"}
        />
        <DataCard
          title={isSolar ? "Geração (Mês)" : "Consumo (Mês)"}
          value={monthlyEnergy !== null ? monthlyEnergy.toFixed(2) : <Skeleton className="h-8 w-24" />}
          unit={monthlyEnergy !== null ? "kWh" : ""}
          cost={custoMes ?? '...'}
          costLabel={isSolar ? "Economia" : "Custo"}
          currencySymbol={symbol}
          className={isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50"}
        />
      </div>

      {/* Gráficos em Tempo Real */}
      <div className="grid grid-cols-1 gap-6">
        <CurrentRealtimeChart data={realtimeData} color={themeHex} />
        <RealtimePowerChart voltage={voltage} data={realtimeData} color={secondaryHex} />
      </div>

      {/* Recent History Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnergyHistoryChart data={dailyHistory} type="daily" color={themeHex} label={isSolar ? 'Geração' : 'Consumo'} />
        </div>
        <div className={`bg-gradient-to-br ${isSolar ? 'from-emerald-500/10 to-amber-500/5 border-emerald-500/20' : 'from-cyan-500/10 to-violet-500/5 border-cyan-500/20'} border rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4 transition-colors duration-300`}>
          <div className={`p-4 ${isSolar ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]'} rounded-full transition-all duration-300`}>
            <ThemeIcon size={32} className={isSolar ? 'text-amber-400' : 'text-violet-400'} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Análise Rápida</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isSolar
                ? "Sua produção solar está excelente hoje. O pico de geração correu bem."
                : "Seu consumo está dentro do esperado para o horário."
              }
            </p>
          </div>
          <Link to="/history" className={`text-sm font-medium ${isSolar ? 'text-emerald-400 hover:text-amber-400' : 'text-cyan-400 hover:text-violet-400'}`}>
            Ver histórico completo &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
