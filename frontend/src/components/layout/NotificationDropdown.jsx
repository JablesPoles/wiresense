import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Info, AlertTriangle, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../lib/utils';
// Removed duplicate import

export const NotificationDropdown = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll
    } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'energy': return <Zap size={16} className="text-cyan-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-full transition-all duration-300 outline-none group">
                    <Bell size={20} className={cn(
                        "transition-transform duration-300 group-hover:scale-110",
                        unreadCount > 0 && "animate-pulse-subtle" // Custom subtle pulse
                    )} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#09090b] animate-bounce-short" />
                    )}
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={10}
                    className="w-80 md:w-96 bg-[#1a1b26]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                        <span className="text-sm font-semibold text-white flex items-center gap-2">
                            Notificações
                            {unreadCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/20">
                                    {unreadCount} novas
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-1">
                            {notifications.length > 0 && (
                                <>
                                    <button
                                        onClick={markAllAsRead}
                                        className="p-1.5 text-xs text-muted-foreground hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                        title="Marcar todas como lidas"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        className="p-1.5 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                                        title="Limpar tudo"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/50 gap-3">
                                <Bell size={32} className="opacity-20" />
                                <span className="text-sm">Nada por aqui...</span>
                            </div>
                        ) : (
                            <div className="py-1">
                                {notifications.map((notif) => (
                                    <DropdownMenu.Item
                                        key={notif.id}
                                        onSelect={(e) => e.preventDefault()}
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            if (notif.actionLink) {
                                                navigate(notif.actionLink);
                                            }
                                        }}
                                        className={cn(
                                            "flex gap-3 px-4 py-3 cursor-pointer outline-none transition-colors border-b border-white/5 last:border-0 group/item",
                                            notif.read ? "bg-transparent opacity-60 hover:opacity-100" : "bg-gradient-to-r from-blue-500/5 to-transparent hover:bg-white/5"
                                        )}
                                    >
                                        <div className="mt-1 shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className={cn(
                                                    "text-sm leading-tight flex items-center gap-2",
                                                    notif.read ? "text-muted-foreground font-normal" : "text-white font-medium"
                                                )}>
                                                    {notif.title}
                                                    {notif.actionLink && <ArrowRight size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-blue-400" />}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notif.message}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <div className="shrink-0 self-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            </div>
                                        )}
                                    </DropdownMenu.Item>
                                ))}
                            </div>
                        )}
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
