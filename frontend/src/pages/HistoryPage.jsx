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
import { CSVExportButton } from '../components/common/CSVExportButton';

import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';

const HistoryPage = () => {
    const { tarifaKwh, moeda } = useSettings();
    const { isGenerator, currentDeviceId } = useDevice();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const currency = moeda === 'BRL' ? 'R$' : (moeda === 'EUR' ? '€' : '$');

    // Theme Configuration
    const isSolar = isGenerator;
    const currentMode = isSolar ? 'generator' : 'consumer';
    const modeData = theme.modes[currentMode];

    // Dynamic Colors
    const themeHex = modeData.primary;
    const secondaryHex = modeData.secondary;

    // View state
    const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
    const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d' | '6m', '1y'

    // Data state
    const [consumptionData, setConsumptionData] = useState([]);
    const [peakData, setPeakData] = useState([]);
    const [costData, setCostData] = useState([]);

    // Configure time range options based on active view mode
    const rangeOptions = viewMode === 'daily'
        ? [{ label: t('days_7'), value: '7d' }, { label: t('days_30'), value: '30d' }]
        : [{ label: t('months_6'), value: '6m' }, { label: t('months_12'), value: '1y' }];

    // Reset range when mode changes
    const handleModeChange = (mode) => {
        setViewMode(mode);
        setTimeRange(mode === 'daily' ? '7d' : '6m');
    };

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
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
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [viewMode, timeRange, tarifaKwh, currentDeviceId]); // Add currentDeviceId




    // State for highlighting
    const [selectedDate, setSelectedDate] = useState('');

    // Reset selected date when data refreshes
    useEffect(() => {
        setSelectedDate('');
    }, [consumptionData]);

    const selectedStats = React.useMemo(() => {
        if (!selectedDate) return null;
        const index = consumptionData.findIndex(d => d.x === selectedDate);
        if (index === -1) return null;
        return {
            consumption: consumptionData[index].y,
            peak: peakData[index]?.y || 0,
            cost: costData[index]?.y || 0
        };
    }, [selectedDate, consumptionData, peakData, costData]);

    const chartSubtitleMap = {
        '7d': t('days_7'),
        '30d': t('days_30'),
        '6m': t('months_6'),
        '1y': t('months_12')
    };
    const chartSubtitle = chartSubtitleMap[timeRange] || (viewMode === 'daily' ? t('days_7') : t('months_6'));

    return (
        <PageTransition className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-3">
                        {t('history_of')} {isSolar ? t('generation') : t('consumption')}
                        <span
                            className="text-xs px-3 py-1 rounded-full border font-medium inline-flex items-center justify-center backdrop-blur-md transition-colors"
                            style={{
                                backgroundColor: `${themeHex}20`,
                                borderColor: `${themeHex}40`,
                                color: `hsl(var(--primary-foreground))`
                            }}
                        >
                            {isSolar ? t('generation') : t('consumption')}
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        {t('detailed_analysis')}
                    </p>
                </div>
                {consumptionData.length > 0 && (
                    <CSVExportButton
                        data={consumptionData.map((item, idx) => ({
                            Date: item.x,
                            Consumption_kWh: item.y,
                            Peak_Current_A: peakData[idx]?.y || 0,
                            Cost: costData[idx]?.y || 0
                        }))}
                        filename={`wiresense_history_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`}
                    />
                )}
            </div>

            {/* Controls */}
            <div className={`flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-2 rounded-lg border ${isSolar ? 'border-amber-500/10' : 'border-border'}`}>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleModeChange('daily')}
                        style={viewMode === 'daily' ? {
                            backgroundColor: themeHex,
                            color: 'hsl(var(--primary-foreground))',
                            boxShadow: `0 0 20px -5px ${themeHex}50`
                        } : {}}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'daily'
                            ? '' // Style handled inline
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {t('daily')}
                    </button>
                    <button
                        onClick={() => handleModeChange('monthly')}
                        style={viewMode === 'monthly' ? {
                            backgroundColor: themeHex,
                            color: 'hsl(var(--primary-foreground))',
                            boxShadow: `0 0 20px -5px ${themeHex}50`
                        } : {}}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly'
                            ? ''
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {t('monthly')}
                    </button>
                </div>

                <TimeRangeSelector
                    selectedRange={timeRange}
                    onRangeChange={setTimeRange}
                    ranges={rangeOptions}
                />

                {/* Date Highlight Selector */}
                <div className="w-full md:w-auto mt-2 md:mt-0 md:border-t-0 md:pt-0 border-t border-border/50 pt-2">
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full md:w-[260px] bg-card border border-border rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        <option value="">{t('highlight_date') || 'Selecionar data para destacar...'}</option>
                        {consumptionData.map((d, i) => (
                            <option key={i} value={d.x}>{d.x}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selected Date Summary */}
            {selectedDate && selectedStats && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('selected_date') || 'Data Selecionada'}</p>
                            <p className="text-lg font-bold text-foreground">{selectedDate}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 w-full sm:w-auto">
                        <div>
                            <p className="text-xs text-muted-foreground">{t('consumption')}</p>
                            <p className="font-mono font-bold text-lg">{selectedStats.consumption} <span className="text-xs font-normal text-muted-foreground">kWh</span></p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t('peak_current')}</p>
                            <p className="font-mono font-bold text-lg text-amber-500">{selectedStats.peak} <span className="text-xs font-normal text-muted-foreground">A</span></p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{isSolar ? (t('estimated_earnings') || 'Ganho Estimado') : t('estimated_cost')}</p>
                            <p className="font-mono font-bold text-lg text-emerald-500 flex items-center gap-0.5">
                                <span className="text-sm">{currency}</span>
                                {costData.find(d => d.x === selectedDate)?.y || 0}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedDate('')}
                        className="hidden sm:block text-xs text-muted-foreground hover:text-foreground underline"
                    >
                        {t('clear') || 'Limpar'}
                    </button>
                </div>
            )}

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <>
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm h-[350px] animate-pulse flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-muted-foreground">{t('loading')}</span>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-[300px] animate-pulse" />
                    </>
                ) : (
                    <>
                        <EnergyHistoryChart
                            data={consumptionData}
                            type={viewMode}
                            unit="kWh"
                            color={themeHex}
                            label={isSolar ? t('generation') : t('consumption')}
                            subtitle={chartSubtitle}
                            highlightDate={selectedDate}
                        />
                        <CostChart
                            data={costData}
                            currencySymbol={currency}
                            color={isSolar ? secondaryHex : '#ef4444'}
                            highlightDate={selectedDate}
                        />
                    </>
                )}
            </div>

            {/* Secondary Analysis */}
            <div className="grid grid-cols-1 gap-6">
                <PeakLoadChart
                    data={peakData}
                    color={secondaryHex}
                    highlightDate={selectedDate}
                />
                {/* <HeatmapChart /> */}
            </div>

            {/* Detailed Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">{t('data_breakdown')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">{t('date_period')}</th>
                                <th className="px-6 py-3 whitespace-nowrap">{t('consumption')} (kWh)</th>
                                <th className="px-6 py-3 whitespace-nowrap">{t('peak_current')}</th>
                                <th className="px-6 py-3 whitespace-nowrap">{t('estimated_cost')} ({currency})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {consumptionData.map((item, index) => {
                                const peak = peakData[index]?.y || '-';
                                const cost = costData[index]?.y || '-';
                                return (
                                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">{item.x}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.y}</td>
                                        <td className="px-6 py-4 text-amber-500 font-medium whitespace-nowrap">{peak}</td>
                                        <td className="px-6 py-4 text-emerald-500 font-mono whitespace-nowrap">{cost}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition >
    );
};

export default HistoryPage;
