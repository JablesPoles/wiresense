import { useDevice } from '../contexts/DeviceContext';
import React, { useState, useEffect } from 'react';
import { useSettings, useDeviceSettings } from '../contexts/SettingsContext';
import { motion } from 'framer-motion';
import { DollarSign, Globe, Zap, Bell, Save } from 'lucide-react';
import { VoltageSelector } from '../components/layout/VoltageSelector';
import { Switch } from '../components/ui/switch';

const SettingsSection = ({ title, icon: Icon, children, isSolar }) => (
    <div className={`bg-card border rounded-xl p-6 shadow-sm ${isSolar ? 'border-amber-500/20' : 'border-border'}`}>
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isSolar ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                <Icon size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
    render() {
        if (this.state.hasError) return <div className="p-4 text-red-500 bg-red-100/10 border border-red-500 rounded">Error: {this.state.error.message}</div>;
        return this.props.children;
    }
}

const SettingsPageContent = () => {
    const { currentDeviceId, isGenerator, devices } = useDevice();
    const currentDeviceName = devices?.find(d => d.id === currentDeviceId)?.name || currentDeviceId;

    const isSolar = isGenerator;

    // Global Settings
    const {
        updateSetting, // Still used for notifications? No, notifications are separate.
        notifications,
        updateNotificationSetting
    } = useSettings();

    // Device Settings
    const {
        voltage: deviceVoltage,
        tarifaKwh: deviceTariff,
        budgetLimit: deviceBudget,
        moeda: deviceMoeda,
        tariffMode: deviceTariffMode, // Device Specific
        peakStartHour: devicePeakStart, // Device Specific
        setVoltage: setDeviceVoltage,
        setTariff: setDeviceTariff,
        setBudget: setDeviceBudget,
        setMoeda: setDeviceMoeda,
        setTariffMode, // Setter
        setPeakStartHour // Setter
    } = useDeviceSettings(currentDeviceId);

    const [localVoltage, setLocalVoltage] = useState(deviceVoltage);
    const [localTarifa, setLocalTarifa] = useState(deviceTariff);
    const [localBudget, setLocalBudget] = useState(deviceBudget);

    const currencySymbol = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' }[deviceMoeda] || '$';

    // Synchronize local state when device changes or loading finishes
    useEffect(() => {
        setLocalVoltage(deviceVoltage);
        setLocalTarifa(deviceTariff);
        setLocalBudget(deviceBudget);
    }, [deviceVoltage, deviceTariff, deviceBudget, currentDeviceId]);

    const handleBudgetBlur = () => {
        setDeviceBudget(Number(localBudget));
    };

    const handleTarifaBlur = () => {
        setDeviceTariff(localTarifa);
    };

    const handleVoltageChange = (val) => {
        setLocalVoltage(val);
        setDeviceVoltage(val);
    };

    const moedas = {
        'BRL': 'Real (R$)',
        'USD': 'Dólar ($)',
        'EUR': 'Euro (€)',
    };

    const inputClass = `w-full bg-background border border-border rounded-lg py-2 pl-8 pr-4 text-foreground focus:ring-2 ${isSolar ? 'focus:ring-emerald-500' : 'focus:ring-primary'} focus:border-transparent outline-none transition-all`;
    const selectClass = `w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-foreground appearance-none focus:ring-2 ${isSolar ? 'focus:ring-emerald-500' : 'focus:ring-primary'} focus:border-transparent outline-none transition-all`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    Configurações
                    <span className="text-muted-foreground font-normal text-xl mx-2">/</span>
                    <span className="text-2xl text-primary">{currentDeviceName}</span>
                    <span className={`text-sm ml-auto px-2 py-0.5 rounded-full border ${isSolar ? 'bg-emerald-500/10 border-amber-500/20 text-amber-500' : 'bg-cyan-500/10 border-violet-500/20 text-cyan-500'}`}>
                        {isSolar ? 'Gerador' : 'Consumidor'}
                    </span>
                </h1>
                <p className="text-muted-foreground">Personalize sua experiência no Wiresense.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Electricity Settings */}
                <SettingsSection title="Eletricidade" icon={Zap} isSolar={isSolar}>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground">
                            Tensão da Rede (Voltagem)
                        </label>
                        <VoltageSelector
                            selectedVoltage={localVoltage}
                            onVoltageChange={handleVoltageChange}
                        />
                        <p className="text-xs text-muted-foreground">
                            Selecione a voltagem padrão da sua residência para cálculos corretos de potência.
                        </p>
                    </div>
                </SettingsSection>

                {/* Costs & Currency */}
                <SettingsSection title="Custos e Moeda" icon={DollarSign} isSolar={isSolar}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="tarifa-kwh" className="block text-sm font-medium text-muted-foreground mb-2">
                                Tarifa por kWh
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <input
                                    id="tarifa-kwh"
                                    type="number"
                                    step="0.01"
                                    value={localTarifa}
                                    onChange={(e) => setLocalTarifa(e.target.value)}
                                    onBlur={handleTarifaBlur}
                                    className={inputClass}
                                    placeholder="0.92"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Moeda de Exibição</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <select
                                    value={deviceMoeda}
                                    onChange={(e) => setDeviceMoeda(e.target.value)}
                                    className={selectClass}
                                >
                                    {Object.entries(moedas).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Orçamento / Budget */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Meta de Orçamento Mensal <span className="text-xs opacity-70">(0 para desativar)</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    value={localBudget}
                                    onChange={(e) => setLocalBudget(e.target.value)}
                                    onBlur={handleBudgetBlur}
                                    step="10"
                                    className={`w-full bg-card border border-border rounded-lg py-2 pl-10 pr-4 focus:ring-2 ${isSolar ? 'focus:ring-emerald-500' : 'focus:ring-primary'} outline-none transition-all`}
                                    placeholder="Ex: 200"
                                />
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* Modelo Tarifário */}
                <SettingsSection title="Modelo Tarifário" icon={DollarSign} isSolar={isSolar}>
                    <div className="space-y-6">
                        {/* Mode Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`cursor-pointer border rounded-lg p-4 transition-all ${deviceTariffMode !== 'white' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-muted/50 border-border hover:bg-muted'}`}
                                onClick={() => setTariffMode('conventional')}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-white">Convencional</span>
                                    {deviceTariffMode !== 'white' && <div className="w-3 h-3 rounded-full bg-primary" />}
                                </div>
                                <p className="text-sm text-muted-foreground">Valor único para kWh em qualquer horário.</p>
                            </div>

                            <div
                                className={`cursor-pointer border rounded-lg p-4 transition-all ${deviceTariffMode === 'white' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-muted/50 border-border hover:bg-muted'}`}
                                onClick={() => setTariffMode('white')}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-white">Tarifa Branca</span>
                                    {deviceTariffMode === 'white' && <div className="w-3 h-3 rounded-full bg-primary" />}
                                </div>
                                <p className="text-sm text-muted-foreground">Preços variam: Ponta (Caro), Intermediário e Fora de Ponta (Barato).</p>
                            </div>
                        </div>

                        {/* White Tariff Config */}
                        {deviceTariffMode === 'white' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-muted/30 rounded-lg p-4 border border-border">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Horário de Início da Ponta (Vermelha)
                                </label>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Consulte sua conta de luz. Geralmente começa às 18h ou 19h.
                                </p>
                                <select
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={devicePeakStart || 18}
                                    onChange={(e) => setPeakStartHour(parseInt(e.target.value))}
                                >
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                                    ))}
                                </select>

                                <div className="mt-4 text-xs text-muted-foreground bg-black/20 p-3 rounded border border-white/5">
                                    <p><strong>Configuração atual:</strong></p>
                                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                                        <li>Ponta (Vermelha): {devicePeakStart || 18}h - {(devicePeakStart || 18) + 3}h</li>
                                        <li>Intermediária (Amarela): {((devicePeakStart || 18) - 1)}h-{(devicePeakStart || 18)}h e {(devicePeakStart || 18) + 3}h-{(devicePeakStart || 18) + 4}h</li>
                                        <li>Fora de Ponta (Verde): Restante + Finais de Semana</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Custo Base do kWh ({deviceMoeda})
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={localTarifa}
                                onChange={(e) => setLocalTarifa(e.target.value)}
                                onBlur={handleTarifaBlur}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {deviceTariffMode === 'white'
                                    ? "Este valor será usado como referência para a 'Ponta'. O sistema aplicará descontos automáticos para os outros horários na estimativa (Ponta = 100%, Inter = ~70%, Fora = ~40%)."
                                    : "Valor único cobrado por kWh consumido."}
                            </p>
                        </div>
                    </div>
                </SettingsSection>

                {/* Alerts Configuration */}
                <SettingsSection title="Alertas e Notificações" icon={Bell} isSolar={isSolar}>
                    <div className="space-y-6">
                        {/* High Priority */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-white">Alertas de Alta Prioridade</label>
                                <p className="text-xs text-muted-foreground">Notificar sobre consumo excessivo (&gt;6kW) ou tempestades.</p>
                            </div>
                            <Switch
                                checked={notifications?.highPriority ?? true}
                                onCheckedChange={(val) => updateNotificationSetting('highPriority', val)}
                            />
                        </div>

                        {/* Weekly Report */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-white">Relatório Semanal</label>
                                <p className="text-xs text-muted-foreground">Receba um resumo de custos toda segunda-feira.</p>
                            </div>
                            <Switch
                                checked={notifications?.weeklyReport ?? false}
                                onCheckedChange={(val) => updateNotificationSetting('weeklyReport', val)}
                            />
                        </div>

                        {/* Educational Tips */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-white">Dicas Educativas</label>
                                <p className="text-xs text-muted-foreground">Exibir dicas de economia no Dashboard.</p>
                            </div>
                            <Switch
                                checked={notifications?.educationalTips ?? true}
                                onCheckedChange={(val) => updateNotificationSetting('educationalTips', val)}
                            />
                        </div>

                        <div className="pt-4 border-t border-border mt-4">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('tutorialVisto');
                                    window.location.reload();
                                }}
                                className="text-sm text-primary hover:underline"
                            >
                                Reiniciar Tutorial
                            </button>
                        </div>
                    </div>
                </SettingsSection>
            </div >
        </div >
    );
};

const SettingsPage = () => (
    <ErrorBoundary>
        <SettingsPageContent />
    </ErrorBoundary>
);

export default SettingsPage;
