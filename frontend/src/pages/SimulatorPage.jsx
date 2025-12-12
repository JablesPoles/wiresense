import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Droplets, Wind, Car, Tv, Laptop, Lightbulb, Coffee, Gamepad2, Snowflake, ChevronDown, ChevronUp } from 'lucide-react';
import { useDevice } from '../contexts/DeviceContext';

const SimulatorPage = () => {
    const { startSimulation, stopSimulation, simulationMode, activeSimulations, totalSimulatedWatts, savedDevices, addSavedDevice, removeSavedDevice, removeSimulation } = useDevice();
    const [isAdding, setIsAdding] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false); // Collapsible state for Active Devices

    // Helpers
    const availableIcons = [
        { name: "Zap", icon: Zap },
        { name: "Droplets", icon: Droplets },
        { name: "Wind", icon: Wind },
        { name: "Car", icon: Car },
        { name: "Tv", icon: Tv },
        { name: "Laptop", icon: Laptop },
        { name: "Lightbulb", icon: Lightbulb },
        { name: "Coffee", icon: Coffee },
        { name: "Generic", icon: Zap },
        { name: "Freezer", icon: Snowflake },
        { name: "Game", icon: Gamepad2 }
    ];

    const availableColors = [
        { name: "Blue", class: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
        { name: "Cyan", class: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
        { name: "Emerald", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
        { name: "Green", class: "text-green-400 bg-green-400/10 border-green-400/20" },
        { name: "Yellow", class: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
        { name: "Orange", class: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
        { name: "Red", class: "text-red-400 bg-red-400/10 border-red-400/20" },
        { name: "Pink", class: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
        { name: "Purple", class: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    ];

    const [selectedIcon, setSelectedIcon] = React.useState("Zap");
    const [selectedColor, setSelectedColor] = React.useState(availableColors[4].class);
    const [variance, setVariance] = React.useState(5);

    // Appliance Presets (Generic)
    // Appliance Presets (Generic)
    const presets = [
        { name: "Chuveiro Elétrico", watts: 5500, icon: Droplets, iconName: "Droplets", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
        { name: "Ar Condicionado", watts: 1800, icon: Wind, iconName: "Wind", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
        { name: "Carro Elétrico", watts: 7400, icon: Car, iconName: "Car", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
        { name: "Secador de Cabelo", watts: 2000, icon: Wind, iconName: "Wind", color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
        { name: "Microondas", watts: 1200, icon: Zap, iconName: "Zap", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
        { name: "Gaming PC", watts: 600, icon: Laptop, iconName: "Laptop", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    ];

    const handleInject = (appliance) => {
        startSimulation(appliance.watts, {
            name: appliance.name,
            color: appliance.color || "text-white bg-white/10 border-white/20",
            variance: appliance.variance, // Optional variance from saved device
            iconName: appliance.iconName || "Zap" // Ensure string name is passed
        });
    };

    const handleAddDevice = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newDevice = {
            name: formData.get('name'),
            watts: Number(formData.get('watts')),
            variance: Number(variance) / 100,
            color: selectedColor,
            iconName: selectedIcon
        };
        addSavedDevice(newDevice);
        setIsAdding(false);
        // Reset defaults
        setSelectedIcon("Zap");
        setSelectedColor(availableColors[4].class);
        setVariance(5);
    };

    const renderIcon = (iconName) => {
        const found = availableIcons.find(i => i.name === iconName);
        const IconComponent = found ? found.icon : Zap;
        return <IconComponent size={24} />;
    };

    return (
        <div className="space-y-8 p-4 md:p-6 pb-20 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Zap className="text-yellow-500" />
                    Simulador de Carga
                </h1>
                <p className="text-muted-foreground mt-2">
                    Simule o consumo de dispositivos reais ou fictícios para testar o sistema.
                </p>
            </div>

            {/* Active Status (Collapsible Accordion) */}
            {simulationMode && (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 overflow-hidden"
                >
                    {/* Header / Summary */}
                    <div className="p-4 md:p-6 flex items-center justify-between cursor-pointer hover:bg-yellow-500/5 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 rounded-full animate-pulse">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg md:text-xl flex items-center gap-2">
                                    Simulação Ativa
                                    <span className="text-sm font-normal opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                                        {activeSimulations?.length || 0} dispositivos
                                    </span>
                                </h3>
                                <p className="text-3xl font-bold tracking-tighter mt-1">
                                    {totalSimulatedWatts}<span className="text-lg opacity-60 font-normal ml-1">W</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); stopSimulation(); }}
                                className="hidden md:block px-4 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium border border-red-500/30 text-sm transition-colors"
                            >
                                Parar Tudo
                            </button>
                            <button className="p-2 rounded-full hover:bg-black/20 transition-colors">
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Content */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="p-4 md:p-6 pt-0 border-t border-yellow-500/10 space-y-3">
                                    <h4 className="text-sm uppercase tracking-wider opacity-60 font-semibold mb-2">Dispositivos em uso</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {activeSimulations?.map((sim) => (
                                            <motion.div
                                                key={sim.id}
                                                layout
                                                initial={{ scale: 0.95, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.95, opacity: 0 }}
                                                className={`p-3 rounded-lg border flex items-center justify-between ${sim.color || "border-white/10 bg-white/5"} relative group`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-black/20 rounded-lg">
                                                        {renderIcon(sim.iconName || "Zap")}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm text-foreground/90">{sim.name}</h4>
                                                        <p className="text-xs opacity-70">{sim.watts}W <span className="opacity-50">±{(sim.variance * 100).toFixed(0)}%</span></p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeSimulation(sim.id)}
                                                    className="p-1.5 hover:bg-red-500/20 text-foreground/50 hover:text-red-400 rounded transition-colors"
                                                    title="Desligar"
                                                >
                                                    <Zap size={14} className="rotate-180" /> {/* Turn off icon metaphor */}
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={stopSimulation}
                                        className="md:hidden w-full mt-4 py-3 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30"
                                    >
                                        Parar Simulação Completa
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Customized Simulation (Manual) */}
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Laptop size={18} /> Simulação Manual
                </h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const w = Number(e.target.watts.value);
                        const v = Number(e.target.variance.value) / 100;
                        if (w > 0) startSimulation(w, { name: "Personalizado", color: "text-white bg-white/10 border-white/20", variance: v, iconName: "Laptop" });
                    }}
                    className="flex flex-col sm:flex-row gap-4 items-end"
                >
                    <div className="flex-1 space-y-2">
                        <label className="text-sm text-muted-foreground">Potência (Watts)</label>
                        <div className="relative">
                            <input
                                name="watts"
                                type="number"
                                placeholder="ex: 3500"
                                className="w-full bg-background border rounded-lg px-3 py-2 pl-9 focus:ring-2 ring-primary/50 outline-none"
                                required
                            />
                            <Zap size={14} className="absolute left-3 top-3 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="w-full sm:w-32 space-y-2">
                        <label className="text-sm text-muted-foreground">Flutuação (%)</label>
                        <div className="relative">
                            <input
                                name="variance"
                                type="number"
                                placeholder="2"
                                defaultValue="5"
                                min="0" max="50"
                                className="w-full bg-background border rounded-lg px-3 py-2 pl-9 focus:ring-2 ring-primary/50 outline-none"
                                required
                            />
                            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">±</span>
                        </div>
                    </div>
                    <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                        Simular
                    </button>
                </form>
            </div>

            {/* Saved Devices (Registry) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Tv size={20} className="text-purple-400" />
                        Meus Dispositivos
                    </h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
                    >
                        {isAdding ? "Cancelar" : "+ Novo Dispositivo"}
                    </button>
                </div>

                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-xl border border-dashed mb-4 space-y-6 transition-colors duration-300 ${selectedColor}`}
                        onSubmit={handleAddDevice}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">Informações Básicas</label>
                                    <input name="name" required placeholder="Nome (Ex: Geladeira)" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm placeholder:text-white/30 focus:border-white/40 outline-none transition-colors" />
                                    <div className="relative">
                                        <input name="watts" type="number" required placeholder="Potência (Watts)" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pl-9 text-sm placeholder:text-white/30 focus:border-white/40 outline-none transition-colors" />
                                        <Zap size={14} className="absolute left-3 top-3.5 opacity-50" />
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="opacity-70">Flutuação (Simulação)</span>
                                            <span className="font-mono bg-black/20 px-2 py-0.5 rounded">± {variance}%</span>
                                        </div>
                                        <input
                                            name="variance"
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={variance}
                                            onChange={(e) => setVariance(e.target.value)}
                                            className="w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-3 block">Ícone</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {availableIcons.map(iconObj => {
                                            const Icon = iconObj.icon;
                                            return (
                                                <button
                                                    key={iconObj.name}
                                                    type="button"
                                                    onClick={() => setSelectedIcon(iconObj.name)}
                                                    className={`aspect-square flex items-center justify-center rounded-lg border transition-all ${selectedIcon === iconObj.name ? 'bg-white text-black border-white shadow-lg' : 'bg-black/20 border-transparent hover:bg-black/40 opacity-70 hover:opacity-100'}`}
                                                    title={iconObj.name}
                                                >
                                                    <Icon size={18} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-3 block">Cor do Card</label>
                                    <div className="flex flex-wrap gap-3">
                                        {availableColors.map((col, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedColor(col.class)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${col.class.replace('bg-opacity-10', 'bg-opacity-100')} ${selectedColor === col.class ? 'border-white scale-110 shadow-lg ring-2 ring-white/20' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                                title={col.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100">Cancelar</button>
                            <button type="submit" className="bg-white text-black hover:bg-white/90 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105">
                                Salvar Dispositivo
                            </button>
                        </div>
                    </motion.form>
                )}

                {savedDevices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-xl bg-card/30">
                        Nenhum dispositivo salvo. Adicione o primeiro acima!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedDevices.map((dev) => (
                            <motion.div
                                key={dev.id}
                                className={`flex items-center gap-4 p-6 rounded-xl border text-left transition-all ${dev.color} bg-opacity-5 hover:bg-opacity-10`}
                            >
                                <div className="p-3 rounded-full bg-black/20">
                                    {renderIcon(dev.iconName)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{dev.name}</h3>
                                    <p className="opacity-80 font-mono text-sm">{dev.watts}W <span className="text-xs opacity-50 ml-1">±{dev.variance * 100}%</span></p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleInject(dev)}
                                        className="text-xs bg-black/20 hover:bg-black/40 text-white border border-white/10 px-3 py-1.5 rounded transition-colors"
                                    >
                                        Simular
                                    </button>
                                    <button
                                        onClick={() => removeSavedDevice(dev.id)}
                                        className="text-xs text-red-400 hover:text-red-300 px-3 py-1 rounded transition-colors hover:bg-red-500/10"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-white/10 my-8" />

            {/* Presets (Generic) */}
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Droplets size={20} className="text-blue-400" />
                Exemplos Prontos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((app) => {
                    const Icon = app.icon;
                    return (
                        <motion.button
                            key={app.name}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleInject(app)}
                            className={`flex items-center gap-4 p-6 rounded-xl border text-left transition-all ${app.color} hover:bg-opacity-20`}
                        >
                            <div className={`p-3 rounded-full bg-black/20`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{app.name}</h3>
                                <p className="opacity-80 font-mono text-sm">{app.watts}W</p>
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
};

export default SimulatorPage;
