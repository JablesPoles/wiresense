import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Cria o contexto para configurações globais
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Estado para controle da abertura do modal de configurações
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // States
  const [voltage, setVoltage] = useState(127);
  const [tarifaKwh, setTarifaKwh] = useState(0.92);
  const [moeda, setMoeda] = useState('BRL');
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Settings (Local or Cloud)
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);

      // 1. Load from LocalStorage (Fallback / Default)
      // We always load local first to have immediate data
      const localVoltage = Number(localStorage.getItem('user_voltage')) || 127;
      const localTarifa = Number(localStorage.getItem('user_tarifa_kwh')) || 0.92;
      const localMoeda = localStorage.getItem('user_moeda') || 'BRL';
      const localBudget = Number(localStorage.getItem('user_budget_limit')) || 0;

      if (currentUser) {
        // 2. If User Logged In, Fetch from Firestore
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setVoltage(data.voltage || localVoltage);
            setTarifaKwh(data.tarifaKwh || localTarifa);
            setMoeda(data.moeda || localMoeda);
            setBudgetLimit(data.budgetLimit || localBudget);
          } else {
            // First time login? Sync local to cloud
            await setDoc(docRef, {
              voltage: localVoltage,
              tarifaKwh: localTarifa,
              moeda: localMoeda,
              budgetLimit: localBudget
            });
            setVoltage(localVoltage);
            setTarifaKwh(localTarifa);
            setMoeda(localMoeda);
            setBudgetLimit(localBudget);
          }
        } catch (error) {
          console.error("Error loading settings from cloud:", error);
          // Fallback to local
          setVoltage(localVoltage);
          setTarifaKwh(localTarifa);
          setMoeda(localMoeda);
          setBudgetLimit(localBudget);
        }
      } else {
        // Not logged in -> Use Local
        setVoltage(localVoltage);
        setTarifaKwh(localTarifa);
        setMoeda(localMoeda);
        setBudgetLimit(localBudget);
      }
      setIsLoading(false);
    };

    loadSettings();
  }, [currentUser]);


  // Helper to save setting
  const saveSetting = async (key, value) => {
    // 1. Local Persistence (Always keep local in sync for offline/optimistic)
    localStorage.setItem(`user_${key}`, value);

    // 2. Cloud Persistence
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
        // Use setDoc with merge to ensure document creation
        await setDoc(docRef, { [key === 'budget_limit' ? 'budgetLimit' : (key === 'tarifa_kwh' ? 'tarifaKwh' : key)]: value }, { merge: true });
      } catch (e) {
        console.error("Error pushing setting to cloud:", e);
      }
    }
  };


  const updateVoltage = (newVoltage) => {
    const val = Number(newVoltage);
    if (isNaN(val)) return;
    setVoltage(val);
    saveSetting('voltage', val);
  };

  const updateTarifaKwh = (newTarifa) => {
    const val = Number(newTarifa);
    if (isNaN(val)) return;
    setTarifaKwh(val);
    saveSetting('tarifa_kwh', val);
  };

  const updateMoeda = (newMoeda) => {
    setMoeda(newMoeda);
    saveSetting('moeda', newMoeda);
  };

  const updateBudgetLimit = (newLimit) => {
    const val = Number(newLimit);
    if (!isNaN(val)) {
      setBudgetLimit(val);
      saveSetting('budget_limit', val);
    }
  };


  // --- Device Specific Settings (Cloud + Local) ---

  const getDeviceKey = (deviceId, key) => `device_${deviceId}_${key}`;

  // Read: Logic is tricky with Cloud. We'll simplify:
  // For now, we still rely on localStorage for instant synchronous reads in UI (critical for perf)
  // But we should sync these to cloud too in the background or load them all at start.
  // To keep existing logic simple and robust: we continue to read from LocalStorage for immediate render.
  // Future: Refactor to load ALL device settings into a state object context on load.
  const getDeviceSetting = (deviceId, key, globalValue) => {
    if (!deviceId) return globalValue;
    const saved = localStorage.getItem(getDeviceKey(deviceId, key));
    if (saved === null) return globalValue;
    return isNaN(Number(saved)) ? saved : Number(saved);
  };

  const updateDeviceSetting = async (deviceId, key, value) => {
    if (!deviceId) return;

    // 1. Local
    localStorage.setItem(getDeviceKey(deviceId, key), value);
    setSettingsVersion(v => v + 1);

    // 2. Cloud
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'devices', deviceId);
        await setDoc(docRef, { settings: { [key]: value } }, { merge: true });
      } catch (e) {
        console.error("Error saving device setting to cloud:", e);
      }
    }
  };


  const value = {
    isLoading,
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
    getDeviceSetting,
    updateDeviceSetting,
    settingsVersion
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

export const useDeviceSettings = (deviceId) => {
  const { getDeviceSetting, updateDeviceSetting, voltage, tarifaKwh, budgetLimit, moeda, settingsVersion } = useSettings();

  const deviceVoltage = React.useMemo(() => getDeviceSetting(deviceId, 'voltage', voltage), [deviceId, settingsVersion, voltage]);
  const deviceTariff = React.useMemo(() => getDeviceSetting(deviceId, 'tarifa', tarifaKwh), [deviceId, settingsVersion, tarifaKwh]);
  const deviceBudget = React.useMemo(() => getDeviceSetting(deviceId, 'budget', budgetLimit), [deviceId, settingsVersion, budgetLimit]);
  const deviceMoeda = React.useMemo(() => getDeviceSetting(deviceId, 'moeda', moeda), [deviceId, settingsVersion, moeda]);

  return {
    voltage: deviceVoltage,
    tarifaKwh: deviceTariff,
    budgetLimit: deviceBudget,
    moeda: deviceMoeda,
    setVoltage: (v) => updateDeviceSetting(deviceId, 'voltage', v),
    setTariff: (v) => updateDeviceSetting(deviceId, 'tarifa', v),
    setBudget: (v) => updateDeviceSetting(deviceId, 'budget', v),
    setMoeda: (v) => updateDeviceSetting(deviceId, 'moeda', v)
  };
};
