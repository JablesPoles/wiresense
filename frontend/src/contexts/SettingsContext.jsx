import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();
// trigger
export const SettingsProvider = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voltage, setVoltage] = useState(() => {
    const savedVoltage = localStorage.getItem('user_voltage');
    return savedVoltage ? Number(savedVoltage) : 127;
  });

  const [tarifaKwh, setTarifaKwh] = useState(() => {
    const savedTarifa = localStorage.getItem('user_tarifa_kwh');
    return savedTarifa ? Number(savedTarifa) : 0.92; 
  });

  const [moeda, setMoeda] = useState(() => {
    return localStorage.getItem('user_moeda') || 'BRL'; 
  });

  const updateVoltage = (newVoltage) => {
    const numericVoltage = Number(newVoltage);
    if (isNaN(numericVoltage)) return;
    setVoltage(numericVoltage);
    localStorage.setItem('user_voltage', numericVoltage);
  };
  
  const updateTarifaKwh = (newTarifa) => {
    const numericTarifa = Number(newTarifa);
    if (isNaN(numericTarifa)) return;
    setTarifaKwh(numericTarifa);
    localStorage.setItem('user_tarifa_kwh', numericTarifa);
  };

  const updateMoeda = (newMoeda) => {
    setMoeda(newMoeda);
    localStorage.setItem('user_moeda', newMoeda);
  };
  
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

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};