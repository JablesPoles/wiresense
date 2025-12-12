import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDevice } from '../../contexts/DeviceContext';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop

  const { isGenerator } = useDevice();
  const isSolar = isGenerator;

  // Dashboard Gradient Logic (Lifted)
  const bgGradient = isSolar
    ? "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1), transparent 50%)"
    : "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1), transparent 50%)";

  // CRITICAL FIX: Do not render layout elements on Login page
  if (location.pathname === '/login') {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
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

          {/* Background gradient effects - Kept but adjusted z-index */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            <div className="absolute inset-0 bg-grid-white/[0.05]" style={{ backgroundSize: '30px 30px' }}></div>
          </div>

          {/* Dynamic Dashboard Gradient - Lifted for Smooth Transitions */}
          <AnimatePresence>
            {location.pathname === '/' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }} // Increased opacity for vibrancy
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }} // Slower transition for premium feel
                className="fixed inset-0 pointer-events-none z-0" // Changed -z-10 to z-0 to sit on top of bg-background but behind content (z-10)
              >
                {/* Primary Glow */}
                <div
                  className="absolute inset-0 w-full h-full transition-all duration-1000"
                  style={{
                    background: isSolar
                      ? "radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.25), transparent 70%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.15), transparent 50%)"
                      : "radial-gradient(circle at 50% -20%, rgba(6, 182, 212, 0.25), transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15), transparent 50%)"
                  }}
                />

                {/* Secondary Ambient Pulse */}
                <div
                  className={`absolute inset-0 w-full h-full ${isSolar ? 'bg-emerald-500/5' : 'bg-cyan-500/5'}`}
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
