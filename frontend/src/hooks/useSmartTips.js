import { useState, useEffect, useMemo } from 'react';
import {
    CloudRain, Sun, AlertTriangle, Thermometer, Moon, Zap,
    Wind, DollarSign, Calendar, Smile, Droplets
} from 'lucide-react';

export const useSmartTips = ({
    weather,
    tariffStatus, // 'peak', 'intermediate', 'off-peak'
    power, // current watts
    isSolar,
    voltage,
    monthlyCost,
    budgetLimit
}) => {
    const [activeTips, setActiveTips] = useState([]);

    // --- Static / Educational Tips Pool (Stable) ---
    const educationalTips = useMemo(() => {
        const pool = [
            { id: 'edu_led', message: "Dica: Lâmpadas LED economizam até 80% de energia comparadas às incandescentes.", icon: Zap, priority: 'info', color: 'blue' },
            { id: 'edu_standby', message: "Sabia? Aparelhos em standby podem representar até 12% da sua conta.", icon: Moon, priority: 'info', color: 'violet' },
            { id: 'edu_shower', message: "Banhos: Reduzir o tempo em 5 min pode economizar R$ 30,00/mês.", icon: Droplets, priority: 'success', color: 'emerald' },
            { id: 'edu_fridge', message: "Geladeira: Evite abrir a porta desnecessariamente. O motor trabalha mais para gelar de novo.", icon: Thermometer, priority: 'info', color: 'cyan' },
            { id: 'edu_iron', message: "Ferro de passar: Acumule o máximo de roupas para passar de uma só vez.", icon: Zap, priority: 'warning', color: 'amber' },
            { id: 'edu_ac_filter', message: "Manutenção: Filtros de ar condicionado sujos aumentam o consumo. Limpe mensalmente.", icon: Wind, priority: 'warning', color: 'orange' },
            { id: 'edu_natural_light', message: "Dia claro? Abra as cortinas e apague as luzes. Use a luz natural!", icon: Sun, priority: 'success', color: 'yellow' },
            { id: 'edu_peak', message: "Planejamento: Deixe máquinas de lavar para fora do horário de ponta (18h-21h).", icon: Calendar, priority: 'info', color: 'blue' },
            { id: 'edu_solar_clean', message: "Painéis Solares: A sujeira reduz a eficiência. Verifique se precisam de limpeza.", icon: Sun, priority: 'warning', color: 'amber' },
            { id: 'edu_tv_sleep', message: "Dormiu na frente da TV? Configure o 'Sleep' para desligar sozinha.", icon: Moon, priority: 'info', color: 'indigo' },
            { id: 'edu_charger', message: "Carregadores: Não deixe conectados na tomada sem o celular.", icon: Zap, priority: 'info', color: 'gray' },
            { id: 'edu_seal', message: "Ar Condicionado: Verifique a vedação de portas e janelas para não 'gelar a rua'.", icon: Wind, priority: 'info', color: 'cyan' }
        ];

        // Stable Shuffle based on 10-minute block to keep order consistent for a while
        const now = new Date();
        const timeBlock = Math.floor(now.getMinutes() / 10);

        return [...pool].sort((a, b) => {
            return ((a.id.length + timeBlock) % 3) - ((b.id.length + timeBlock) % 3);
        });
    }, []); // Empty dependency! Or just re-calc every hour if needed, but [] is safest for stability.

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

        // ... [Insert all logic from previous step: Tariff, Solar, Temp, etc.] ...
        // --- 1. Tariff & Cost ---
        if (tariffStatus === 'peak') addTip('peak_active', "Horário de Ponta! Tarifa mais cara agora. Evite banhos demorados.", AlertTriangle, 'critical', 'red');
        else if (tariffStatus === 'intermediate') addTip('inter_active', "Tarifa Intermediária. O preço da energia está subindo.", AlertTriangle, 'warning', 'yellow');

        if (budgetLimit > 0 && monthlyCost > (budgetLimit * 0.9)) addTip('budget_warn', `Cuidado: Você atingiu 90% da sua meta de orçamento (R$ ${budgetLimit}).`, DollarSign, 'warning', 'red');

        // --- 2. Solar & Weather ---
        if (isSolar && weather) {
            if (weather.current.weather_code >= 51 && weather.current.weather_code <= 67) addTip('rain_solar', "Geração solar reduzida pela chuva. Economize energia se possível.", CloudRain, 'warning', 'blue');
            if (weather.current.weather_code >= 95) addTip('storm_alert', "Tempestade detectada! Desconecte aparelhos sensíveis se houver raios.", Zap, 'critical', 'purple');
            if (weather.current.is_day === 1 && weather.current.weather_code <= 2 && power < -2000) addTip('good_solar', "Sol bombando! ☀️ Geração alta. Ótimo momento para ligar a máquina de lavar.", Sun, 'success', 'emerald');
        }

        // --- 3. Temp ---
        if (weather) {
            const temp = weather.current.temperature_2m;
            if (temp > 30) addTip('high_temp', `${Math.round(temp)}°C lá fora! O Ar Condicionado deve estar trabalhando dobrado.`, Thermometer, 'info', 'orange');
            else if (temp < 15 && power > 2000) addTip('low_temp', "Noite fria! Aquecedores ligados consomem muita energia.", Thermometer, 'info', 'blue');
        }

        // --- 4. Consumption ---
        if (hour >= 1 && hour <= 5 && power > 300) addTip('vampire_power', "Madrugada com consumo alto (300W+). Verifique aparelhos em standby.", Moon, 'warning', 'violet');
        if (power > 6000) addTip('heavy_load', "Consumo altíssimo (>6kW)! Atenção para não sobrecarregar o disjuntor.", Zap, 'critical', 'red');

        // --- 5. Routine ---
        if (isWeekend && tariffStatus === 'off-peak' && hour > 10 && hour < 16) addTip('weekend_laundry', "Fim de semana: Tarifa barata. Bom horário para faxina e lavanderia.", Calendar, 'success', 'emerald');
        if (isFriday && hour >= 18 && hour <= 23) addTip('friday_night', "Sextou! 🍿 Bom descanso. Fique de olho no consumo dos eletrônicos.", Smile, 'info', 'purple');

        // --- 7. Combo ---
        if (isSolar && tariffStatus === 'off-peak' && power < -2000) addTip('solar_momentum', "Momento Mágico! 🌟 Gerando muito excedente com tarifa barata. Use tudo o que puder agora!", Zap, 'success', 'emerald');
        if (isSolar && tariffStatus === 'peak' && power < -500) addTip('solar_gold', "Lucro Máximo! 💰 Seus painéis estão te salvando da Tarifa de Ponta agora.", DollarSign, 'success', 'amber');
        if (!isSolar && tariffStatus === 'off-peak' && hour >= 23 && hour < 5 && power < 300) addTip('quiet_night', "Madrugada tranquila. Tarifa reduzida e consumo baixo. Tudo certo.", Moon, 'info', 'blue');
        if (weather && weather.current.temperature_2m > 28 && power < 2000 && hour > 10 && hour < 18) addTip('ac_efficiency', "Calor lá fora, mas consumo controlado. Sua refrigeração parece eficiente!", Wind, 'success', 'cyan');

        // --- 6. System ---
        if (voltage && (voltage < 110 || (voltage > 135 && voltage < 200))) addTip('voltage_instability', "Tensão da rede instável. Risco para equipamentos.", Zap, 'critical', 'red');

        return tips;
    }, [weather, tariffStatus, power, isSolar, voltage, monthlyCost, budgetLimit]);


    // Combined Result - Stable!
    // We only merge them. Since educationalTips is stable, and dynamicTips order is deterministic, 
    // the resulting array order will only change when a new dynamic tip appears/disappears, 
    // NOT when numbers fluctuate slightly.
    const finalTips = useMemo(() => {
        const combined = [...dynamicTips];

        // Fill with edu tips up to 10
        educationalTips.forEach(edu => {
            // Avoid dupes if strictly necessary, but IDs are distinct.
            if (combined.length < 10) {
                combined.push(edu);
            }
        });

        if (combined.length === 0) {
            combined.push({ id: 'default_safe', message: "Sistema operando normalmente. Nenhuma anomalia detectada.", icon: Zap, priority: 'info', color: 'gray' });
        }
        return combined;
    }, [dynamicTips, educationalTips]);

    useEffect(() => {
        setActiveTips(finalTips);
    }, [finalTips]);

    return activeTips;
};
