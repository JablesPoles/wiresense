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
    const currency = moeda === 'BRL' ? 'R$' : (moeda === 'EUR' ? '€' : '$');

    // View state
    const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
    const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d' | '6m', '1y'

    // Data state
    const [consumptionData, setConsumptionData] = useState([]);
    const [peakData, setPeakData] = useState([]);
    const [costData, setCostData] = useState([]);

    // Update time range options based on view mode
    const rangeOptions = viewMode === 'daily'
        ? [{ label: '7 Dias', value: '7d' }, { label: '30 Dias', value: '30d' }]
        : [{ label: '6 Meses', value: '6m' }, { label: '12 Meses', value: '1y' }];

    // Reset range when mode changes
    const handleModeChange = (mode) => {
        setViewMode(mode);
        setTimeRange(mode === 'daily' ? '7d' : '6m');
    };

    useEffect(() => {
        const fetchData = async () => {
            let limit = 7;
            if (timeRange === '30d') limit = 30;
            if (timeRange === '6m') limit = 6;
            if (timeRange === '1y') limit = 12;

            let consumption = [];
            let peaks = [];

            if (viewMode === 'daily') {
                consumption = await getDailyEnergyHistory(limit);
                peaks = await getPeakLoadHistory(limit);
            } else {
                consumption = await getMonthlyEnergyHistory(limit);
                // For monthly peaks, we could add a method or just approximate/mock for now
                // Let's use the same peak history function for simplicity or mock it
                peaks = await getPeakLoadHistory(limit);
            }

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
        };

        fetchData();
    }, [viewMode, timeRange, tarifaKwh]);

    const handleExport = () => {
        alert("Exportação de CSV será implementada em breve.");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Histórico de Consumo</h1>
                    <p className="text-muted-foreground">
                        Análise detalhada do consumo e custos ao longo do tempo.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                    >
                        <Download size={16} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-2 rounded-lg border border-border">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleModeChange('daily')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Diário
                    </button>
                    <button
                        onClick={() => handleModeChange('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Mensal
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <TimeRangeSelector
                        selectedRange={timeRange}
                        onRangeChange={setTimeRange}
                        ranges={rangeOptions}
                    />
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 gap-6">
                <EnergyHistoryChart
                    data={consumptionData}
                    type={viewMode}
                    unit="kWh"
                />
                <CostChart
                    data={costData}
                    currencySymbol={currency}
                />
            </div>

            {/* Secondary Analysis */}
            <div className="grid grid-cols-1 gap-6">
                <PeakLoadChart data={peakData} />
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
