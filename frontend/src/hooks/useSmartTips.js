import { useState, useEffect, useMemo } from 'react';
import {
    CloudRain, Sun, AlertTriangle, Thermometer, Moon, Zap,
    Wind, DollarSign, Calendar, Smile, Droplets
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const useSmartTips = ({
    weather,
    tariffStatus, // 'peak', 'intermediate', 'off-peak'
    power, // current watts
    isSolar,
    voltage,
    monthlyCost,
    budgetLimit
}) => {
    const { t } = useLanguage();
    const [activeTips, setActiveTips] = useState([]);

    // --- Static / Educational Tips Pool (Stable) ---
    const educationalTips = useMemo(() => {
        const pool = [
            { id: 'edu_led', message: t('tip_edu_led'), icon: Zap, priority: 'info', color: 'blue' },
            { id: 'edu_standby', message: t('tip_edu_standby'), icon: Moon, priority: 'info', color: 'violet' },
            { id: 'edu_shower', message: t('tip_edu_shower'), icon: Droplets, priority: 'success', color: 'emerald' },
            { id: 'edu_fridge', message: t('tip_edu_fridge'), icon: Thermometer, priority: 'info', color: 'cyan' },
            { id: 'edu_iron', message: t('tip_edu_iron'), icon: Zap, priority: 'warning', color: 'amber' },
            { id: 'edu_ac_filter', message: t('tip_edu_ac_filter'), icon: Wind, priority: 'warning', color: 'orange' },
            { id: 'edu_natural_light', message: t('tip_edu_natural_light'), icon: Sun, priority: 'success', color: 'yellow' },
            { id: 'edu_peak', message: t('tip_edu_peak'), icon: Calendar, priority: 'info', color: 'blue' },
            { id: 'edu_solar_clean', message: t('tip_edu_solar_clean'), icon: Sun, priority: 'warning', color: 'amber' },
            { id: 'edu_tv_sleep', message: t('tip_edu_tv_sleep'), icon: Moon, priority: 'info', color: 'indigo' },
            { id: 'edu_charger', message: t('tip_edu_charger'), icon: Zap, priority: 'info', color: 'gray' },
            { id: 'edu_seal', message: t('tip_edu_seal'), icon: Wind, priority: 'info', color: 'cyan' }
        ];

        // Stable Shuffle based on 10-minute block to keep order consistent for a while
        const now = new Date();
        const timeBlock = Math.floor(now.getMinutes() / 10);

        return [...pool].sort((a, b) => {
            return ((a.id.length + timeBlock) % 3) - ((b.id.length + timeBlock) % 3);
        });
    }, [t]);

    // --- Dynamic Context Rules (Re-runs often) ---
    const dynamicTips = useMemo(() => {
        const now = new Date();
        const hour = now.getHours();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        const isFriday = now.getDay() === 5;

        const tips = [];
        const addTip = (id, message, icon, priority, color) => {
            tips.push({ id, message, icon, priority, color });
        };

        // --- 1. Tariff & Cost ---
        if (tariffStatus === 'peak') addTip('peak_active', t('tip_peak_active'), AlertTriangle, 'critical', 'red');
        else if (tariffStatus === 'intermediate') addTip('inter_active', t('tip_inter_active'), AlertTriangle, 'warning', 'yellow');

        if (budgetLimit > 0 && monthlyCost > (budgetLimit * 0.9)) addTip('budget_warn', `${t('tip_budget_warn')} (R$ ${budgetLimit}).`, DollarSign, 'warning', 'red');

        // --- 2. Solar & Weather ---
        if (isSolar && weather) {
            if (weather.current.weather_code >= 51 && weather.current.weather_code <= 67) addTip('rain_solar', t('tip_rain_solar'), CloudRain, 'warning', 'blue');
            if (weather.current.weather_code >= 95) addTip('storm_alert', t('tip_storm_alert'), Zap, 'critical', 'purple');
            if (weather.current.is_day === 1 && weather.current.weather_code <= 2 && power < -2000) addTip('good_solar', t('tip_good_solar'), Sun, 'success', 'emerald');
        }

        // --- 3. Temp ---
        if (weather) {
            const temp = weather.current.temperature_2m;
            if (temp > 30) addTip('high_temp', `${Math.round(temp)}°C! ${t('tip_high_temp')}`, Thermometer, 'info', 'orange');
            else if (temp < 15 && power > 2000) addTip('low_temp', t('tip_low_temp'), Thermometer, 'info', 'blue');
        }

        // --- 4. Consumption ---
        if (hour >= 1 && hour <= 5 && power > 300) addTip('vampire_power', t('tip_vampire_power'), Moon, 'warning', 'violet');
        if (power > 6000) addTip('heavy_load', t('tip_heavy_load'), Zap, 'critical', 'red');

        // --- 5. Routine ---
        if (isWeekend && tariffStatus === 'off-peak' && hour > 10 && hour < 16) addTip('weekend_laundry', t('tip_weekend_laundry'), Calendar, 'success', 'emerald');
        if (isFriday && hour >= 18 && hour <= 23) addTip('friday_night', t('tip_friday_night'), Smile, 'info', 'purple');

        // --- 7. Combo ---
        if (isSolar && tariffStatus === 'off-peak' && power < -2000) addTip('solar_momentum', t('tip_solar_momentum'), Zap, 'success', 'emerald');
        if (isSolar && tariffStatus === 'peak' && power < -500) addTip('solar_gold', t('tip_solar_gold'), DollarSign, 'success', 'amber');
        if (!isSolar && tariffStatus === 'off-peak' && hour >= 23 && hour < 5 && power < 300) addTip('quiet_night', t('tip_quiet_night'), Moon, 'info', 'blue');
        if (weather && weather.current.temperature_2m > 28 && power < 2000 && hour > 10 && hour < 18) addTip('ac_efficiency', t('tip_ac_efficiency'), Wind, 'success', 'cyan');

        // --- 6. System ---
        if (voltage && (voltage < 110 || (voltage > 135 && voltage < 200))) addTip('voltage_instability', t('tip_voltage_instability'), Zap, 'critical', 'red');

        return tips;
    }, [weather, tariffStatus, power, isSolar, voltage, monthlyCost, budgetLimit, t]);


    // Combined Result - Stable!
    const finalTips = useMemo(() => {
        const combined = [...dynamicTips];

        // Fill with edu tips up to 10
        educationalTips.forEach(edu => {
            if (combined.length < 10) {
                combined.push(edu);
            }
        });

        if (combined.length === 0) {
            combined.push({ id: 'default_safe', message: t('tip_default_safe'), icon: Zap, priority: 'info', color: 'gray' });
        }
        return combined;
    }, [dynamicTips, educationalTips, t]);

    useEffect(() => {
        setActiveTips(finalTips);
    }, [finalTips]);

    return activeTips;
};
