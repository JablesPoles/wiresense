
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Menu, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
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
      <AnimatePresence mode="wait">
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial="mobileHidden"
            animate="mobileVisible"
            exit="mobileHidden"
            variants={sidebarVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }} // Smoother spring
            className={cn(
              "fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-[width] duration-300 ease-in-out shadow-2xl lg:shadow-none print:hidden",
              // Mobile logic handled by framer-motion variants, Desktop logic handled by class width
              "lg:translate-x-0 lg:relative",
              isCollapsed ? "lg:w-20" : "lg:w-64",
              !isCollapsed ? "w-64" : "" // Mobile is always full width 64
            )}
          >
            {/* Logo / Header */}
            <div className={cn("h-16 flex items-center border-b border-border", isCollapsed ? "justify-center px-0" : "px-6")}>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent truncate overflow-hidden">
                {isCollapsed ? "WS" : "Wiresense"}
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? link.name : ""}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative overflow-hidden group",
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
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-primary -z-10"
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Collapse Toggle */}
            <div className="hidden lg:flex p-4 border-t border-border justify-end">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>

            {/* Footer / Status */}
            {!isCollapsed && (
              <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
                v1.0.0 • Online
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
// End of Sidebar component
