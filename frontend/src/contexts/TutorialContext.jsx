import React, { createContext, useState, useEffect, useContext } from 'react';

// Cria contexto para controle do tutorial
const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  // Checa localStorage ao montar componente para mostrar tutorial
  useEffect(() => {
    const hasViewedTutorial = localStorage.getItem('tutorialVisto');
    if (!hasViewedTutorial) {
      setShowTutorial(true); // mostra tutorial se nunca visto
    }
  }, []);

  return (
    <TutorialContext.Provider value={{ showTutorial, setShowTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
};

// Hook personalizado para consumir o contexto
export const useTutorial = () => {
  return useContext(TutorialContext);
};
