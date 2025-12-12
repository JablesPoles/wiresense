
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Menu, X, FileText, ChevronLeft, ChevronRight, Monitor, LogOut, Zap } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import * as Avatar from '@radix-ui/react-avatar';

export const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Dispositivos', icon: Monitor, path: '/devices' },
    { name: 'Simulador', icon: Zap, path: '/simulator' }, // New Link
    { name: 'Histórico', icon: History, path: '/history' },
    { name: 'Relatórios', icon: FileText, path: '/reports' },
    { name: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  // Animation variants for smoother mobile transition
  const sidebarVariants = {
    mobileHidden: { x: -280 },
    mobileVisible: { x: 0 },
    desktop: { x: 0 }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-md text-foreground border border-border shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      {/* Sidebar Container - Always rendered, hidden via CSS on mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none print:hidden",
          "lg:relative lg:translate-x-0", // Desktop: Relative, always visible (reset translate)
          isOpen ? "translate-x-0" : "-translate-x-full", // Mobile: Toggle translate
          isCollapsed ? "lg:w-20" : "lg:w-64", // Desktop width
          "w-64" // Mobile width always 64
        )}
      >
        {/* Logo / Header */}
        <div className={cn("h-16 flex items-center border-b border-border px-4 relative", isCollapsed ? "justify-center" : "justify-between")}>
          <h1 className={cn(
            "text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent truncate overflow-hidden transition-all duration-300",
            isCollapsed ? "hidden" : "block"
          )}>
            Wiresense
          </h1>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Device Selector Removed from Here */}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? link.name : ""}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative overflow-hidden group shrink-0",
                isActive(link.path)
                  ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed ? "justify-center px-2" : ""
              )}
            >
              <link.icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{link.name}</span>
              )}
              {isActive(link.path) && !isCollapsed && (
                <div
                  className="absolute inset-0 bg-primary -z-10 rounded-lg"
                />
              )}
            </Link>
          ))}
        </nav>

      </aside >

      {/* Overlay for mobile - CSS Only */}
      {
        isOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )
      }
    </>
  );
};
