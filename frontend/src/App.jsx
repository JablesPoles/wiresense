import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
import { SettingsProvider } from './contexts/SettingsContext';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Tutorial from './pages/TutorialPage';

import LoadingScreen from './components/common/LoadingScreen';
import { useSettings } from './contexts/SettingsContext';

function AppContent() {
  const { showTutorial, setShowTutorial } = useTutorial();
  const { isLoading } = useSettings(); // Consume loading state

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
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
    </BrowserRouter>
  );
}

function App() {
  return (
    <SettingsProvider>
      <TutorialProvider>
        <AppContent />
      </TutorialProvider>
    </SettingsProvider>
  );
}

export default App;
