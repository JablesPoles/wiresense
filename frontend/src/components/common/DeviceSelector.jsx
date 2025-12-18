import { useState, useRef, useEffect } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Zap, Sun, PlusCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function DeviceSelector({ className }) {
    const navigate = useNavigate();
    const { devices, currentDeviceId, setCurrentDeviceId, isGenerator, loading } = useDevice();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return <div className={`h-10 w-full bg-white/5 animate-pulse rounded-lg ${className}`}></div>;

    const currentDevice = devices.find(d => d.id === currentDeviceId) || devices[0];
    if (!currentDevice) return null;

    return (
        <div className={`relative ${className || 'w-full'}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-center sm:justify-between p-1.5 sm:px-3 sm:py-2 rounded-xl w-auto sm:w-full
                    border border-white/10 backdrop-blur-sm transition-all duration-300
                    ${isGenerator
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-amber-500/30'
                        : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-violet-500/30'
                    }
                `}
            >
                <div className="flex items-center gap-0 sm:gap-3 overflow-hidden">
                    <div className={`
                        p-1.5 rounded-lg shrink-0
                        ${isGenerator ? 'bg-emerald-500/20' : 'bg-cyan-500/20'}
                    `}>
                        {isGenerator
                            ? <Sun size={16} className="text-amber-400" />
                            : <Zap size={16} className="text-cyan-400" />
                        }
                    </div>
                    <div className="hidden sm:flex flex-col items-start min-w-0">
                        <span className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                            {t('monitoring')}
                        </span>
                        <span className="text-sm font-medium truncate w-full text-left">
                            {currentDevice.name}
                        </span>
                    </div>
                </div>
                <ChevronDown size={16} className={`hidden sm:block opacity-50 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="fixed top-20 left-4 right-4 w-auto sm:absolute sm:top-full sm:left-0 sm:w-full sm:mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-primary/10 max-h-[60vh] sm:max-h-[300px] overflow-y-auto">
                    <div className="text-xs text-muted-foreground px-2 py-2 font-medium">
                        {t('select_device')}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {devices.map(device => {
                            const isItemGenerator = /solar|pv|gerador|generator|inverter/i.test(device.id);
                            const isActive = currentDeviceId === device.id;
                            return (
                                <button
                                    key={device.id}
                                    onClick={() => {
                                        setCurrentDeviceId(device.id);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                                        ${isActive
                                            ? 'bg-primary/20 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                                        }
                                    `}
                                >
                                    {isItemGenerator
                                        ? <Sun size={14} className={isActive ? "text-amber-400" : "opacity-50"} />
                                        : <Zap size={14} className={isActive ? "text-cyan-400" : "opacity-50"} />
                                    }
                                    <span className="truncate">{device.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="h-px bg-border my-1" />

                    <button
                        onClick={() => {
                            navigate('/devices');
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                        <PlusCircle size={14} />
                        <span className="font-medium">{t('new_device')}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
