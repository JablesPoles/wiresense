import React, { useState } from 'react';
import { useDevice } from '../contexts/DeviceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Monitor, Zap, Sun, Trash2, Check, Smartphone, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const DevicesPage = () => {
    const { devices, currentDeviceId, setCurrentDeviceId, addDevice, isGenerator } = useDevice();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('consumer'); // 'consumer' | 'generator'

    const handleAddDevice = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        addDevice(newName, newType);

        // Reset and close
        setNewName('');
        setIsAdding(false);
    };

    const handleSelectDevice = (id) => {
        setCurrentDeviceId(id);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Gerenciar Dispositivos
                        <span className="text-sm px-2 py-0.5 rounded-full border bg-primary/10 border-primary/20 text-primary">
                            {devices.length} Total
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        Adicione e gerencie seus medidores de consumo e geração.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Novo Dispositivo
                </button>
            </div>

            {/* Device Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => {
                    const isSelected = currentDeviceId === device.id;
                    const isDevGenerator = /solar|pv|gerador|generator|inverter/i.test(device.id);
                    const Icon = isDevGenerator ? Sun : Zap;

                    // Dynamic Theme Colors
                    const modeData = isDevGenerator ? theme.modes.generator : theme.modes.consumer;
                    const primaryColor = modeData.primary;
                    const secondaryColor = modeData.secondary;

                    return (
                        <motion.div
                            key={device.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`
                                relative p-6 rounded-xl border backdrop-blur-sm cursor-pointer transition-all duration-300 group
                                ${isSelected
                                    ? 'shadow-lg'
                                    : 'bg-card border-border hover:border-primary/30 hover:bg-accent/5'
                                }
                            `}
                            style={{
                                borderColor: isSelected ? primaryColor : undefined,
                                backgroundColor: isSelected ? `${primaryColor}15` : undefined, // 10% opacity
                                boxShadow: isSelected ? `0 10px 30px -10px ${primaryColor}40` : undefined
                            }}
                            onClick={() => handleSelectDevice(device.id)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="p-3 rounded-lg flex items-center justify-center transition-colors"
                                    style={{
                                        backgroundColor: `${secondaryColor}20`,
                                        color: secondaryColor
                                    }}
                                >
                                    <Icon size={24} />
                                </div>
                                {isSelected && (
                                    <span
                                        className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: `${primaryColor}20`,
                                            color: primaryColor,
                                            border: `1px solid ${primaryColor}30`
                                        }}
                                    >
                                        <div
                                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        Ativo
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {device.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                ID: <span className="font-mono text-xs opacity-70">{device.id}</span>
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectDevice(device.id);
                                        navigate('/settings');
                                    }}
                                    className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                                >
                                    Configurar
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add Device Modal/Overlay */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-foreground">Adicionar Novo Dispositivo</h2>
                                <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
                                    <XIcon size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddDevice} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Nome do Dispositivo</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Ex: Ar Condicionado Sala"
                                        autoFocus
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-3">Tipo de Dispositivo</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setNewType('consumer')}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newType === 'consumer' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-background border-input hover:border-cyan-500/50'}`}
                                        >
                                            <Zap size={24} />
                                            <span className="text-sm font-medium">Consumidor</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewType('generator')}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newType === 'generator' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-background border-input hover:border-emerald-500/50'}`}
                                        >
                                            <Sun size={24} />
                                            <span className="text-sm font-medium">Gerador</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-accent text-foreground transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newName.trim()}
                                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        Criar Dispositivo
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Icon for close
const XIcon = ({ size = 24 }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 6 6 18" /><path d="m6 6 18 18" />
    </svg>
);

export default DevicesPage;
