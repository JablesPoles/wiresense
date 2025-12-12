import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudRain, Sun, CloudLightning, Wind, Thermometer, MapPin, Moon, CloudMoon, Bell, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';
import { useSmartTips } from '../../hooks/useSmartTips';
import { useNotifications } from '../../contexts/NotificationContext';

export const SmartWeatherCard = ({
    weather,
    loading: weatherLoading,
    locationName,
    handleManualSearch,
    isSearching,
    searchQuery,
    setSearchQuery,
    setIsSearching,
    // Context for Tips
    tariffStatus,
    power,
    isSolar,
    voltage,
    monthlyCost,
    budgetLimit
}) => {

    // --- Weather Logic ---
    const getWeatherIcon = (code, isDay) => {
        const size = 48; // Larger icon
        if (code === 0) return isDay ? <Sun className="text-amber-400 drop-shadow-lg" size={size} /> : <Moon className="text-blue-200 drop-shadow-lg" size={size} />;
        if (code >= 1 && code <= 3) return isDay ? <Cloud className="text-gray-200 drop-shadow-lg" size={size} /> : <CloudMoon className="text-gray-400 drop-shadow-lg" size={size} />;
        if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400 drop-shadow-lg" size={size} />;
        if (code >= 95) return <CloudLightning className="text-purple-400 drop-shadow-lg" size={size} />;
        return <Sun className="text-amber-400 drop-shadow-lg" size={size} />;
    };

    const getConditionText = (code) => {
        if (code === 0) return "Céu Limpo";
        if (code >= 1 && code <= 3) return "Parcialmente Nublado";
        if (code >= 51 && code <= 67) return "Chuva";
        if (code >= 95) return "Tempestade";
        return "Normal";
    };

    // --- Smart Tips Logic ---
    const tips = useSmartTips({
        weather, tariffStatus, power, isSolar, voltage, monthlyCost, budgetLimit
    });

    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    // Refs to hold latest values without triggering re-renders in useEffect
    const tipsRef = React.useRef(tips);
    const indexRef = React.useRef(currentTipIndex);

    // Update refs whenever state changes
    useEffect(() => {
        tipsRef.current = tips;
    }, [tips]);

    useEffect(() => {
        indexRef.current = currentTipIndex;
    }, [currentTipIndex]);

    // --- Robust Rotation Logic ---
    useEffect(() => {
        // If we don't have enough tips to rotate, stop.
        if (tips.length <= 1) return;

        const tick = () => {
            const currentTips = tipsRef.current;
            const currentIndex = indexRef.current;

            // Determine duration based on CURRENT tip priority
            const currentPriority = currentTips[currentIndex]?.priority;
            const duration = (currentPriority === 'critical' || currentPriority === 'warning') ? 15000 : 8000;

            const nextIndex = (currentIndex + 1) % currentTips.length;

            // Allow time for user to read before switching
            // We use a recursive setTimeout pattern for variable duration
            timeoutRef.current = setTimeout(() => {
                setCurrentTipIndex(nextIndex);
                // The state update will trigger re-render -> update ref -> effect re-runs?
                // No, we need to manually trigger next loop if we use useEffect([]) or similar.
                // BEST APPROACH: Just use standard effect that depends on Index but is CLEAN.
            }, duration);
        };

        // Start the cycle
        // We need to clear previous timeout if index changes to avoid double-firing
        // But we want the duration to be based on the *current* tip.

        // Let's execute the logic:
        const currentPriority = tips[currentTipIndex]?.priority;
        const duration = (currentPriority === 'critical' || currentPriority === 'warning') ? 15000 : 8000;

        const timer = setTimeout(() => {
            setCurrentTipIndex(prev => (prev + 1) % tips.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentTipIndex, tips.length]); // Depend on index (to schedule next) and length (to handle empty/single).
    // Note: We intentionally exclude 'tips' content to avoid resetting the timer when data updates.
    // relying on 'tipsRef' inside a setState function or similar isn't needed if we just schedule next switch.
    // Effect re-runs when index changes. Timer is set.
    // IF 'tips' updates mid-wait, 'tips.length' might change.
    // If 'tips.length' changes, effect re-runs, resetting timer. 
    // THIS IS THE BUG! If activeTips changes every 5s, the timer resets every 5s.
    // User stuck on Tip 0 if updates < 8s.

    // FIX: Ref-based timer that ignores props updates.
    const timeoutRef = React.useRef(null);

    useEffect(() => {
        const scheduleNext = () => {
            const currentTips = tipsRef.current;
            const currentIndex = indexRef.current;

            if (currentTips.length <= 1) return;

            const currentPriority = currentTips[currentIndex]?.priority;
            const duration = (currentPriority === 'critical' || currentPriority === 'warning') ? 15000 : 8000;

            timeoutRef.current = setTimeout(() => {
                setCurrentTipIndex(prev => (prev + 1) % tipsRef.current.length);
                // We don't need to recursively call here because state update triggers this effect? 
                // No, we want this effect to run ONCE and manage its own recursive timeout loop if possible,
                // OR allow the state change to trigger a simple effect.
                // But we want to IGNORE external prop changes.
            }, duration);
        };

        // Clear existing
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Schedule next
        scheduleNext();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentTipIndex]); // DEPEND ONLY ON INDEX.
    // Since 'tips' is not a dependency, this effect WON'T re-run when tips change.
    // It only re-runs when we actually switch tips.
    // This solves the 'stuck' issue caused by frequent data updates.
    // Note: If tips update but index doesn't change, we effectively keep the old timer. 
    // This is DESIRED to prevent the "reset every 5s" bug.
    // However, if the priority of the *displayed* tip changes mid-view (rare, same ID), we might want to extend? 
    // For now, ignoring mid-view priority changes is fine to fix the "stuck" bug.

    // Safe access
    const currentTip = tips[currentTipIndex] || { message: "Analisando sistema...", icon: Zap, priority: 'info', color: "blue" };

    // Duration for animation sync
    const animationDuration = (currentTip.priority === 'critical' || currentTip.priority === 'warning') ? 15 : 8;

    // Dynamic Gradient based on Tip Priority
    const getGradient = (priority) => {
        switch (priority) {
            case 'critical': return "from-red-600/30 via-red-900/20 to-transparent"; // More intense red
            case 'warning': return "from-amber-600/30 via-amber-900/20 to-transparent";
            case 'success': return "from-emerald-600/30 via-emerald-900/20 to-transparent";
            default: return "from-blue-600/30 via-blue-900/20 to-transparent";
        }
    };

    const getBorderColor = (priority) => {
        switch (priority) {
            case 'critical': return "border-red-500/50 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]"; // Glow effect
            case 'warning': return "border-amber-500/50 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]";
            case 'success': return "border-emerald-500/50";
            default: return "border-white/10";
        }
    };

    const getIconColor = (priority) => {
        switch (priority) {
            case 'critical': return "text-red-400 bg-red-950/30";
            case 'warning': return "text-amber-400 bg-amber-950/30";
            case 'success': return "text-emerald-400 bg-emerald-950/30";
            default: return "text-blue-400 bg-blue-950/30";
        }
    };

    // --- Notification Integration ---
    // Trigger system notifications for Critical/Important tips
    const { addNotification } = useNotifications();
    const lastNotifiedTipIdRef = React.useRef(null);

    useEffect(() => {
        if (!currentTip || !currentTip.priority) return;

        // Only notify for Critical or specific Warning tips
        const shouldNotify = currentTip.priority === 'critical' || currentTip.id === 'good_solar' || currentTip.id === 'solar_momentum';

        if (shouldNotify && lastNotifiedTipIdRef.current !== currentTip.id) {

            // Determine Action Link
            let actionLink = null;
            if (currentTip.id.includes('budget')) actionLink = '/settings';
            if (currentTip.id.includes('tariff') || currentTip.id.includes('peak')) actionLink = '/settings'; // Or tariff page if it existed
            if (currentTip.id.includes('solar') || currentTip.id.includes('load')) actionLink = '/'; // Dashboard

            addNotification({
                title: currentTip.priority === 'critical' ? 'Alerta Crítico' : 'Oportunidade',
                message: currentTip.message,
                type: currentTip.priority === 'critical' ? 'alert' : 'success',
                actionLink: actionLink
            });

            lastNotifiedTipIdRef.current = currentTip.id;
        }
    }, [currentTip, addNotification]);

    return (
        <div className={`
            bg-card/40 backdrop-blur-xl rounded-3xl relative overflow-hidden group border transition-all duration-1000
            ${getBorderColor(currentTip.priority)}
        `}>
            {/* Dynamic Background Gradient */}
            <motion.div
                animate={{ opacity: 1 }}
                key={currentTip.priority} // Re-render gradient on priority change
                initial={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className={`absolute inset-0 bg-gradient-to-br ${getGradient(currentTip.priority)}`}
            />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">

                {/* --- TOP: Weather Hero --- */}
                <div className="flex justify-between items-start p-6 pb-2">
                    <div>
                        {/* Location / Search */}
                        <div className="relative z-20 mb-1">
                            {isSearching ? (
                                <form onSubmit={handleManualSearch} className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="bg-black/40 border border-white/20 rounded-lg px-3 py-1 text-sm text-white w-48 focus:outline-none focus:border-primary shadow-lg"
                                        placeholder="Cidade..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Escape') setIsSearching(false); }}
                                    />
                                </form>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsSearching(true)}
                                    className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground hover:text-white uppercase transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-white/5"
                                >
                                    <MapPin size={12} /> {weatherLoading ? "..." : locationName}
                                </motion.button>
                            )}
                        </div>

                        {/* Temp & Condition */}
                        <div className="flex flex-col">
                            {weatherLoading ? (
                                <Skeleton className="h-16 w-32 mb-2" />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-baseline gap-2"
                                >
                                    <span className="text-6xl font-bold text-white tracking-tighter">
                                        {weather ? Math.round(weather.current.temperature_2m) : '--'}°
                                    </span>
                                </motion.div>
                            )}

                            {!weatherLoading && weather && (
                                <p className="text-lg text-gray-300 font-medium">
                                    {getConditionText(weather.current.weather_code)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Weather Icon (Right) */}
                    <div className="pt-2 pr-2">
                        {weatherLoading ? (
                            <Skeleton className="h-16 w-16 rounded-full" />
                        ) : (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                {weather && getWeatherIcon(weather.current.weather_code, weather.current.is_day)}
                            </motion.div>
                        )}
                        {!weatherLoading && weather && (
                            <div className="mt-4 flex flex-col items-end gap-1 text-xs text-muted-foreground w-full">
                                <span className="flex items-center gap-1"><Wind size={12} /> {weather.current.wind_speed_10m} km/h</span>
                                <span className="flex items-center gap-1"><Thermometer size={12} /> Max {Math.round(weather.daily.temperature_2m_max[0])}°</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider with Glow */}
                <div className="relative h-px w-full my-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                {/* --- BOTTOM: Smart Tip Hero --- */}
                <div className="flex-1 p-5 flex items-center min-h-[140px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTip.id || currentTipIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="flex gap-5 w-full items-center"
                        >
                            {/* Big Icon Container */}
                            <div className={`
                                h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/5
                                backdrop-blur-md transition-colors duration-500
                                ${getIconColor(currentTip.priority)}
                                ${currentTip.priority === 'critical' ? 'animate-[pulse_2s_infinite]' : ''}
                            `}>
                                <currentTip.icon size={28} strokeWidth={1.5} />
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {currentTip.priority === 'critical' && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-lg shadow-red-900/50 uppercase tracking-wide animate-pulse">
                                            <AlertTriangle size={10} className="fill-current" /> Alta Prioridade
                                        </span>
                                    )}
                                    {currentTip.priority === 'warning' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/20 uppercase tracking-wide">Atenção</span>}
                                    {currentTip.priority === 'success' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 uppercase tracking-wide">Oportunidade</span>}
                                    {!currentTip.priority || currentTip.priority === 'info' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 border border-blue-500/20 uppercase tracking-wide">Dica</span>}
                                </div>
                                <p className={`text-base font-medium leading-snug transition-colors duration-300 ${currentTip.priority === 'critical' ? 'text-white' : 'text-white/90'}`}>
                                    {currentTip.message}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress Bar (Bottom Edge) */}
                {tips.length > 1 && (
                    <div className="h-1 w-full bg-black/20">
                        <motion.div
                            key={currentTipIndex} // Reset animation on change
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: animationDuration, ease: "linear" }}
                            className={`h-full opacity-50 ${currentTip.priority === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                                currentTip.priority === 'success' ? 'bg-emerald-500' :
                                    currentTip.priority === 'warning' ? 'bg-amber-500' :
                                        'bg-blue-500'
                                }`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
