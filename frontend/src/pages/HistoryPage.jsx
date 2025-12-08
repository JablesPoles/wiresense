import { useDevice } from '../contexts/DeviceContext';
import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { EnergyHistoryChart } from '../components/charts/EnergyHistoryChart';
import { PeakLoadChart } from '../components/charts/PeakLoadChart';
import { CostChart } from '../components/charts/CostChart';
import { TimeRangeSelector } from '../components/common/TimeRangeSelector';
import {
    getDailyEnergyHistory,
    getMonthlyEnergyHistory,
    getPeakLoadHistory
} from '../services/apiService';

const HistoryPage = () => {
    const { tarifaKwh, moeda } = useSettings();
    const { isGenerator, currentDeviceId } = useDevice();
    const currency = moeda === 'BRL' ? 'R$' : (moeda === 'EUR' ? '€' : '$');

    // Theme Configuration
    const isSolar = isGenerator;
    const themeHex = isSolar ? '#10b981' : '#06b6d4';
    const secondaryHex = isSolar ? '#fbbf24' : '#8b5cf6';

    // View state
    const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
    const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d' | '6m', '1y'

    // Data state
    const [consumptionData, setConsumptionData] = useState([]);
    const [peakData, setPeakData] = useState([]);
    const [costData, setCostData] = useState([]);

    // Configure time range options based on active view mode
    const rangeOptions = viewMode === 'daily'
        ? [{ label: '7 Dias', value: '7d' }, { label: '30 Dias', value: '30d' }]
        : [{ label: '6 Meses', value: '6m' }, { label: '12 Meses', value: '1y' }];

    // Reset range when mode changes
    const handleModeChange = (mode) => {
        setViewMode(mode);
        setTimeRange(mode === 'daily' ? '7d' : '6m');
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            let limit = 7;
            if (timeRange === '30d') limit = 30;
            if (timeRange === '6m') limit = 6;
            if (timeRange === '1y') limit = 12;

            let consumption = [];
            let peaks = [];

            try {
                if (viewMode === 'daily') {
                    consumption = await getDailyEnergyHistory(limit, currentDeviceId); // Pass deviceId
                    peaks = await getPeakLoadHistory(limit, currentDeviceId);
                } else {
                    consumption = await getMonthlyEnergyHistory(limit, currentDeviceId);
                    peaks = await getPeakLoadHistory(limit, currentDeviceId);
                }

                if (!isMounted) return;

                setConsumptionData(consumption || []);
                setPeakData(peaks || []);

                // Calculate costs
                if (consumption && tarifaKwh) {
                    const costs = consumption.map(item => ({
                        x: item.x,
                        y: parseFloat((item.y * tarifaKwh).toFixed(2))
                    }));
                    setCostData(costs);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [viewMode, timeRange, tarifaKwh, currentDeviceId]); // Add currentDeviceId

    const handleExport = () => {
        alert("Exportação de CSV será implementada em breve.");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Histórico de {isSolar ? 'Geração' : 'Consumo'}
                        <span className={`text-sm px-2 py-0.5 rounded-full border ${isSolar ? 'bg-emerald-500/10 border-amber-500/20 text-amber-500' : 'bg-cyan-500/10 border-violet-500/20 text-cyan-500'}`}>
                            {isSolar ? 'Produção' : 'Consumo'}
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        Análise detalhada {isSolar ? 'da geração e economia' : 'do consumo e custos'} ao longo do tempo.
                    </p>
                </div>
                {/* ... button */}
            </div>

            {/* Controls */}
            <div className={`flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-2 rounded-lg border ${isSolar ? 'border-amber-500/10' : 'border-border'}`}>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleModeChange('daily')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'daily'
                            ? (isSolar ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-cyan-600 text-white shadow-cyan-900/20')
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Diário
                    </button>
                    <button
                        onClick={() => handleModeChange('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly'
                            ? (isSolar ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-cyan-600 text-white shadow-cyan-900/20')
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Mensal
                    </button>
                </div>

                <TimeRangeSelector
                    selectedRange={timeRange}
                    onRangeChange={setTimeRange}
                    ranges={rangeOptions}
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 gap-6">
                <EnergyHistoryChart
                    data={consumptionData}
                    type={viewMode}
                    unit="kWh"
                    color={themeHex}
                    label={isSolar ? 'Geração' : 'Consumo'}
                />
                <CostChart
                    data={costData}
                    currencySymbol={currency}
                    color={isSolar ? '#10b981' : '#ef4444'} // Green for savings, Red for cost
                />
            </div>

            {/* Secondary Analysis */}
            <div className="grid grid-cols-1 gap-6">
                <PeakLoadChart data={peakData} color={secondaryHex} />
                {/* <HeatmapChart /> */}
            </div>

            {/* Detailed Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">Detalhamento dos Dados</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Data / Período</th>
                                <th className="px-6 py-3">Consumo (kWh)</th>
                                <th className="px-6 py-3">Pico de Corrente (A)</th>
                                <th className="px-6 py-3">Custo Estimado ({currency})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {consumptionData.map((item, index) => {
                                const peak = peakData[index]?.y || '-';
                                const cost = costData[index]?.y || '-';
                                return (
                                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{item.x}</td>
                                        <td className="px-6 py-4">{item.y}</td>
                                        <td className="px-6 py-4 text-amber-500 font-medium">{peak}</td>
                                        <td className="px-6 py-4 text-emerald-500 font-mono">{cost}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
