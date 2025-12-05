import React from 'react';
import { Sidebar } from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {children}
        </div>

        {/* Background gradient effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02]" style={{ backgroundSize: '30px 30px' }}></div>

          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-20" />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
