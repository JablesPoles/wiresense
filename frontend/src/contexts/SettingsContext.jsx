import React, { createContext, useState, useContext } from 'react';

// Cria o contexto para configurações globais
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // Estado para controle da abertura do modal de configurações
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Estado da voltagem do usuário, inicializando a partir do localStorage
  const [voltage, setVoltage] = useState(() => {
    const savedVoltage = localStorage.getItem('user_voltage');
    return savedVoltage ? Number(savedVoltage) : 127; // default 127V
  });

  // Estado da tarifa por kWh, inicializando do localStorage
  const [tarifaKwh, setTarifaKwh] = useState(() => {
    const savedTarifa = localStorage.getItem('user_tarifa_kwh');
    return savedTarifa ? Number(savedTarifa) : 0.92; // default 0.92
  });

  // Estado da moeda, inicializando do localStorage
  const [moeda, setMoeda] = useState(() => {
    return localStorage.getItem('user_moeda') || 'BRL'; // default BRL
  });

  // Função para atualizar a voltagem e persistir no localStorage
  const updateVoltage = (newVoltage) => {
    const numericVoltage = Number(newVoltage);
    if (isNaN(numericVoltage)) return; // validação básica
    setVoltage(numericVoltage);
    localStorage.setItem('user_voltage', numericVoltage);
  };
  
  // Função para atualizar tarifa kWh e persistir
  const updateTarifaKwh = (newTarifa) => {
    const numericTarifa = Number(newTarifa);
    if (isNaN(numericTarifa)) return; // validação básica
    setTarifaKwh(numericTarifa);
    localStorage.setItem('user_tarifa_kwh', numericTarifa);
  };

  // Função para atualizar moeda e persistir
  const updateMoeda = (newMoeda) => {
    setMoeda(newMoeda);
    localStorage.setItem('user_moeda', newMoeda);
  };
  
  // Objeto de valor do contexto
  const value = {
    isSettingsOpen,
    setIsSettingsOpen,
    voltage,
    updateVoltage,
    tarifaKwh,
    updateTarifaKwh,
    moeda,
    updateMoeda,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook personalizado para consumir o contexto
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
