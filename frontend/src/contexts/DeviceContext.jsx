import { createContext, useContext, useState, useEffect } from 'react';
import { getDevices } from '../services/apiService';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

const DeviceContext = createContext();

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [devices, setDevices] = useState([]);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [isGenerator, setIsGenerator] = useState(false);
    const [loading, setLoading] = useState(true);

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

                    // Logic: Cloud is the source of truth.
                    // If cloud has data, it overwrites local cache.
                    // If cloud is empty (new user), we might want to keep local if we just added it?
                    // But usually cloud should match.
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

            // Always fetch API defaults if list is empty? Or just for guests?
            // Original logic fetched API defaults. Let's keep it but careful not to duplicate.
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

            // Set current device logic
            if (allDevices.length > 0) {
                // Check if current device is in list, if not reset
                if (!currentDeviceId || !allDevices.find(d => d.id === currentDeviceId)) {
                    setCurrentDeviceId(allDevices[0].id);
                }
            } else {
                // No devices at all
                setCurrentDeviceId(null);
            }

            setLoading(false);
        };

        loadDevices();
    }, [currentUser]); // Reload when user logs in/out


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

    // Update derived state when current device changes
    useEffect(() => {
        if (!currentDeviceId) return;
        const isGen = /solar|pv|gerador|generator|inverter/i.test(currentDeviceId);
        setIsGenerator(isGen);
    }, [currentDeviceId]);

    const value = {
        devices,
        currentDeviceId,
        setCurrentDeviceId,
        isGenerator,
        loading,
        addDevice
    };

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
};
