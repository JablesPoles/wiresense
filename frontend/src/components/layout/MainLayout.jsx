import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDevice } from '../../contexts/DeviceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop

  const { isGenerator } = useDevice();
  const { theme } = useTheme();
  const isSolar = isGenerator;

  // Dynamic Dashboard Gradient - Lifted for Smooth Transitions
  // Determine gradient based on mode (Solar, Consumer, or Default)
  // Logic: Simulation takes precedence if we want, OR we keep Simulation overlay separate (DashboardPage handles overlay).
  // Here we handle the BASE ambient gradient.
  const themeMode = isSolar ? 'generator' : 'consumer';
  const activeGradient = theme?.modes?.[themeMode]?.gradient;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-500">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">

        {/* Header */}
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobile={false} // Logic handled in component queries usually
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6 relative z-10">
            {children}
          </div>

          {/* Background pattern - Consistent across themes */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            <div className="absolute inset-0 bg-grid-white/[0.05]" style={{ backgroundSize: '30px 30px' }}></div>
          </div>

          {/* Dynamic Theme Gradient */}
          <AnimatePresence mode='wait'>
            {location.pathname === '/' && activeGradient && (
              <motion.div
                key={isSolar ? 'solar-grad' : 'cons-grad'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="fixed inset-0 pointer-events-none z-0"
              >
                <div
                  className="absolute inset-0 w-full h-full transition-all duration-1000"
                  style={{ background: activeGradient }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
