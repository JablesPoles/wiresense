import React, { useState, useEffect } from 'react';
import { EnergyHistoryChart } from '../components/charts/EnergyHistoryChart';
import { getDailyEnergyHistory, getMonthlyEnergyHistory } from '../services/apiService';
import { ArrowDownToLine, Calendar, FileText } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const HistoryPage = () => {
    const [period, setPeriod] = useState('daily'); // 'daily' | 'monthly'
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { tarifaKwh, moeda } = useSettings();

    const currencySymbol = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' }[moeda] || '$';

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                let data = [];
                if (period === 'daily') {
                    // Fetch last 15 days for better history view
                    data = await getDailyEnergyHistory(15);
                } else {
                    data = await getMonthlyEnergyHistory(12);
                }

                // Format data for chart { x: dateString, y: value }
                // API returns { x: "2023-10-01", y: 12.5 }
                setHistoryData(data || []);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [period]);

    const calculateCost = (kwh) => {
        if (!tarifaKwh) return '-';
        return (kwh * tarifaKwh).toFixed(2);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Histórico de Consumo</h1>
                    <p className="text-muted-foreground">Analise o consumo energético ao longo do tempo.</p>
                </div>

                {/* Period Toggle */}
                <div className="flex p-1 bg-secondary/50 rounded-lg border border-border">
                    <button
                        onClick={() => setPeriod('daily')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${period === 'daily'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Diário
                    </button>
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${period === 'monthly'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Mensal
                    </button>
                </div>
            </div>

            {/* Chart Section */}
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <EnergyHistoryChart data={historyData} type={period} />
            </div>

            {/* Table Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText size={20} className="text-primary" />
                        Detalhamento
                    </h3>
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ArrowDownToLine size={14} /> Exportar CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Data / Período</th>
                                <th className="px-6 py-3">Consumo (kWh)</th>
                                <th className="px-6 py-3 text-right">Custo Estimado ({currencySymbol})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : historyData.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">
                                        Nenhum dado encontrado para este período.
                                    </td>
                                </tr>
                            ) : (
                                [...historyData].reverse().map((item, index) => (
                                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            {new Date(item.x).toLocaleDateString('pt-BR',
                                                period === 'daily'
                                                    ? { day: '2-digit', month: 'long', year: 'numeric' }
                                                    : { month: 'long', year: 'numeric', timeZone: 'UTC' } // timeZone UTC to avoid shifting months in table
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold mr-2">
                                                {item.y.toFixed(2)}
                                            </span>
                                            <span className="text-muted-foreground">kWh</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-green-400">
                                            {currencySymbol} {calculateCost(item.y)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
