import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
import { SettingsProvider } from './contexts/SettingsContext';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import Tutorial from './pages/TutorialPage';

function AppContent() {
  const { showTutorial, setShowTutorial } = useTutorial();

  const handleTutorialComplete = () => {
    localStorage.setItem('tutorialVisto', 'true');
    setShowTutorial(false);
  };

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
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
