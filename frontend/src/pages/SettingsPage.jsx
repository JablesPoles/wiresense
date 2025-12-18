import { useDevice } from '../contexts/DeviceContext';
import React, { useState, useEffect } from 'react';
import { useSettings, useDeviceSettings } from '../contexts/SettingsContext';
import { DollarSign, Globe, Zap, Bell, Save, Settings, FileText, Palette } from 'lucide-react';
import { VoltageSelector } from '../components/layout/VoltageSelector';
import { Switch } from '../components/ui/switch';
import { ThemeSelector } from '../components/settings/ThemeSelector';
import { useAchievements } from '../contexts/AchievementsContext'; // Wire Gamification
import { useLanguage } from '../contexts/LanguageContext';
import { PageTransition } from '../components/layout/PageTransition';

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
    const { t } = useLanguage();

    const {
        tipoFase, // Add this
        updateSetting,
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

    const { incrementStat } = useAchievements(); // Gamification Hook

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
        incrementStat('settingsChanged');
    };

    const handleTarifaBlur = () => {
        setDeviceTariff(localTarifa);
        incrementStat('settingsChanged');
    };

    const handleVoltageChange = (val) => {
        setLocalVoltage(val);
        setDeviceVoltage(val);
        incrementStat('settingsChanged');
    };



    const moedas = {
        'BRL': 'Real (R$)',
        'USD': 'Dólar ($)',
        'EUR': 'Euro (€)',
    };

    const inputClass = `w-full bg-background border border-border rounded-lg py-2 pl-8 pr-4 text-foreground focus:ring-2 ${isSolar ? 'focus:ring-emerald-500' : 'focus:ring-primary'} focus:border-transparent outline-none transition-all`;
    const selectClass = `w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-foreground appearance-none focus:ring-2 ${isSolar ? 'focus:ring-emerald-500' : 'focus:ring-primary'} focus:border-transparent outline-none transition-all`;

    return (
        <PageTransition className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-3">
                    <span className="opacity-50 font-normal">{t('settings')}</span>
                    <span className="text-muted-foreground font-normal text-xl">/</span>
                    <span className="text-primary truncate max-w-[180px] sm:max-w-md md:max-w-none" title={currentDeviceName}>{currentDeviceName}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium inline-flex items-center justify-center backdrop-blur-md transition-colors ${isGenerator ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'}`}>
                        {isGenerator ? t('generator') : t('consumer')}
                    </span>
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t('settings_desc')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Electricity Settings */}
                <SettingsSection title={t('electricity')} icon={Zap} isSolar={isGenerator}>
                    <div className="space-y-4">

                        <VoltageSelector
                            selectedVoltage={localVoltage}
                            onVoltageChange={handleVoltageChange}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('voltage_desc')}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground block mb-2">{t('phase_type')} <span className="text-xs opacity-50 font-normal">({t('informative_only')})</span></label>
                        <div className="grid grid-cols-3 gap-2">
                            {['single_phase', 'two_phase', 'three_phase'].map((faseKey) => (
                                <button
                                    key={faseKey}
                                    onClick={() => updateSetting('tipoFase', t(faseKey))}
                                    className={`px-3 py-2 rounded-md text-sm transition-all ${tipoFase === t(faseKey)
                                        ? (isGenerator ? 'bg-amber-500 text-black font-medium shadow-md' : 'bg-primary text-primary-foreground font-medium shadow-md')
                                        : 'hover:bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {t(faseKey)}
                                </button>
                            ))}
                        </div>
                    </div>
                </SettingsSection>

                {/* Costs & Currency */}
                <SettingsSection title={t('costs_currency')} icon={DollarSign} isSolar={isSolar}>
                    <div className="space-y-4">
                        <div>
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-white">{t('base_cost_kwh')}</label>
                                <p className="text-xs text-muted-foreground">{t('conventional_tariff_cost_desc')}</p>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">{currencySymbol}</span>
                                <input
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
                            <label className="block text-sm font-medium text-muted-foreground mb-2">{t('display_currency')}</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <select
                                    value={deviceMoeda}
                                    onChange={(e) => { setDeviceMoeda(e.target.value); incrementStat('settingsChanged'); }}
                                    className={selectClass}
                                >
                                    {Object.entries(moedas).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Budget Goal */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                {t('monthly_budget_goal')} <span className="text-xs opacity-70">({t('zero_to_disable')})</span>
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

                {/* Tariff Model */}
                <SettingsSection title={t('tariff_model')} icon={FileText} isSolar={isGenerator}>
                    <div className="space-y-6">
                        {/* Mode Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`cursor-pointer border rounded-lg p-4 transition-all ${deviceTariffMode !== 'white' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-muted/50 border-border hover:bg-muted'}`}
                                onClick={() => { setTariffMode('conventional'); incrementStat('settingsChanged'); }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-white">{t('conventional')}</span>
                                    {deviceTariffMode !== 'white' && <div className="w-3 h-3 rounded-full bg-primary" />}
                                </div>
                                <p className="text-sm text-muted-foreground">{t('conventional_desc')}</p>
                            </div>

                            <div
                                className={`cursor-pointer border rounded-lg p-4 transition-all ${deviceTariffMode === 'white' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-muted/50 border-border hover:bg-muted'}`}
                                onClick={() => { setTariffMode('white'); incrementStat('settingsChanged'); }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-white">{t('white_tariff')}</span>
                                    {deviceTariffMode === 'white' && <div className="w-3 h-3 rounded-full bg-primary" />}
                                </div>
                                <p className="text-sm text-muted-foreground">{t('white_tariff_desc')}</p>
                            </div>
                        </div>

                        {/* White Tariff Config */}
                        {deviceTariffMode === 'white' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-muted/30 rounded-lg p-4 border border-border">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('peak_start_hour')}
                                </label>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {t('peak_start_hour_desc')}
                                </p>
                                <select
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={devicePeakStart || 18}
                                    onChange={(e) => { setPeakStartHour(parseInt(e.target.value)); incrementStat('settingsChanged'); }}
                                >
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                                    ))}
                                </select>

                                <div className="mt-4 text-xs text-muted-foreground bg-black/20 p-3 rounded border border-white/5">
                                    <p><strong>{t('current_config')}:</strong></p>
                                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                                        <li>
                                            {t('peak_time_label')}: {((devicePeakStart || 18) + 24) % 24}h - {((devicePeakStart || 18) + 3 + 24) % 24}h
                                        </li>
                                        <li>
                                            {t('intermediate_time_label')}: {((devicePeakStart || 18) - 1 + 24) % 24}h - {((devicePeakStart || 18) + 24) % 24}h {t('and')} {((devicePeakStart || 18) + 3 + 24) % 24}h - {((devicePeakStart || 18) + 4 + 24) % 24}h
                                        </li>
                                        <li>{t('off_peak_time_label')}: {t('remaining_hours_weekends')}</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('base_cost_kwh', { currency: deviceMoeda })}
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
                                    ? t('white_tariff_cost_desc')
                                    : t('conventional_tariff_cost_desc')}
                            </p>
                        </div>
                    </div>
                </SettingsSection>

                {/* Appearance / Themes */}
                <SettingsSection title={t('appearance_themes')} icon={Palette} isSolar={isSolar}>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t('customize_theme_desc')}
                        </p>
                        <ThemeSelector />
                    </div>
                </SettingsSection>

                {/* Alerts Configuration */}
                <SettingsSection title={t('alerts_notifications')} icon={Bell} isSolar={isSolar}>
                    <div className="space-y-6">
                        {/* High Priority */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-white">{t('high_priority_alerts')}</label>
                                <p className="text-xs text-muted-foreground">{t('high_priority_alerts_desc')}</p>
                            </div>
                            <Switch
                                checked={notifications?.highPriority ?? true}
                                onCheckedChange={(val) => { updateNotificationSetting('highPriority', val); incrementStat('settingsChanged'); }}
                            />
                        </div>

                        {/* Weekly Report */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-white">{t('weekly_report')}</label>
                                <p className="text-xs text-muted-foreground">{t('weekly_report_desc')}</p>
                            </div>
                            <Switch
                                checked={notifications?.weeklyReport ?? false}
                                onCheckedChange={(val) => { updateNotificationSetting('weeklyReport', val); incrementStat('settingsChanged'); }}
                            />
                        </div>

                        {/* Educational Tips */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-white">{t('educational_tips')}</label>
                                <p className="text-xs text-muted-foreground">{t('educational_tips_desc')}</p>
                            </div>
                            <Switch
                                checked={notifications?.educationalTips ?? true}
                                onCheckedChange={(val) => { updateNotificationSetting('educationalTips', val); incrementStat('settingsChanged'); }}
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
                                {t('restart_tutorial')}
                            </button>
                        </div>
                    </div>
                </SettingsSection>
            </div >
        </PageTransition>
    );
};

const SettingsPage = () => (
    <ErrorBoundary>
        <SettingsPageContent />
    </ErrorBoundary>
);

export default SettingsPage;
