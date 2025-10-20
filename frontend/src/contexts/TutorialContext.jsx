import React, { createContext, useState, useEffect, useContext } from 'react';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    const hasViewedTutorial = localStorage.getItem('tutorialVisto');
    if (!hasViewedTutorial) {
      setShowTutorial(true);
    }
  }, []);

  return (
    <TutorialContext.Provider value={{ showTutorial, setShowTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  return useContext(TutorialContext);
};