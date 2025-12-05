import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Histórico', icon: History, path: '/history' },
    { name: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar-background rounded-md text-sidebar-foreground border border-sidebar-border"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <AnimatePresence mode="wait">
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col transform lg:transform-none lg:relative transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          >
            {/* Logo / Header */}
            <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Wiresense
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative overflow-hidden",
                    isActive(link.path)
                      ? "text-sidebar-primary-foreground bg-sidebar-primary shadow-lg shadow-sidebar-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <link.icon size={20} />
                  <span>{link.name}</span>
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-sidebar-primary -z-10"
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Footer / Status */}
            <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50 text-center">
              v0.1.0 • Connected
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden glass"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
