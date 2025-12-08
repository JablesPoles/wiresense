import { useDevice } from '../../contexts/DeviceContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Zap, Sun, PlusCircle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function DeviceSelector({ className }) {
    const navigate = useNavigate();
    const { devices, currentDeviceId, setCurrentDeviceId, isGenerator, loading } = useDevice();

    if (loading) return <div className={`h-10 w-full bg-white/5 animate-pulse rounded-lg ${className}`}></div>;

    const currentDevice = devices.find(d => d.id === currentDeviceId) || devices[0];

    // Safety check just in case devices is empty
    if (!currentDevice) return null;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className={`
                        flex items-center justify-between px-3 py-2 rounded-xl
                        border border-white/10 backdrop-blur-sm transition-all duration-300
                        ${isGenerator
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-amber-500/30'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-violet-500/30'
                        }
                        ${className || 'w-full'}
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`
                            p-1.5 rounded-lg shrink-0
                            ${isGenerator ? 'bg-emerald-500/20' : 'bg-cyan-500/20'}
                        `}>
                            {isGenerator
                                ? <Sun size={16} className="text-amber-400" />
                                : <Zap size={16} className="text-cyan-400" />
                            }
                        </div>
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                                Monitorando
                            </span>
                            <span className="text-sm font-medium truncate w-full text-left">
                                {currentDevice.name}
                            </span>
                        </div>
                    </div>
                    <ChevronDown size={16} className="opacity-50 shrink-0 ml-2" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="w-[240px] bg-[#1a1b26]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                >
                    <DropdownMenu.Label className="text-xs text-gray-500 px-2 py-2 font-medium">
                        Selecione o Dispositivo
                    </DropdownMenu.Label>

                    {devices.map(device => {
                        const isItemGenerator = /solar|pv|gerador|generator|inverter/i.test(device.id);
                        return (
                            <DropdownMenu.Item
                                key={device.id}
                                onClick={() => setCurrentDeviceId(device.id)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer outline-none transition-colors
                                    ${currentDeviceId === device.id
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {isItemGenerator
                                    ? <Sun size={14} className={currentDeviceId === device.id ? "text-amber-400" : "opacity-50"} />
                                    : <Zap size={14} className={currentDeviceId === device.id ? "text-cyan-400" : "opacity-50"} />
                                }
                                <span className="truncate">{device.name}</span>
                            </DropdownMenu.Item>
                        );
                    })}

                    <DropdownMenu.Separator className="h-px bg-white/10 my-1" />

                    <DropdownMenu.Item
                        onClick={() => navigate('/devices')}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer outline-none transition-colors text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                        <PlusCircle size={14} />
                        <span className="font-medium">Novo Dispositivo</span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
