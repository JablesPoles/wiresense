import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';

export const ThemeSelector = () => {
    const { currentThemeId, setTheme, availableThemes } = useTheme();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableThemes.map((theme) => {
                const isActive = currentThemeId === theme.id;
                // Mock Mini Dashboard Colors
                const primary = `hsl(${theme.colors.primary})`;
                const bg = `hsl(${theme.colors.background})`;
                const card = `hsl(${theme.colors.card})`;

                return (
                    <motion.button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative rounded-xl border-2 overflow-hidden text-left transition-all ${isActive
                                ? 'border-primary ring-2 ring-primary/20 scale-[1.02]'
                                : 'border-border hover:border-primary/50 opacity-80 hover:opacity-100'
                            }`}
                    >
                        {/* Preview Window */}
                        <div
                            className="h-24 w-full p-3 flex flex-col gap-2 relative"
                            style={{ backgroundColor: bg }}
                        >
                            {/* Mock Header */}
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full opacity-20 bg-white" />
                                <div className="flex-1 h-2 rounded bg-white/10 my-auto" />
                            </div>

                            {/* Mock Cards */}
                            <div className="flex gap-2 mt-auto">
                                <div
                                    className="flex-1 h-10 rounded shadow-sm"
                                    style={{ backgroundColor: card, borderLeft: `3px solid ${primary}` }}
                                />
                                <div
                                    className="flex-1 h-10 rounded shadow-sm opacity-50"
                                    style={{ backgroundColor: card }}
                                />
                            </div>

                            {/* Active Checkmark */}
                            {isActive && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                    <Check size={12} />
                                </div>
                            )}
                        </div>

                        {/* Label */}
                        <div className="p-3 bg-card border-t border-border">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                {theme.name}
                            </h3>
                            <p className="text-xs text-muted-foreground capitalize">
                                {theme.type} • {theme.font === 'monospace' ? 'Mono' : 'Sans'}
                            </p>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};
