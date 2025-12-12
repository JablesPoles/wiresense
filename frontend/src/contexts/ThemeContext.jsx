import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
    CYBERPUNK: {
        id: 'cyberpunk',
        name: 'Cyberpunk (Default)',
        type: 'dark',
        radius: '0.75rem',
        font: 'sans-serif',
        colors: {
            background: '222 47% 11%',
            card: '217 33% 17%',
            text: '210 40% 98%',
        },
        modes: {
            consumer: {
                primary: '#06b6d4', // Cyan
                secondary: '#8b5cf6', // Violet
                gradient: 'radial-gradient(circle at 50% -20%, rgba(6, 182, 212, 0.25), transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15), transparent 50%)',
                iconColor: 'text-cyan-500' // Tailwind class for simple icons
            },
            generator: {
                primary: '#10b981', // Emerald
                secondary: '#fbbf24', // Amber
                gradient: 'radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.25), transparent 70%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.15), transparent 50%)',
                iconColor: 'text-emerald-500'
            },
            simulator: {
                primary: '#f59e0b', // Amber
                secondary: '#ef4444', // Red
                overlay: 'radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
                iconColor: 'text-amber-500'
            }
        }
    },
    OCEAN: {
        id: 'ocean',
        name: 'Ocean Depth',
        type: 'dark',
        radius: '0.5rem',
        font: 'sans-serif',
        colors: {
            background: '222 47% 10%', // Very dark blue
            card: '215 28% 17%', // Slate blueish
            text: '210 40% 98%',
        },
        modes: {
            consumer: {
                primary: '#3b82f6', // Bright Blue
                secondary: '#0ea5e9', // Sky Blue
                // Deep blue gradient
                gradient: 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.3), transparent 70%), radial-gradient(circle at 90% 40%, rgba(14, 165, 233, 0.15), transparent 50%)',
                iconColor: 'text-blue-500'
            },
            generator: {
                primary: '#06b6d4', // Cyan (Solar in ocean context)
                secondary: '#22d3ee', // Light Cyan
                gradient: 'radial-gradient(circle at 50% -20%, rgba(6, 182, 212, 0.3), transparent 70%), radial-gradient(circle at 10% 20%, rgba(34, 211, 238, 0.1), transparent 50%)',
                iconColor: 'text-cyan-400'
            },
            simulator: {
                primary: '#f43f5e', // Rose (Warning)
                secondary: '#fb7185',
                overlay: 'radial-gradient(circle at 50% 10%, rgba(244, 63, 94, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
                iconColor: 'text-rose-500'
            }
        }
    },
    FOREST: {
        id: 'forest',
        name: 'Forest Zen',
        type: 'dark',
        radius: '1rem',
        font: 'sans-serif',
        colors: {
            background: '150 30% 8%', // Deep Green Black
            card: '150 15% 12%',
            text: '140 20% 96%',
        },
        modes: {
            consumer: {
                primary: '#84cc16', // Lime (Consumption is natural here?)
                secondary: '#22c55e', // Green
                gradient: 'radial-gradient(circle at 50% -20%, rgba(132, 204, 22, 0.2), transparent 70%), radial-gradient(circle at 80% 30%, rgba(34, 197, 94, 0.1), transparent 50%)',
                iconColor: 'text-lime-500'
            },
            generator: {
                primary: '#eab308', // Yellow (Sun)
                secondary: '#facc15', // Gold
                gradient: 'radial-gradient(circle at 50% -20%, rgba(234, 179, 8, 0.25), transparent 70%), radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.1), transparent 50%)',
                iconColor: 'text-yellow-500'
            },
            simulator: {
                primary: '#d97706', // Amber-700
                secondary: '#b45309',
                overlay: 'radial-gradient(circle at 50% 10%, rgba(217, 119, 6, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
                iconColor: 'text-amber-600'
            }
        }
    },
    SUNSET: {
        id: 'sunset',
        name: 'Sunset Glow',
        type: 'dark',
        radius: '1.5rem',
        font: 'sans-serif',
        colors: {
            background: '270 20% 10%', // Deep Purple Black
            card: '270 15% 14%',
            text: '30 30% 98%',
        },
        modes: {
            consumer: {
                primary: '#c026d3', // Fuchsia
                secondary: '#db2777', // Pink
                gradient: 'radial-gradient(circle at 50% -20%, rgba(192, 38, 211, 0.25), transparent 70%), radial-gradient(circle at 90% 50%, rgba(219, 39, 119, 0.15), transparent 50%)',
                iconColor: 'text-fuchsia-500'
            },
            generator: {
                primary: '#f97316', // Orange
                secondary: '#f59e0b', // Amber
                gradient: 'radial-gradient(circle at 50% -20%, rgba(249, 115, 22, 0.25), transparent 70%), radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.15), transparent 50%)',
                iconColor: 'text-orange-500'
            },
            simulator: {
                primary: '#ef4444', // Red
                secondary: '#dc2626',
                overlay: 'radial-gradient(circle at 50% 10%, rgba(239, 68, 68, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
                iconColor: 'text-red-500'
            }
        }
    },
    TERMINAL: {
        id: 'terminal',
        name: 'Terminal',
        type: 'dark',
        radius: '0px',
        font: 'monospace',
        colors: {
            background: '0 0% 0%',
            card: '0 0% 6%',
            text: '120 70% 60%',
        },
        modes: {
            consumer: {
                primary: '#22c55e', // Green
                secondary: '#16a34a',
                gradient: 'none', // Flat black
                iconColor: 'text-green-500'
            },
            generator: {
                primary: '#22c55e', // Green (Everything is green in terminal)
                secondary: '#4ade80',
                gradient: 'none',
                iconColor: 'text-green-400'
            },
            simulator: {
                primary: '#ef4444', // Red (Error)
                secondary: '#b91c1c',
                overlay: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 100%)', // subtle red glow
                iconColor: 'text-red-500'
            }
        }
    },
    DRACULA: {
        id: 'dracula',
        name: 'Dracula',
        type: 'dark',
        radius: '0.25rem',
        font: 'monospace',
        colors: {
            background: '231 15% 18%', // #282a36
            card: '232 14% 31%', // #44475a
            text: '60 30% 96%', // #f8f8f2
        },
        modes: {
            consumer: {
                primary: '#bd93f9', // Purple
                secondary: '#ff79c6', // Pink
                gradient: 'radial-gradient(circle at 50% -20%, rgba(189, 147, 249, 0.2), transparent 70%)',
                iconColor: 'text-purple-400'
            },
            generator: {
                primary: '#f1fa8c', // Yellow
                secondary: '#8be9fd', // Cyan
                gradient: 'radial-gradient(circle at 50% -20%, rgba(241, 250, 140, 0.15), transparent 70%)',
                iconColor: 'text-yellow-200'
            },
            simulator: {
                primary: '#ff5555', // Red
                secondary: '#ffb86c', // Orange
                overlay: 'radial-gradient(circle at 50% 10%, rgba(255, 85, 85, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
                iconColor: 'text-red-400'
            }
        }
    },
    CONTRAST: {
        id: 'contrast',
        name: 'High Contrast',
        type: 'dark',
        radius: '0.5rem',
        font: 'sans-serif',
        colors: {
            background: '0 0% 0%',
            card: '0 0% 10%',
            text: '0 0% 100%',
        },
        modes: {
            consumer: {
                primary: '#ffffff',
                secondary: '#cccccc',
                gradient: 'none',
                iconColor: 'text-white'
            },
            generator: {
                primary: '#ffff00', // Pure Yellow
                secondary: '#ffffff',
                gradient: 'none',
                iconColor: 'text-yellow-400'
            },
            simulator: {
                primary: '#ff0000', // Pure Red
                secondary: '#ffffff',
                overlay: 'none', // No distraction
                iconColor: 'text-red-500'
            }
        }
    }
};

export const ThemeProvider = ({ children }) => {
    const [currentThemeId, setCurrentThemeId] = useState(() => {
        return localStorage.getItem('wiresense_theme') || 'cyberpunk';
    });

    const currentTheme = Object.values(THEMES).find(t => t.id === currentThemeId) || THEMES.CYBERPUNK;

    useEffect(() => {
        localStorage.setItem('wiresense_theme', currentThemeId);

        // Inject CSS Variables for BASE layout
        const root = document.documentElement;
        const colors = currentTheme.colors;

        root.style.setProperty('--background', colors.background);
        root.style.setProperty('--card', colors.card);
        root.style.setProperty('--foreground', colors.text);
        root.style.setProperty('--radius', currentTheme.radius);

        // Font injection
        if (currentTheme.font === 'monospace') {
            root.style.setProperty('--font-sans', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace');
            document.body.style.fontFamily = 'var(--font-sans)';
        } else {
            root.style.removeProperty('--font-sans');
            document.body.style.fontFamily = '';
        }

    }, [currentThemeId]);

    const value = {
        currentThemeId,
        setTheme: setCurrentThemeId,
        theme: currentTheme,
        availableThemes: Object.values(THEMES)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
