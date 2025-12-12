import React from 'react';
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { DeviceSelector } from '../common/DeviceSelector';
import { NotificationDropdown } from './NotificationDropdown';

export const Header = ({ isSidebarCollapsed, toggleSidebar, toggleCollapse, isMobile }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
      {/* Sidebar Toggle (Mobile) */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden md:block w-48 lg:w-56">
          <DeviceSelector className="w-full py-1.5" />
        </div>

        <NotificationDropdown />

        {currentUser && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-3 hover:bg-white/5 rounded-full pl-2 pr-1 py-1 transition-all outline-none border border-transparent hover:border-white/10 group">
                <span className="text-sm font-medium text-white/90 hidden md:block group-hover:text-white">
                  {currentUser.displayName?.split(' ')[0]}
                </span>
                <Avatar.Root className="h-8 w-8 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                  <Avatar.Image src={currentUser.photoURL} className="h-full w-full object-cover" />
                  <Avatar.Fallback className="text-xs font-semibold text-gray-400">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="w-56 bg-[#1a1b26]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-2 py-2 border-b border-white/5 mb-1">
                  <p className="text-sm font-medium text-white truncate">{currentUser.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate opacity-70">{currentUser.email}</p>
                </div>

                <DropdownMenu.Item asChild>
                  <Link to="/profile" className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer outline-none transition-colors">
                    <User size={16} />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <Link to="/settings" className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer outline-none transition-colors">
                    <Settings size={16} />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-white/10 my-1" />

                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer outline-none transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  );
};
