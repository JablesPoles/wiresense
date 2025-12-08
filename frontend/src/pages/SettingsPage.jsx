import { useDevice } from '../contexts/DeviceContext';
import React, { useState, useEffect } from 'react';
import { useSettings, useDeviceSettings } from '../contexts/SettingsContext';
import { motion } from 'framer-motion';
import { DollarSign, Globe, Zap, Bell, Save } from 'lucide-react';
import { VoltageSelector } from '../components/layout/VoltageSelector';

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
    const {
        voltage: deviceVoltage,
        tarifaKwh: deviceTariff,
        budgetLimit: deviceBudget,
        moeda: deviceMoeda,
        setVoltage: setDeviceVoltage,
        setTariff: setDeviceTariff,
        setBudget: setDeviceBudget,
        setMoeda: setDeviceMoeda
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

                {/* Alerts Configuration */}
                <SettingsSection title="Alertas e Notificações" icon={Bell} isSolar={isSolar}>
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground italic">
                            Configurações de alerta em breve...
                        </div>
                        <div className="pt-4 border-t border-border">
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
