
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DeviceProvider } from './contexts/DeviceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AchievementsProvider } from './contexts/AchievementsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import DevicesPage from './pages/DevicesPage';
import AchievementsPage from './pages/AchievementsPage';
import Tutorial from './pages/TutorialPage';

import LoadingScreen from './components/common/LoadingScreen';
import { useSettings } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SimulatorPage from './pages/SimulatorPage';

import { useNotificationSimulator } from './hooks/useNotificationSimulator';

// Helper to access location inside Router
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/devices" element={
          <ProtectedRoute>
            <DevicesPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/simulator" element={
          <ProtectedRoute>
            <SimulatorPage />
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// ... imports existing ...
import { setApiMode, getApiMode } from './services/apiService';

// Simple Toggle Component
const ModeToggle = () => {
  const isReal = getApiMode() === 'real';
  const toggle = () => setApiMode(isReal ? 'mock' : 'real');

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: 'rgba(17, 24, 39, 0.9)',
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <span style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF' }}>DATA SOURCE:</span>
      <button
        onClick={toggle}
        style={{
          background: isReal ? '#10B981' : '#4B5563',
          color: 'white',
          border: 'none',
          padding: '4px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '12px',
          transition: 'all 0.2s'
        }}
      >
        {isReal ? 'LIVE (Real)' : 'TEST (Mock)'}
      </button>
    </div>
  );
};

// ... existing AppContent ...

function AppContent() {
  const { showTutorial, setShowTutorial } = useTutorial();
  const { isLoading } = useSettings(); // Consume loading state

  // Activate simulation
  useNotificationSimulator();

  const handleTutorialComplete = () => {
    localStorage.setItem('tutorialVisto', 'true');
    setShowTutorial(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <AnimatedRoutes />
      </MainLayout>
      <ModeToggle /> {/* Injected Toggle */}
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
    </BrowserRouter>
  );
}

// ... existing App ...


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <LanguageProvider>
            <AchievementsProvider>
              <SettingsProvider>
                <TutorialProvider>
                  <DeviceProvider>
                    <AppContent />
                  </DeviceProvider>
                </TutorialProvider>
              </SettingsProvider>
            </AchievementsProvider>
          </LanguageProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider >
  );
}

export default App;
