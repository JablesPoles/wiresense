import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { getDevices } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useAchievements } from './AchievementsContext';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const DeviceContext = createContext();

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { updateStat, incrementStat } = useAchievements(); // Connected!
    const [devices, setDevices] = useState([]);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [isGenerator, setIsGenerator] = useState(false);
    const [loading, setLoading] = useState(true);

    // Simulation State - Persisted in Session Storage
    const [simulationMode, setSimulationMode] = useState(() => {
        return sessionStorage.getItem('sim_mode') === 'true';
    });

    // NEW: Array of active devices
    // [{ id, name, watts, variance, color, icon }]
    const [activeSimulations, setActiveSimulations] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('sim_active_devices')) || [];
        } catch { return []; }
    });

    // Virtual Metering (kWh accumulator)
    const [simulatedEnergy, setSimulatedEnergy] = useState(() => {
        return Number(sessionStorage.getItem('sim_energy') || 0);
    });

    // Computed total power (base)
    const totalSimulatedWatts = activeSimulations.reduce((acc, curr) => acc + (Number(curr.watts) || 0), 0);

    // Helper: Apply random fluctuation (noise) to look realistic
    const getSimulatedReading = () => {
        if (!simulationMode || activeSimulations.length === 0) return 0;

        let total = 0;
        activeSimulations.forEach(sim => {
            const power = Number(sim.watts) || 0;
            const variance = sim.variance || 0.02;
            const noise = (Math.random() - 0.5) * 2 * (power * variance);
            total += Math.max(0, power + noise);
        });
        return total;
    };

    // Helper: Apply random fluctuation (noise) for realism


    // Start infinite simulation
    // Update Max Simultaneous Stat
    useEffect(() => {
        if (activeSimulations.length >= 3) {
            updateStat('maxSimultaneous', activeSimulations.length);
        }
    }, [activeSimulations.length, updateStat]);

    // Start/Add Simulation
    const startSimulation = (watts, meta = {}) => {
        const newSim = {
            id: meta.id || Date.now().toString(),
            watts: Number(watts),
            name: meta.name || 'Unknown Device',
            iconName: meta.iconName, // Store string for JSON persistence
            color: meta.color,
            variance: meta.variance || 0.02
        };

        setActiveSimulations(prev => {
            const updated = [...prev, newSim];
            sessionStorage.setItem('sim_active_devices', JSON.stringify(updated));
            return updated;
        });

        // Increment total runs
        incrementStat('simulationsRun');

        setSimulationMode(true);
        sessionStorage.setItem('sim_mode', 'true');
    };

    const removeSimulation = (id) => {
        setActiveSimulations(prev => {
            const updated = prev.filter(s => s.id !== id);
            sessionStorage.setItem('sim_active_devices', JSON.stringify(updated));

            if (updated.length === 0) {
                setSimulationMode(false); // Auto-stop if empty
                sessionStorage.removeItem('sim_mode');
            }
            return updated;
        });
    };

    const stopSimulation = () => {
        // Stops ALL
        setSimulationMode(false);
        setActiveSimulations([]);
        setSimulatedEnergy(0);

        sessionStorage.removeItem('sim_mode');
        sessionStorage.removeItem('sim_active_devices');
        sessionStorage.removeItem('sim_energy');
    };

    // Virtual Metering Loop (Integrates Total Power)
    useEffect(() => {
        let interval;
        if (simulationMode && activeSimulations.length > 0) {
            interval = setInterval(() => {
                // Determine total base power for this second
                const currentTotalWatts = activeSimulations.reduce((acc, curr) => acc + (Number(curr.watts) || 0), 0);

                // Formula: Watts * (1s / 3600s) / 1000 = kWh per second
                const energyPerSecond = (currentTotalWatts / 1000) / 3600;

                setSimulatedEnergy(prev => {
                    const newValue = prev + energyPerSecond;
                    sessionStorage.setItem('sim_energy', newValue);
                    return newValue;
                });

                // Update Achievements Stat (Generation) - Throttled? 
                // For now, let's do it every tick but small amounts might be lost if logic floats?
                // incrementStat handles addition.
                incrementStat('totalGeneration', energyPerSecond);

                // Estimate Cost Savings (assuming free solar vs grid cost)
                // We need tariff for this.
                // For now just 1:1 ratio placeholder or fetch tariff
                incrementStat('totalSavings', energyPerSecond * 0.92); // Approx cost

            }, 1000);
        }
        return () => clearInterval(interval);
    }, [simulationMode, activeSimulations, incrementStat]);

    // Kept for compatibility if needed, but redirected to startSimulation
    const injectSimulationEvent = (watts, meta) => {
        startSimulation(watts, meta);
    };

    // Saved Virtual Devices (Registry) - Cloud Synced
    const [savedDevices, setSavedDevices] = useState([]);

    // Load/Sync Saved Devices (Firestore or Local)
    useEffect(() => {
        let unsubscribe = () => { };

        if (currentUser) {
            // Cloud Mode: Real-time Listener
            const colRef = collection(db, 'users', currentUser.uid, 'virtual_devices');
            unsubscribe = onSnapshot(colRef, (snapshot) => {
                const devs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSavedDevices(devs);
                // Optional: Backup to local for offline start
                localStorage.setItem('saved_virtual_devices_cache', JSON.stringify(devs));
            }, (error) => {
                console.error("Error syncing virtual devices:", error);
            });
        } else {
            // Guest Mode: Local Storage
            const local = localStorage.getItem('saved_virtual_devices');
            if (local) {
                try { setSavedDevices(JSON.parse(local)); } catch (e) { }
            }
        }

        return () => unsubscribe();
    }, [currentUser]);

    const addSavedDevice = async (device) => {
        if (currentUser) {
            // Cloud
            try {
                await addDoc(collection(db, 'users', currentUser.uid, 'virtual_devices'), device);
            } catch (e) {
                console.error("Error saving virtual device to cloud:", e);
                alert(`Cloud Save Failed: ${e.message}. Saving locally instead.`);

                // Fallback: Save Locally so user can continue
                const newDevice = { ...device, id: Date.now().toString() };
                const updated = [...savedDevices, newDevice];
                setSavedDevices(updated);
                localStorage.setItem('saved_virtual_devices', JSON.stringify(updated));
            }
        } else {
            // Local
            const newDevice = { ...device, id: Date.now().toString() };
            const updated = [...savedDevices, newDevice];
            setSavedDevices(updated);
            localStorage.setItem('saved_virtual_devices', JSON.stringify(updated));
        }
    };

    const removeSavedDevice = async (id) => {
        if (currentUser) {
            // Cloud
            try {
                await deleteDoc(doc(db, 'users', currentUser.uid, 'virtual_devices', id));
            } catch (e) {
                console.error("Error deleting virtual device from cloud:", e);
            }
        } else {
            // Local
            const updated = savedDevices.filter(d => d.id !== id);
            setSavedDevices(updated);
            localStorage.setItem('saved_virtual_devices', JSON.stringify(updated));
        }
    };

    // Load Devices (Local or Cloud)
    useEffect(() => {
        const loadDevices = async () => {
            setLoading(true);

            // If just logged out, clear devices first or load guest default
            // If logged in, prioritize fetching cloud or Namespaced Local

            let allDevices = [];

            const savedDevicesName = currentUser ? `devices_${currentUser.uid}` : 'local_devices';

            if (currentUser) {
                // 1. Try Local Namespaced Cache first (Instant load)
                const savedUserDevices = localStorage.getItem(savedDevicesName);
                if (savedUserDevices) {
                    try { allDevices = JSON.parse(savedUserDevices); } catch (e) { }
                }

                // 2. Fetch Cloud to sync additions/removals
                try {
                    const querySnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'devices'));
                    const cloudDevices = [];
                    querySnapshot.forEach((doc) => {
                        cloudDevices.push({ id: doc.id, ...doc.data() });
                    });

                    if (cloudDevices.length > 0) {
                        allDevices = cloudDevices;
                        // Update cache
                        localStorage.setItem(savedDevicesName, JSON.stringify(allDevices));
                    }
                } catch (error) {
                    console.error("Error fetching devices from cloud:", error);
                }

            } else {
                // Guest / Unauthed
                const savedLocal = localStorage.getItem('local_devices');
                if (savedLocal) {
                    try { allDevices = JSON.parse(savedLocal); } catch (e) { }
                }
            }

            if (allDevices.length === 0) {
                try {
                    const list = await getDevices();
                    const converted = list.map(d => {
                        const id = typeof d === 'string' ? d : d.id;
                        const name = typeof d === 'object' && d.name ? d.name : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
                        return { id, name };
                    });
                    // Only add defaults if we really have 0 devices
                    if (allDevices.length === 0) allDevices = converted;
                } catch (e) { }
            }


            setDevices(allDevices);
            if (allDevices.length > 0) {
                if (!currentDeviceId || !allDevices.find(d => d.id === currentDeviceId)) {
                    setCurrentDeviceId(allDevices[0].id);
                }
            } else {
                setCurrentDeviceId(null);
            }

            setLoading(false);
        };

        loadDevices();
    }, [currentUser]);


    const addDevice = async (name, type) => {
        // Generate ID
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const id = `${sanitized}-${Date.now().toString().slice(-4)}`;
        let finalId = id;
        if (type === 'generator' && !/solar|gerador/i.test(finalId)) {
            finalId = `solar-${finalId}`;
        }

        const newDevice = { id: finalId, name, type }; // Store type too

        // 1. Update State
        const updatedDevices = [...devices, newDevice];
        setDevices(updatedDevices);
        setCurrentDeviceId(finalId);

        // 2. Persistence
        if (currentUser) {
            // Cloud
            try {
                await setDoc(doc(db, 'users', currentUser.uid, 'devices', finalId), newDevice);
            } catch (e) {
                console.error("Error saving device to cloud:", e);
            }
            // Local Cache (Optional but good for offline) - Namespace by UID
            localStorage.setItem(`devices_${currentUser.uid}`, JSON.stringify(updatedDevices));
        } else {
            // Unauthed Local Storage
            localStorage.setItem('local_devices', JSON.stringify(updatedDevices));
        }

        return finalId;
    };

    const removeDevice = async (id) => {
        // 1. Update State
        const updatedDevices = devices.filter(d => d.id !== id);
        setDevices(updatedDevices);

        // Reset current if deleted
        if (currentDeviceId === id) {
            setCurrentDeviceId(updatedDevices.length > 0 ? updatedDevices[0].id : null);
        }

        // 2. Persistence
        if (currentUser) {
            // Cloud
            try {
                await deleteDoc(doc(db, 'users', currentUser.uid, 'devices', id));
            } catch (e) {
                console.error("Error deleting device from cloud:", e);
            }
            // Local Cache
            localStorage.setItem(`devices_${currentUser.uid}`, JSON.stringify(updatedDevices));
        } else {
            // Unauthed Local Storage
            localStorage.setItem('local_devices', JSON.stringify(updatedDevices));
        }
    };

    useEffect(() => {
        if (!currentDeviceId) return;
        const isGen = /solar|pv|gerador|generator|inverter/i.test(currentDeviceId);
        setIsGenerator(isGen);
    }, [currentDeviceId]);

    const value = React.useMemo(() => ({
        devices,
        currentDeviceId,
        setCurrentDeviceId,
        isGenerator,
        startSimulation,
        stopSimulation,
        injectSimulationEvent,
        simulationMode,
        activeSimulations,
        totalSimulatedWatts,
        getSimulatedReading,
        loading,
        addDevice,
        removeDevice,
        savedDevices,
        addSavedDevice,
        removeSavedDevice,
        simulatedEnergy,
        removeSimulation
    }), [
        devices,
        currentDeviceId,
        isGenerator,
        simulationMode,
        activeSimulations,
        totalSimulatedWatts,
        loading,
        savedDevices,
        simulatedEnergy
    ]);

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
};
