import React from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ReportsPage = () => {
    const { moeda } = useSettings();
    const currency = moeda === 'BRL' ? 'R$' : (moeda === 'EUR' ? '€' : '$');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Print-only stylesheet can be added or just use media queries */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white; color: black; }
                    .card { border: 1px solid #ddd; box-shadow: none; }
                }
             `}</style>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Relatórios</h1>
                    <p className="text-muted-foreground">
                        Gere arquivos PDF do seu consumo para registro ou conferência.
                    </p>
                </div>
            </div>

            {/* Report Preview Card */}
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-8 shadow-lg print:shadow-none print:border-none print:w-full print:max-w-none">
                <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Relatório Mensal</h2>
                            <p className="text-sm text-muted-foreground">Wiresense Energy Monitor</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Data de Emissão</p>
                        <p className="font-mono font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Período de Referência</p>
                            <p className="text-lg font-medium">Últimos 30 dias</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Status do Sistema</p>
                            <p className="text-lg font-medium text-emerald-400">Normal</p>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-muted/20">
                        <h3 className="font-semibold mb-4">Resumo Financeiro</h3>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-muted-foreground">Custo Estimado Total</p>
                                <p className="text-3xl font-bold text-primary">{currency} 342,50</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Consumo Total</p>
                                <p className="text-xl font-mono">385 kWh</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground mt-8 text-center border-t border-border pt-6">
                        <p>Relatório gerado automaticamente pelo sistema Wiresense.</p>
                        <p>Os valores são estimativos baseados na tarifa configurada de {currency} 0.92/kWh.</p>
                    </div>
                </div>
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
