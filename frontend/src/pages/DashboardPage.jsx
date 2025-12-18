import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Sun, Zap, Calendar, Activity } from 'lucide-react';

const DEFAULT_LAT = -23.5505;
const DEFAULT_LON = -46.6333;
import { useDeviceSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDevice } from '../contexts/DeviceContext'; // Import Device Context
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
import { TariffSignalCard } from '../components/dashboard/TariffSignalCard';
import { SmartWeatherCard } from '../components/dashboard/SmartWeatherCard';
import { CSVExportButton } from '../components/common/CSVExportButton';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';


import { useAchievements } from '../contexts/AchievementsContext';

import { useLanguage } from '../contexts/LanguageContext';

const DashboardPage = () => {
  const { currentDeviceId, isGenerator, simulationMode, activeSimulations, totalSimulatedWatts, stopSimulation, getSimulatedReading } = useDevice();

  const { updateStat } = useAchievements();
  const { t } = useLanguage();

  // "Hello World" Badge - Visit Dashboard
  useEffect(() => {
    updateStat('visitedDashboard', true);
  }, [updateStat]);

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

  // Weather State
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState(null); // Init null, prioritize fetch or default in render
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



  const fetchWeather = async (lat, lon, placeName = null) => {
    setLoading(true);
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error('Weather API Error');
      const weatherData = await weatherRes.json();

      let city = placeName;
      if (!city) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
            { headers: { 'User-Agent': 'WiresenseEnergyMonitor/1.0' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            city = geoData.address.city || geoData.address.town || geoData.address.municipality || t('unknown_location');
          }
        } catch {
          city = t('unknown_location');
        }
      }
      setWeather(weatherData);
      setLocationName(city || t('current_location'));
      // Save persistence
      if (placeName) {
        localStorage.setItem('wiresense_weather_lat', lat);
        localStorage.setItem('wiresense_weather_lon', lon);
        localStorage.setItem('wiresense_weather_city', placeName);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=pt&format=json`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        await fetchWeather(place.latitude, place.longitude, place.name);
        setIsSearching(false);
      } else {
        alert(t('location_not_found'));
        setLoading(false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedLat = localStorage.getItem('wiresense_weather_lat');
    const savedLon = localStorage.getItem('wiresense_weather_lon');
    const savedCity = localStorage.getItem('wiresense_weather_city');

    if (savedLat && savedLon) {
      fetchWeather(parseFloat(savedLat), parseFloat(savedLon), savedCity);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
          () => fetchWeather(DEFAULT_LAT, DEFAULT_LON)
        );
      } else {
        fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      }
    }
  }, []);

  // Realtime Data Monitoring (Fast Poll)
  useEffect(() => {
    let isMounted = true;

    const fetchRealtime = async () => {
      if (!isMounted) return;

      try {
        if (simulationMode) {
          // --- SIMULATION MODE ---
          // Use fluctuating reading for realism
          const fluctuatingPower = getSimulatedReading();

          setPowerInWatts(fluctuatingPower);
          const simCurrent = voltage ? fluctuatingPower / voltage : 0;
          setCurrent(simCurrent);

          setRealtimeData(prev => {
            const newPoint = {
              time: new Date().toISOString(),
              value: fluctuatingPower,
              voltage: voltage || 127,
              current: simCurrent
            };
            return [...prev.slice(-19), newPoint];
          });
        } else {
          // --- REAL MODE ---
          const [latest, realtime] = await Promise.all([
            getLatestDataPoint(currentDeviceId),
            getRealtimeData(currentDeviceId)
          ]);

          if (isMounted && latest) {
            setCurrent(latest.current);
            let pwr = latest.power;
            if (pwr === undefined && voltage) pwr = latest.current * voltage;
            setPowerInWatts(pwr);
          }
          if (isMounted && realtime) setRealtimeData(realtime);
        }
      } catch (error) {
        console.error("Realtime fetch error:", error);
      }
    };

    fetchRealtime();
    const interval = setInterval(fetchRealtime, simulationMode ? 1000 : 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [currentDeviceId, voltage, simulationMode, getSimulatedReading]);


  // History & Summary Data (Slow Poll)
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      // Only set loading on first mount or if data empty, to avoid flashing on poll
      if (dailyHistory.length === 0) setHistoryLoading(true);

      if (!isMounted) return;
      try {
        const [summary, daily] = await Promise.all([
          getEnergySummary(currentDeviceId),
          getDailyEnergyHistory(7, currentDeviceId)
        ]);

        if (isMounted) {
          if (summary) {
            setTodaysEnergy(summary.today);
            setMonthlyEnergy(summary.month);
            if (tarifaKwh) {
              setCustoHoje((summary.today * tarifaKwh).toFixed(2));
              setCustoMes((summary.month * tarifaKwh).toFixed(2));
            }
          }
          if (daily) setDailyHistory(daily);
        }
      } catch (error) {
        console.error("History fetch error:", error);
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 60000); // Update every minute
    return () => { isMounted = false; clearInterval(interval); };
  }, [currentDeviceId, tarifaKwh]);

  // Theme Logic - Dynamic from Context
  const isSolar = isGenerator;
  const { theme } = useTheme();

  let currentMode = 'consumer';
  if (simulationMode) currentMode = 'simulator';
  else if (isSolar) currentMode = 'generator';

  const modeData = theme?.modes?.[currentMode] || theme?.modes?.consumer;

  // Colors for Charts
  const themeHex = modeData?.primary || '#06b6d4';
  const secondaryHex = modeData?.secondary || '#8b5cf6';

  let ThemeIcon = Zap;
  if (currentMode === 'generator') ThemeIcon = Sun;
  if (currentMode === 'consumer') ThemeIcon = Zap;
  if (currentMode === 'simulator') ThemeIcon = Zap; // Or Activity

  // Calculate Projections
  const projectedHourlyCost = totalSimulatedWatts ? (totalSimulatedWatts / 1000) * (tarifaKwh || 0) : 0;
  const projectedDailyCost = projectedHourlyCost * 24;
  const projectedDailyKwh = totalSimulatedWatts ? (totalSimulatedWatts / 1000) * 24 : 0;
  const projectedMonthlyCost = projectedHourlyCost * 24 * 30; // Assuming 24/7 run for scenario
  const projectedMonthlyKwh = totalSimulatedWatts ? (totalSimulatedWatts / 1000) * 24 * 30 : 0;

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

  // Check for settings needs
  useEffect(() => {
    if (!voltage || !tarifaKwh) {
      setNeedsAttention(true);
    } else {
      setNeedsAttention(false);
    }
  }, [voltage, tarifaKwh]);

  return (
    <PageTransition
      className="space-y-8 relative min-h-screen"
    >
      {/* Simulation Background Overlay */}
      {simulationMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            {t('dashboard')}
            <span
              className={`text-xs px-3 py-1 rounded-full border font-medium inline-flex items-center justify-center backdrop-blur-md transition-colors ${simulationMode
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-amber-900/20'
                : (isSolar ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-900/20' : 'bg-cyan-500/10 border-violet-500/20 text-cyan-500 shadow-cyan-900/20')
                } shadow-sm`}
            >
              {simulationMode ? t('simulation_mode') : (isSolar ? t('generator') : t('consumer'))}
            </span>
          </h1>
          <p className="text-muted-foreground">
            {simulationMode
              ? t('test_env_desc')
              : (isSolar ? t('solar_monitoring_desc') : t('consumption_monitoring_desc'))}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-4">
          {needsAttention && (
            <Link to="/settings" className="flex items-center gap-2 text-white animate-pulse bg-red-500 px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">
              <AlertTriangle size={16} />
              <span className="text-xs font-semibold">{t('configure_system')}</span>
            </Link>
          )}
          <div className={`px-3 py-1.5 rounded-full border backdrop-blur-md transition-colors duration-500 ${simulationMode
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            : (isSolar ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500')
            } text-xs font-medium flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${simulationMode
              ? 'bg-amber-500 animate-pulse'
              : (isSolar ? 'bg-emerald-500' : 'bg-cyan-500')
              } flex-shrink-0 animate-pulse shadow-[0_0_8px] ${simulationMode ? 'shadow-amber-500'
                : (isSolar ? 'shadow-amber-500' : 'shadow-violet-500')
              }`} />
            {simulationMode ? t('simulation_mode') : t('system_online')}
          </div>
        </div>
      </div>

      {/* Simulation Banner */}
      {simulationMode && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="w-full py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-yellow-500">
                  {t('simulation_active_banner')}: {activeSimulations.length} {t('devices_active')} ({totalSimulatedWatts}W)
                </span>
                <span className="text-xs text-yellow-500/70">
                  {activeSimulations.slice(0, 3).map(s => s.name).join(', ')} {activeSimulations.length > 3 ? '...' : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/simulator" className="text-xs bg-black/20 hover:bg-black/30 px-3 py-2 rounded font-medium transition-colors border border-white/10">
                {t('manage')}
              </Link>
              <button
                onClick={stopSimulation}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-2 rounded font-medium transition-colors"
                title="Stop All"
              >
                {t('stop_all')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Budget Goal Progress - Adjusted label if generator */}
      {budgetLimit > 0 && custoMes !== null && (
        <div className={`mt-6 bg-card border p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden transition-colors duration-500 ${simulationMode ? 'border-amber-500/20' : (isSolar ? 'border-emerald-500/20' : 'border-cyan-500/20')
          }`}>
          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${simulationMode ? 'from-amber-500 to-red-500' : (isSolar ? 'from-emerald-500 to-amber-400' : 'from-cyan-500 to-violet-500')
            }`} />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">
                {isSolar ? t('monthly_goal') : t('monthly_budget')}
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
        {/* Power Card */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md relative overflow-hidden group transition-all duration-300 ${simulationMode
          ? "border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50"
          : (isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50")
          }`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('power_now')}</h3>
            <Zap size={16} className={simulationMode ? "text-amber-500" : (isSolar ? "text-amber-500" : "text-violet-500")} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              {powerInWatts !== null ? powerInWatts.toFixed(0) : <Skeleton className="h-8 w-24" />}
            </span>
            <span className="text-xs text-muted-foreground">{powerInWatts !== null ? "W" : ""}</span>
          </div>
        </div>

        {/* Current Card */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md relative overflow-hidden group transition-all duration-300 ${simulationMode
          ? "border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50"
          : (isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50")
          }`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('current')}</h3>
            <TrendingUp size={16} className={simulationMode ? "text-amber-500" : (isSolar ? "text-amber-500" : "text-violet-500")} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              {current !== null ? current.toFixed(1) : <Skeleton className="h-8 w-24" />}
            </span>
            <span className="text-xs text-muted-foreground">{current !== null ? "A" : ""}</span>
          </div>
        </div>

        {/* Today Energy / Virtual Meter */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md relative overflow-hidden group transition-all duration-300 ${simulationMode
          ? "border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50"
          : (isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50")
          }`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {simulationMode ? (
                <>
                  <span className="text-yellow-500 animate-pulse">●</span> {t('estimate_day')}
                </>
              ) : (
                isSolar ? t('generation_today') : t('consumption_today')
              )}
            </h3>
            {simulationMode ? (
              <Activity size={16} className="text-amber-500" />
            ) : (
              // Use Sun for Solar, Zap for Consumer
              isSolar ? (
                <Sun size={16} className="text-emerald-500" />
              ) : (
                <Zap size={16} className="text-cyan-500" />
              )
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">
                {simulationMode ? (
                  projectedDailyKwh.toFixed(1)
                ) : (
                  todaysEnergy !== null ? todaysEnergy.toFixed(2) : <Skeleton className="h-8 w-24" />
                )}
              </span>
              <span className="text-xs text-muted-foreground">kWh</span>
            </div>
            {(custoHoje || simulationMode) && (
              <p className="text-xs text-muted-foreground mt-1">
                {isSolar ? t('savings') : t('cost')}: <span className={isSolar ? "text-emerald-400" : "text-cyan-400"}>
                  {symbol} {simulationMode ? projectedDailyCost.toFixed(2) : custoHoje}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Month Energy / Projection */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md relative overflow-hidden group transition-all duration-300 ${simulationMode
          ? "border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50"
          : (isSolar ? "border-emerald-500/30 bg-emerald-950/5 hover:border-amber-500/50" : "border-cyan-500/30 bg-cyan-950/5 hover:border-violet-500/50")
          }`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {simulationMode ? (
                <>
                  <span className="text-amber-500 animate-pulse">●</span> {t('estimate_month')}
                </>
              ) : (isSolar ? t('generation_month') : t('consumption_month'))}
            </h3>
            {simulationMode ? (
              <Calendar size={16} className="text-amber-500" />
            ) : (
              // Use Calendar for Consumer/Solar Month to distinguish from Instant Power
              <Calendar size={16} className={isSolar ? "text-emerald-500" : "text-cyan-500"} />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">
                {simulationMode
                  ? projectedMonthlyKwh.toFixed(0) // Show projected kWh
                  : (monthlyEnergy !== null ? monthlyEnergy.toFixed(2) : <Skeleton className="h-8 w-24" />)
                }
              </span>
              <span className="text-xs text-muted-foreground">kWh</span>
            </div>
            {(custoMes || simulationMode) && (
              <p className="text-xs text-muted-foreground mt-1">
                {isSolar ? t('savings') : t('cost')}: <span className={simulationMode ? "text-amber-400" : (isSolar ? "text-emerald-400" : "text-cyan-400")}>
                  {symbol} {simulationMode ? projectedMonthlyCost.toFixed(2) : custoMes}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos em Tempo Real */}
      <div className="grid grid-cols-1 gap-6">
        <CurrentRealtimeChart data={realtimeData} color={themeHex} />
        <RealtimePowerChart voltage={voltage} data={realtimeData} color={secondaryHex} />
      </div>

      {/* Recent History Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative">
          {historyLoading ? (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm h-[350px] animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">{t('loading')}</span>
              </div>
            </div>
          ) : (
            <EnergyHistoryChart data={dailyHistory} type="daily" color={themeHex} label={isSolar ? t('generation') : t('consumption')} />
          )}
        </div>

        {/* New Dedicated AI Component */}
        <div className="space-y-6">
          <TariffSignalCard />

          <SmartWeatherCard
            weather={weather}
            loading={loading}
            locationName={locationName || t('current_location')}
            handleManualSearch={handleManualSearch}
            isSearching={isSearching}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsSearching={setIsSearching}
            // Data Props
            power={powerInWatts}
            isSolar={isSolar}
            voltage={voltage}
            monthlyCost={custoMes}
            budgetLimit={budgetLimit}
            tariffStatus="off-peak"
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
