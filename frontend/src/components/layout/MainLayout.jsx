import React from 'react';
import { Sidebar } from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>

        {/* Background gradient effects */}
        <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      </main>
    </div>
  );
};

export default MainLayout;
