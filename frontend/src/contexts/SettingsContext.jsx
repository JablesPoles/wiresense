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

  // Estado do orçamento mensal, inicializando do localStorage
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const saved = localStorage.getItem('user_budget_limit');
    return saved ? Number(saved) : 0; // 0 = sem limite
  });

  const updateBudgetLimit = (newLimit) => {
    const val = Number(newLimit);
    if (!isNaN(val)) {
      setBudgetLimit(val);
      localStorage.setItem('user_budget_limit', val);
    }
  };

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(true);

  // Initial load effect
  React.useEffect(() => {
    // Simula uma pequena verificação de sistema para garantir que tudo está ok
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms loading sequence

    return () => clearTimeout(timer);
  }, []);

  // Objeto de valor do contexto
  const value = {
    isLoading, // Expose loading state
    isSettingsOpen,
    setIsSettingsOpen,
    voltage,
    updateVoltage,
    tarifaKwh,
    updateTarifaKwh,
    moeda,
    updateMoeda,
    budgetLimit,
    updateBudgetLimit,
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
