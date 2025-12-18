import React from 'react';
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAchievements, BADGES } from '../../contexts/AchievementsContext';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { DeviceSelector } from '../common/DeviceSelector';
import { NotificationDropdown } from './NotificationDropdown';
import { LanguageSelector } from '../settings/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';

export const Header = ({ isSidebarCollapsed, toggleSidebar, toggleCollapse, isMobile }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { equippedBadgeId } = useAchievements();
  const { t, language, changeLanguage } = useLanguage();

  const equippedBadge = equippedBadgeId ? BADGES.find(b => b.id === equippedBadgeId) : null;
  const BadgeIcon = equippedBadge ? equippedBadge.icon : null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-auto sm:w-48 lg:w-56">
          <DeviceSelector className="w-full py-1.5" />
        </div>

        <div className="hidden md:block">
          <LanguageSelector />
        </div>
        <NotificationDropdown />

        {currentUser && (
          <div className="relative group/menu">
            <button className="flex items-center gap-3 hover:bg-primary/10 rounded-full pl-2 pr-1 py-1 transition-all outline-none border border-transparent hover:border-primary/20 group-trigger">
              <span className="text-sm font-medium text-foreground/90 flex items-center gap-2 group-hover:text-primary transition-colors">
                {equippedBadge && (() => {
                  const tierColors = {
                    bronze: "bg-orange-500/20 text-orange-500 border-orange-500/30",
                    silver: "bg-zinc-400/20 text-zinc-300 border-zinc-400/30",
                    gold: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
                    legendary: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30 animate-pulse"
                  };
                  const colorClass = tierColors[equippedBadge.tier] || tierColors.bronze;

                  return (
                    <div className={`p-1 px-1.5 rounded-full border flex items-center gap-1.5 ${colorClass}`} title={equippedBadge.name}>
                      <BadgeIcon size={12} />
                      <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">{equippedBadge.tier}</span>
                    </div>
                  );
                })()}
                <span className="hidden sm:inline">{currentUser.displayName?.split(' ')[0]}</span>
              </span>
              <Avatar.Root className="h-8 w-8 rounded-full overflow-hidden border border-border group-hover:border-primary/50 bg-primary/5 flex items-center justify-center transition-colors">
                <Avatar.Image src={currentUser.photoURL} className="h-full w-full object-cover" />
                <Avatar.Fallback className="text-xs font-semibold text-primary">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
            </button>

            <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-xl p-1 shadow-2xl z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 transform origin-top-right ring-1 ring-primary/10">
              <div className="px-2 py-2 border-b border-border mb-1">
                <p className="text-sm font-medium text-foreground truncate">{currentUser.displayName}</p>
                <p className="text-xs text-muted-foreground truncate opacity-70">{currentUser.email}</p>
              </div>

              <div className="md:hidden px-2 py-2 border-b border-border mb-1">
                <p className="text-[10px] uppercase tracking-wider opacity-60 font-semibold mb-2 px-1">{t('language') || 'Idioma'}</p>
                <div className="flex gap-1">
                  {['pt', 'en', 'es'].map((code) => (
                    <button
                      key={code}
                      onClick={(e) => { e.stopPropagation(); changeLanguage(code); }}
                      className={cn(
                        "flex-1 py-1.5 text-xs rounded-md border transition-all",
                        language === code
                          ? "bg-primary/20 border-primary/30 text-primary font-bold"
                          : "border-transparent hover:bg-white/5 text-muted-foreground"
                      )}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Link to="/profile" className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer outline-none transition-colors">
                <User size={16} />
                <span>{t('profile') || 'Meu Perfil'}</span>
              </Link>

              <Link to="/settings" className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer outline-none transition-colors">
                <Settings size={16} />
                <span>{t('settings')}</span>
              </Link>

              <div className="h-px bg-border my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer outline-none transition-colors"
              >
                <LogOut size={16} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
