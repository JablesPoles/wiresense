import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'framer-motion';
import { DollarSign, Globe, Zap, Bell, Save } from 'lucide-react';
import { VoltageSelector } from '../components/layout/VoltageSelector';

const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Icon size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const SettingsPage = () => {
    const {
        voltage, updateVoltage,
        tarifaKwh, updateTarifaKwh,
        moeda, updateMoeda
    } = useSettings();

    const moedas = {
        'BRL': 'Real (R$)',
        'USD': 'Dólar ($)',
        'EUR': 'Euro (€)',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Configurações</h1>
                <p className="text-muted-foreground">Personalize sua experiência no Wiresense.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Electricity Settings */}
                <SettingsSection title="Eletricidade" icon={Zap}>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground">
                            Tensão da Rede (Voltagem)
                        </label>
                        <VoltageSelector
                            selectedVoltage={voltage}
                            onVoltageChange={updateVoltage}
                        />
                        <p className="text-xs text-muted-foreground">
                            Selecione a voltagem padrão da sua residência para cálculos corretos de potência.
                        </p>
                    </div>
                </SettingsSection>

                {/* Costs & Currency */}
                <SettingsSection title="Custos e Moeda" icon={DollarSign}>
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
                                    value={tarifaKwh}
                                    onChange={(e) => updateTarifaKwh(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg py-2 pl-8 pr-4 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="0.92"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="moeda" className="block text-sm font-medium text-muted-foreground mb-2">
                                Moeda de Exibição
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <select
                                    id="moeda"
                                    value={moeda}
                                    onChange={(e) => updateMoeda(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-foreground appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    {Object.entries(moedas).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* Alerts (Placeholder for now) */}
                <SettingsSection title="Alertas e Notificações" icon={Bell}>
                    <div className="text-sm text-muted-foreground italic">
                        Configurações de alerta em breve...
                    </div>
                </SettingsSection>
            </div>
        </div>
    );
};

export default SettingsPage;
