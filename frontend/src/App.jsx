import React from 'react';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext'; 
import { SettingsProvider } from './contexts/SettingsContext';
import { SettingsModal } from './components/layout/SettingsModal'; 
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import Tutorial from './pages/TutorialPage'; 

function AppContent() {
  const { showTutorial, setShowTutorial } = useTutorial();

  const handleTutorialComplete = () => {
    localStorage.setItem('tutorialVisto', 'true');
    setShowTutorial(false);
  };
  
  return (
    <>
      <SettingsModal /> {/* Modal de configurações global */}
      <MainLayout>
        <DashboardPage /> {/* Página principal do dashboard */}
      </MainLayout>
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
    </>
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
