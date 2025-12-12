import React, { useState, useEffect } from 'react';
import { Download, FileText, Printer, Zap, Sun, Info } from 'lucide-react';
import { useSettings, useDeviceSettings } from '../contexts/SettingsContext';
import { useDevice } from '../contexts/DeviceContext';
import { getEnergySummary } from '../services/apiService';

const ReportsPage = () => {
    const { moeda, tarifaKwh: globalTariff, exchangeRates } = useSettings();
    const { devices } = useDevice();

    const [reportCurrency, setReportCurrency] = useState(moeda);
    const currency = reportCurrency === 'BRL' ? 'R$' : (reportCurrency === 'EUR' ? '€' : '$');

    // Configurações e Dados por Device
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handlePrint = () => {
        window.print();
    };

    // Conversion Helper
    const convert = (valueInBrl) => {
        if (!valueInBrl && valueInBrl !== 0) return 0;
        // If target is BRL, no conversion needed
        if (reportCurrency === 'BRL') return valueInBrl;

        if (!exchangeRates) return valueInBrl;

        // exchangeRates: { USD: 5.80, EUR: 6.10, BRL: 1 } (Rates is BRL price for 1 unit of currency)
        // Wait, AwesomeAPI logic: USDBRL.bid = "5.82" -> This means 1 USD = 5.82 BRL.
        // So if I have 100 BRL, I do 100 / 5.82 to get USD.

        const rate = exchangeRates[reportCurrency];
        if (!rate) return valueInBrl;

        return valueInBrl / rate;
    };

    // Helper para verificar se é gerador
    const isDeviceGenerator = (id) => {
        const lower = id.toLowerCase();
        return lower.includes('solar') || lower.includes('pv') || lower.includes('gerador') || lower.includes('inverter');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!devices || devices.length === 0) {
                    setLoading(false);
                    return;
                }

                const promises = devices.map(async (device) => {
                    try {
                        const devId = device.id;
                        const devName = device.name;

                        // Per-device tariff logic
                        const devTariffKey = `device_${devId}_tarifa`;
                        const savedTariff = localStorage.getItem(devTariffKey);
                        const tariff = savedTariff ? Number(savedTariff) : globalTariff;

                        // Per-device currency logic
                        const devMoedaKey = `device_${devId}_moeda`;
                        const devMoeda = localStorage.getItem(devMoedaKey) || moeda; // Default to global if not set

                        const summary = await getEnergySummary(devId);
                        const isGen = isDeviceGenerator(devId);
                        const kwh = summary?.month ?? 0;

                        // Calculate cost in DEVICE's currency
                        const costInDeviceMoeda = kwh * tariff;

                        // Normalize to BRL
                        // If device is USD, we multiply by exchangeRates.USD to get BRL value
                        let costBrl = costInDeviceMoeda;

                        if (devMoeda !== 'BRL' && exchangeRates) {
                            const rateToBrl = exchangeRates[devMoeda]; // e.g. 5.82
                            if (rateToBrl) {
                                costBrl = costInDeviceMoeda * rateToBrl;
                            }
                        } else if (devMoeda === 'BRL') {
                            // Already in BRL
                            costBrl = costInDeviceMoeda;
                        }

                        return {
                            id: devId,
                            name: devName,
                            isGenerator: isGen,
                            kwh: kwh,
                            costBrl: costBrl, // Normalized BRL cost
                            tariffOriginal: tariff,
                            moedaOriginal: devMoeda
                        };
                    } catch (err) {
                        console.error(`Failed to fetch report for ${device.id}`, err);
                        return null;
                    }
                });

                const results = (await Promise.all(promises)).filter(r => r !== null);
                setReportData(results);
            } catch (error) {
                console.error("Critical error building report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [devices, globalTariff]);

    const totalConsumptionCost = convert(
        reportData
            .filter(d => !d.isGenerator)
            .reduce((acc, curr) => acc + curr.costBrl, 0)
    );

    const totalGenerationSavings = convert(
        reportData
            .filter(d => d.isGenerator)
            .reduce((acc, curr) => acc + curr.costBrl, 0)
    );

    const netCost = totalConsumptionCost - totalGenerationSavings;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Print styles */}
            <style>{`
                @media print {
                  body { background-color: white !important; color: black !important; }
                  .print\\:hidden, div[class*="fixed inset-0"], .no-print { display: none !important; }
                  .card { border: 1px solid #ddd; box-shadow: none; break-inside: avoid; }
                  .text-white { color: black !important; }
                  .text-muted-foreground { color: #666 !important; }
                }
              `}</style>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Relatórios Consolidados
                    </h1>
                    <p className="text-muted-foreground">Visão geral do impacto de todos os seus dispositivos.</p>
                </div>

                {/* Currency Selector */}
                <div className="bg-card border border-border rounded-lg p-1 flex items-center">
                    {['BRL', 'USD', 'EUR'].map(curr => (
                        <button
                            key={curr}
                            onClick={() => setReportCurrency(curr)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${reportCurrency === curr
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            {curr}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Card */}
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-8 shadow-lg relative overflow-hidden">
                {/* Visual Watermark Removed as requested */}

                <div className="flex justify-between items-center mb-8 border-b border-border pb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Relatório Multi-Dispositivo</h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Info size={12} />
                                Valores estimados baseados em sensores
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Data de Emissão</p>
                        <p className="font-mono font-medium text-white">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 flex flex-col items-center gap-3">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground">Calculando dados...</p>
                    </div>
                ) : (
                    <div className="space-y-8 relative z-10">
                        {/* Totals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400 mb-1">Custo Consumo</p>
                                <p className="text-2xl font-bold text-red-500">~ {currency} {totalConsumptionCost.toFixed(2)}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-amber-500/20">
                                <p className="text-sm text-emerald-400 mb-1">Valor Produzido</p>
                                <p className="text-2xl font-bold text-amber-500">~ {currency} {totalGenerationSavings.toFixed(2)}</p>
                            </div>
                            <div className={`p-4 rounded-lg border ${netCost <= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-primary/10 border-primary/20'}`}>
                                <p className="text-sm text-muted-foreground mb-1">Custo Líquido Estimado</p>
                                <p className={`text-2xl font-bold ${netCost <= 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                                    ~ {currency} {Math.abs(netCost).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Breakdown Table */}
                        <div>
                            <h3 className="font-semibold mb-4 text-lg text-white">Detalhamento por Dispositivo</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Dispositivo</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3 text-right">Consumo/Geração (Mês)</th>
                                            <th className="px-4 py-3 text-right">Tarifa Base ({moeda})</th>
                                            <th className="px-4 py-3 rounded-r-lg text-right">Impacto ({reportCurrency})</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {reportData.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/20">
                                                <td className="px-4 py-3 font-medium text-white">
                                                    <div>
                                                        {item.name}
                                                        <span className="block text-xs text-muted-foreground font-normal">{item.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.isGenerator ? 'bg-emerald-500/10 text-emerald-500 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-violet-500/20'}`}>
                                                        {item.isGenerator ? 'Gerador' : 'Consumidor'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-300">{item.kwh.toFixed(1)} kWh</td>
                                                <td className="px-4 py-3 text-right text-muted-foreground">
                                                    {['USD', 'EUR'].includes(item.moedaOriginal) ? (item.moedaOriginal === 'EUR' ? '€' : '$') : 'R$'} {item.tariffOriginal.toFixed(2)}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold ${item.isGenerator ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {item.isGenerator ? '-' : '+'}{currency} {convert(item.costBrl).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground mt-8 text-center border-t border-border pt-6 flex flex-col items-center gap-2">
                            <p>
                                <Info size={14} className="inline mr-1" />
                                <strong>Aviso de Estimativa:</strong> Os valores apresentados são calculados com base em sensores de corrente e configurações do usuário. Não representam uma fatura oficial da concessionária.
                            </p>
                            <p className="text-xs opacity-60">
                                Cotações (via AwesomeAPI): USD ~ {exchangeRates?.USD?.toFixed(2)} | EUR ~ {exchangeRates?.EUR?.toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {/* Actions */}
            <div className="flex justify-center gap-4 no-print">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 font-medium"
                >
                    <Printer size={20} />
                    Imprimir / Salvar PDF
                </button>
            </div>
        </div>
    );
};

export default ReportsPage;
