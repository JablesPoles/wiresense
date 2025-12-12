import React, { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const TariffSignalCard = () => {
    const { tariffMode, peakStartHour, exchangeRates } = useSettings();
    const [status, setStatus] = useState('off-peak'); // off-peak, intermediate, peak
    const [timeLeft, setTimeLeft] = useState('');

    // Hardcoded for now, should come from settings context ideally
    const PEAK_DURATION = 3;

    const getStatus = () => {
        if (tariffMode !== 'white') return { status: 'conventional', label: 'Convencional', color: 'emerald' };

        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const day = now.getDay(); // 0 = Sun, 6 = Sat

        // Weekends are always Off-Peak
        if (day === 0 || day === 6) return { status: 'off-peak', label: 'Fora de Ponta', color: 'emerald' };

        // Normalize time to minutes for easier comparison
        const currentMinutes = hour * 60 + minute;

        const peakStartMin = peakStartHour * 60;
        const peakEndMin = peakStartMin + (PEAK_DURATION * 60);

        const inter1StartMin = peakStartMin - 60;
        const inter2StartMin = peakEndMin;
        const inter2EndMin = peakEndMin + 60;

        // Check Peak (Ponta)
        if (currentMinutes >= peakStartMin && currentMinutes < peakEndMin) {
            return { status: 'peak', label: 'Ponta (Caro)', color: 'red' };
        }

        // Check Intermediate (Intermediário)
        if ((currentMinutes >= inter1StartMin && currentMinutes < peakStartMin) ||
            (currentMinutes >= inter2StartMin && currentMinutes < inter2EndMin)) {
            return { status: 'intermediate', label: 'Intermediário', color: 'yellow' };
        }

        return { status: 'off-peak', label: 'Fora de Ponta', color: 'emerald' };
    };

    useEffect(() => {
        const update = () => {
            const currentStatus = getStatus();
            setStatus(currentStatus);

            // Calculate time left logic (simplified for now)
            // ... to be implemented if user wants countdown
        };

        update();
        const interval = setInterval(update, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [tariffMode, peakStartHour]);

    if (tariffMode === 'conventional') return null; // Don't show if not in White Tariff mode

    const config = status;

    // Dynamic styles based on status
    const getStyles = () => {
        switch (config.status) {
            case 'peak': return 'bg-red-500/10 border-red-500/30 text-red-500';
            case 'intermediate': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
            case 'off-peak': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
            default: return 'bg-gray-500/10 border-gray-500/30 text-gray-500';
        }
    };

    const getIcon = () => {
        switch (config.status) {
            case 'peak': return <AlertCircle size={32} />;
            case 'intermediate': return <AlertTriangle size={32} />;
            case 'off-peak': return <CheckCircle2 size={32} />;
            default: return <Zap size={32} />;
        }
    };

    const getRecommendation = () => {
        switch (config.status) {
            case 'peak': return "Tarifa mais cara! Evite usar chuveiro, ferro e máquinas agora.";
            case 'intermediate': return "Tarifa subindo. Atenção ao consumo.";
            case 'off-peak': return "Melhor horário para usar eletrodomésticos pesados.";
            default: return "";
        }
    };

    return (
        <div className={`rounded-xl border p-6 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ${getStyles()}`}>
            {/* Glow Effect */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 bg-current`} />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-current bg-opacity-10`}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            Tarifa Branca: {config.label}
                        </h3>
                        <p className="text-sm opacity-90 max-w-[250px]">
                            {getRecommendation()}
                        </p>
                    </div>
                </div>

                {/* Visual Traffic Light (Mini) */}
                <div className="hidden sm:flex flex-col gap-1 bg-black/20 p-1.5 rounded-full border border-white/5">
                    <div className={`w-3 h-3 rounded-full transition-all ${config.status === 'peak' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] scale-110' : 'bg-red-900/30'}`} />
                    <div className={`w-3 h-3 rounded-full transition-all ${config.status === 'intermediate' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)] scale-110' : 'bg-yellow-900/30'}`} />
                    <div className={`w-3 h-3 rounded-full transition-all ${config.status === 'off-peak' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-110' : 'bg-emerald-900/30'}`} />
                </div>
            </div>
        </div>
    );
};
