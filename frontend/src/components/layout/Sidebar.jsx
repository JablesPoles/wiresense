
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Menu, X, FileText, ChevronLeft, ChevronRight, Monitor, LogOut, Zap, Award } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const links = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/' },
    { name: t('devices'), icon: Monitor, path: '/devices' },
    { name: t('simulator'), icon: Zap, path: '/simulator' },
    { name: t('achievements'), icon: Award, path: '/achievements' },
    { name: t('history'), icon: History, path: '/history' },
    { name: t('reports'), icon: FileText, path: '/reports' },
    { name: t('settings'), icon: Settings, path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed top-4 left-[240px] z-50 p-2 ml-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none print:hidden",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "w-[240px]"
        )}
      >
        <div
          className={cn(
            "h-16 flex items-center border-b border-border relative transition-all duration-300",
            isCollapsed ? "justify-center px-0 cursor-pointer hover:bg-muted/50" : "justify-between px-4"
          )}
          onClick={() => isCollapsed && setIsCollapsed(false)}
          title={isCollapsed ? "Expandir Sidebar" : ""}
        >
          <h1 className={cn(
            "font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate overflow-hidden transition-all duration-300",
            isCollapsed ? "text-2xl scale-110" : "text-xl"
          )}>
            {isCollapsed ? "WS" : "Wiresense v2"}
          </h1>

          {!isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent click
                setIsCollapsed(!isCollapsed);
              }}
              className="hidden lg:flex p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
              title="Recolher"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide pt-4">
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
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
