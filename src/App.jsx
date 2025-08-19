import React from 'react';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext'; 
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
      <MainLayout>
        <DashboardPage />
      </MainLayout>
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
    </>
  );
}

function App() {
  return (
    <TutorialProvider>
      <AppContent />
    </TutorialProvider>
  );
}

export default App;