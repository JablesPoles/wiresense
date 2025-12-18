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

  // Helper to convert Hex to HSL for Tailwind variables
  const hexToHsl = (hex) => {
    if (!hex) return '0 0% 0%'; // Fallback
    try {
      let c = hex.substring(1).split('');
      if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      c = '0x' + c.join('');
      let r = (c >> 16) & 255;
      let g = (c >> 8) & 255;
      let b = c & 255;
      r /= 255; g /= 255; b /= 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return `${(h * 360).toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
    } catch (e) {
      console.warn("HexToHsl failed", e);
      return '0 0% 0%';
    }
  };

  // Helper to determine contrast color (Black or White) based on brightness
  const getContrastColor = (hex) => {
    if (!hex) return '0 0% 100%';
    try {
      let c = hex.substring(1).split('');
      if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      c = '0x' + c.join('');
      let r = (c >> 16) & 255;
      let g = (c >> 8) & 255;
      let b = c & 255;
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq >= 150 ? '0 0% 0%' : '0 0% 100%';
    } catch (e) {
      return '0 0% 100%';
    }
  };

  // Inject Dynamic Mode Colors
  React.useEffect(() => {
    if (theme?.modes?.[themeMode]) {
      const colors = theme.modes[themeMode];
      const root = document.documentElement;

      const primaryHsl = hexToHsl(colors.primary);
      const secondaryHsl = hexToHsl(colors.secondary);
      const primaryForegroundHsl = getContrastColor(colors.primary);

      // Convert and set
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--secondary', secondaryHsl);
      root.style.setProperty('--primary-foreground', primaryForegroundHsl);

      // Optional: Set ring to match primary
      root.style.setProperty('--ring', primaryHsl);
    }
  }, [theme, themeMode]);

  // Bypass Layout for Login Page
  if (location.pathname === '/login') {
    return (
      <div className="bg-background text-foreground font-sans antialiased">
        {children}
      </div>
    );
  }

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
