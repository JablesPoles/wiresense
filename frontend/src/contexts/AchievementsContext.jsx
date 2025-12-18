import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    Zap, Sun, Award, Star, Activity, Battery,
    Settings, Layout, MousePointer, Shield,
    Flame, TrendingUp, DollarSign, Download, Moon,
    Crown, Leaf, Wind, Palette, Sliders, FileText,
    Share2, Gauge, ZapOff, PlayCircle, Lock, Trophy
} from 'lucide-react';
import { useNotifications } from './NotificationContext';
import { useLanguage } from './LanguageContext';

import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const AchievementsContext = createContext();

// --- Badge Registry ---
export const BADGES = [
    // 🌱 Tier 1: Onboarding (Bronze)
    {
        id: 'hello_world',
        nameKey: 'ach_hello_world_name',
        descKey: 'ach_hello_world_desc',
        icon: Layout,
        tier: 'bronze',
        condition: (stats) => stats.visitedDashboard,
        progress: (stats) => ({ current: stats.visitedDashboard ? 1 : 0, max: 1 })
    },
    {
        id: 'first_spark',
        nameKey: 'ach_first_spark_name',
        descKey: 'ach_first_spark_desc',
        icon: Zap,
        tier: 'bronze',
        condition: (stats) => stats.devicesCreated >= 1,
        progress: (stats) => ({ current: stats.devicesCreated, max: 1 })
    },
    {
        id: 'observer',
        nameKey: 'ach_observer_name',
        descKey: 'ach_observer_desc',
        icon: Activity,
        tier: 'bronze',
        condition: (stats) => stats.visitedSimulator,
        progress: (stats) => ({ current: stats.visitedSimulator ? 1 : 0, max: 1 })
    },
    {
        id: 'theme_park',
        nameKey: 'ach_theme_park_name',
        descKey: 'ach_theme_park_desc',
        icon: Palette,
        tier: 'bronze',
        condition: (stats) => stats.themesChanged >= 3,
        progress: (stats) => ({ current: stats.themesChanged, max: 3 })
    },
    {
        id: 'configurator',
        nameKey: 'ach_configurator_name',
        descKey: 'ach_configurator_desc',
        icon: Sliders,
        tier: 'bronze',
        condition: (stats) => stats.settingsChanged >= 1,
        progress: (stats) => ({ current: stats.settingsChanged, max: 1 })
    },

    // ⚡ Tier 2: Usage (Silver)
    {
        id: 'simulation_fan',
        nameKey: 'ach_simulation_fan_name',
        descKey: 'ach_simulation_fan_desc',
        icon: PlayCircle,
        tier: 'silver',
        condition: (stats) => stats.simulationsRun >= 10,
        progress: (stats) => ({ current: stats.simulationsRun, max: 10 })
    },
    {
        id: 'fully_loaded',
        nameKey: 'ach_fully_loaded_name',
        descKey: 'ach_fully_loaded_desc',
        icon: Battery, // Or generic device icon
        tier: 'silver',
        condition: (stats) => stats.devicesCreated >= 5,
        progress: (stats) => ({ current: stats.devicesCreated, max: 5 })
    },
    {
        id: 'night_owl',
        nameKey: 'ach_night_owl_name',
        descKey: 'ach_night_owl_desc',
        icon: Moon,
        tier: 'silver',
        condition: (stats) => stats.nightOwlActivity,
        progress: (stats) => ({ current: stats.nightOwlActivity ? 1 : 0, max: 1 })
    },
    {
        id: 'multipower',
        nameKey: 'ach_multipower_name',
        descKey: 'ach_multipower_desc',
        icon: Activity,
        tier: 'silver',
        condition: (stats) => stats.maxSimultaneous >= 3,
        progress: (stats) => ({ current: stats.maxSimultaneous || 0, max: 3 })
    },
    {
        id: 'efficiency_expert',
        nameKey: 'ach_efficiency_expert_name',
        descKey: 'ach_efficiency_expert_desc',
        icon: Leaf,
        tier: 'silver',
        condition: (stats) => stats.hasSolarDevice,
        progress: (stats) => ({ current: stats.hasSolarDevice ? 1 : 0, max: 1 })
    },

    // ☀️ Tier 3: Mastery (Gold)
    {
        id: 'solar_titan',
        nameKey: 'ach_solar_titan_name',
        descKey: 'ach_solar_titan_desc',
        icon: Sun,
        tier: 'gold',
        condition: (stats) => stats.totalGeneration >= 500,
        progress: (stats) => ({ current: Math.floor(stats.totalGeneration), max: 500 })
    },
    {
        id: 'grid_guardian',
        nameKey: 'ach_grid_guardian_name',
        descKey: 'ach_grid_guardian_desc',
        icon: Shield,
        tier: 'gold',
        condition: (stats) => stats.simulationsRun >= 50,
        progress: (stats) => ({ current: stats.simulationsRun, max: 50 })
    },
    {
        id: 'energy_tycoon',
        nameKey: 'ach_energy_tycoon_name',
        descKey: 'ach_energy_tycoon_desc',
        icon: DollarSign,
        tier: 'gold',
        condition: (stats) => stats.totalSavings >= 1000,
        progress: (stats) => ({ current: Math.floor(stats.totalSavings), max: 1000 })
    },
    {
        id: 'overload',
        nameKey: 'ach_overload_name',
        descKey: 'ach_overload_desc',
        icon: Flame,
        tier: 'gold',
        condition: (stats) => stats.maxCurrentHit >= 50,
        progress: (stats) => ({ current: Math.floor(stats.maxCurrentHit), max: 50 })
    },

    // 💎 Tier 4: Legendary (Diamond)
    {
        id: 'collector',
        nameKey: 'ach_collector_name',
        descKey: 'ach_collector_desc',
        icon: Trophy,
        tier: 'legendary',
        condition: (stats, unlockedCount) => unlockedCount >= 10,
        progress: (stats, unlockedCount) => ({ current: unlockedCount, max: 10 })
    },
    {
        id: 'energy_god',
        nameKey: 'ach_energy_god_name',
        descKey: 'ach_energy_god_desc',
        icon: Crown,
        tier: 'legendary',
        condition: (stats) => stats.totalGeneration >= 1000,
        progress: (stats) => ({ current: Math.floor(stats.totalGeneration), max: 1000 })
    },
    {
        id: 'timeless',
        nameKey: 'ach_timeless_name',
        descKey: 'ach_timeless_desc',
        icon: Share2, // Placeholder for "Time"/"Infinity"
        tier: 'legendary',
        condition: (stats) => stats.daysActive >= 7,
        progress: (stats) => ({ current: stats.daysActive, max: 7 })
    }
];

import { useAuth } from './AuthContext';

// ... (imports remain)

export const AchievementsProvider = ({ children }) => {
    const { addNotification } = useNotifications();
    const { currentUser } = useAuth();
    const { t } = useLanguage();

    // Helper to get storage key based on user
    const getStorageKey = useCallback((suffix) => {
        if (currentUser && currentUser.uid) {
            return `wiresense_${suffix}_${currentUser.uid}`;
        }
        return `wiresense_${suffix}_guest`;
    }, [currentUser]);

    // Default stats constant
    const DEFAULT_STATS = {
        devicesCreated: 0,
        visitedDashboard: false,
        visitedSimulator: false,
        simulationsRun: 0,
        themesChanged: 0,
        settingsChanged: 0,
        nightOwlActivity: false,
        exportsCount: 0,
        totalGeneration: 0,
        totalConsumption: 0,
        totalSavings: 0,
        maxCurrentHit: 0,
        lowConsumptionDays: 0,
        hasSolarDevice: false,
        daysActive: 1,
        lastLoginDate: new Date().toDateString()
    };

    // --- State: Stats ---
    const [stats, setStats] = useState(DEFAULT_STATS);

    // --- State: Unlocked Badges ---
    const [unlockedBadges, setUnlockedBadges] = useState([]);

    // --- State: Equipped Badge ---
    const [equippedBadgeId, setEquippedBadgeId] = useState(null);

    // --- Refs ---
    const isLocalStatUpdate = React.useRef(false);

    // --- Persistence & Sync Logic ---

    // 1. Load Data (Cloud Priority -> Local Fallback)
    useEffect(() => {
        let unsubscribe = () => { };

        const initData = async () => {
            // A. Load Local Data first (Instant render)
            const statsKey = getStorageKey('stats');
            const badgesKey = getStorageKey('achievements');
            const equippedKey = getStorageKey('equipped_badge');

            const savedStats = localStorage.getItem(statsKey);
            const savedBadges = localStorage.getItem(badgesKey);
            const savedEquipped = localStorage.getItem(equippedKey);

            const localStats = savedStats ? { ...DEFAULT_STATS, ...JSON.parse(savedStats) } : DEFAULT_STATS;
            const localBadges = savedBadges ? JSON.parse(savedBadges) : [];
            const localEquipped = savedEquipped || null;

            // Set initially to local (avoids flickering if offline)
            setStats(localStats);
            setUnlockedBadges(localBadges);
            setEquippedBadgeId(localEquipped);

            // B. If User Logged In, Sync with Cloud
            if (currentUser && currentUser.uid) {
                const userDocRef = doc(db, 'users', currentUser.uid, 'gamification', 'data');

                try {
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        // Cloud data exists -> Use it (Primary Source of Truth)
                        const cloudData = docSnap.data();
                        setStats(cloudData.stats || localStats);
                        setUnlockedBadges(cloudData.badges || localBadges);
                        setEquippedBadgeId(cloudData.equipped || localEquipped);
                    } else {
                        // Cloud is empty -> Migrate Local to Cloud (First time sync)
                        await setDoc(userDocRef, {
                            stats: localStats,
                            badges: localBadges,
                            equipped: localEquipped
                        }, { merge: true });
                    }

                    // C. Real-time Subscription (Multi-device sync)
                    unsubscribe = onSnapshot(userDocRef, (doc) => {
                        if (doc.exists()) {
                            const data = doc.data();
                            // Only update if different to avoid loops (though React state handles strict equality)
                            // We use functional updates or careful checks if needed, but here simple set is okay
                            // as we want cloud to drive UI.
                            if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
                            if (data.badges) setUnlockedBadges(data.badges);
                            if (data.equipped !== undefined) setEquippedBadgeId(data.equipped);
                        }
                    });

                } catch (error) {
                    console.error("Error syncing achievements:", error);
                }
            }
        };

        initData();

        return () => unsubscribe();
    }, [currentUser, getStorageKey]); // Depend on user


    // 2. Persist Changes (Cloud + Local)
    // Cloud Sync is handled by a side-effect to ensure purity and avoid Strict Mode double-writes.


    // --- Local Persistence (Keep as backup) ---
    useEffect(() => {
        const key = getStorageKey('stats');
        localStorage.setItem(key, JSON.stringify(stats));
    }, [stats, getStorageKey]);

    useEffect(() => {
        const key = getStorageKey('achievements');
        localStorage.setItem(key, JSON.stringify(unlockedBadges));
    }, [unlockedBadges, getStorageKey]);

    useEffect(() => {
        const key = getStorageKey('equipped_badge');
        if (equippedBadgeId) localStorage.setItem(key, equippedBadgeId);
        else localStorage.removeItem(key);
    }, [equippedBadgeId, getStorageKey]);


    // --- Cloud Helper ---
    const saveToCloud = useCallback(async (dataToUpdate) => {
        if (!currentUser?.uid) return;
        const userDocRef = doc(db, 'users', currentUser.uid, 'gamification', 'data');
        try {
            await setDoc(userDocRef, dataToUpdate, { merge: true });
        } catch (e) {
            console.error("Cloud save failed", e);
        }
    }, [currentUser]);

    // --- Sync Stats to Cloud (Gated by Local Action) ---
    useEffect(() => {
        if (isLocalStatUpdate.current) {
            saveToCloud({ stats });
            isLocalStatUpdate.current = false;
        }
    }, [stats, saveToCloud]);

    // --- Login Streaks / Days Active Check ---
    useEffect(() => {
        // Check Date Change (Login Streak)
        const today = new Date().toDateString();

        if (stats.lastLoginDate !== today) {
            // Avoid infinite loop: only update if different
            // We can't setStats inside a dependency of stats loosely.
            // We'll leave this for now or move to a specific "checkLogin" function called once per session.
            // For now, let's just update it if needed, relying on the date check.
            setStats(prev => {
                if (prev.lastLoginDate === today) return prev;
                return {
                    ...prev,
                    daysActive: (prev.daysActive || 0) + 1,
                    lastLoginDate: today
                };
            });
        }
    }, [stats.lastLoginDate]); // Only trigger if date differs (which it handles inside)

    // --- Check Logic ---
    useEffect(() => {
        let newUnlocks = [];

        BADGES.forEach(badge => {
            // Skip if already unlocked
            if (unlockedBadges.includes(badge.id)) return;

            // Check condition
            // Handle special case for 'collector' which needs unlock count
            const isCollector = badge.id === 'collector';

            const passed = isCollector
                ? badge.condition(stats, unlockedBadges.length)
                : badge.condition(stats);

            if (passed) {
                newUnlocks.push(badge);
            }
        });

        if (newUnlocks.length > 0) {
            const updatedList = [...unlockedBadges, ...newUnlocks.map(b => b.id)];
            // Update state
            setUnlockedBadges(updatedList);
            saveToCloud({ badges: updatedList });

            // Notify User
            newUnlocks.forEach(badge => {
                addNotification({
                    id: Date.now() + Math.random(),
                    titleKey: 'unlocked_title', // Dynamic Title
                    messageKey: 'unlocked_message', // Dynamic Message Template
                    messageData: { name: t(badge.nameKey) }, // Parameter
                    type: 'success',
                    timestamp: new Date().toISOString(),
                    read: false,
                    // Navigation Data
                    actionLink: '/achievements',
                    actionState: { highlightBadgeId: badge.id }
                });
            });
        }
    }, [stats, unlockedBadges, addNotification, t, saveToCloud]);

    // --- Actions ---
    const incrementStat = useCallback((key, value = 1) => {
        isLocalStatUpdate.current = true;
        setStats(prev => {
            const updates = { [key]: (prev[key] || 0) + value };

            // Checks
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 1 && hour <= 5 && !prev.nightOwlActivity) {
                updates.nightOwlActivity = true;
            }

            const newState = { ...prev, ...updates };
            return newState;
        });
    }, []);

    const updateStat = useCallback((key, value) => {
        isLocalStatUpdate.current = true;
        setStats(prev => {
            if (prev[key] === value) return prev;
            const newState = { ...prev, [key]: value };
            return newState;
        });
    }, []);

    const equipBadge = useCallback((id) => {
        if (unlockedBadges.includes(id)) {
            setEquippedBadgeId(id);
            saveToCloud({ equipped: id });
        }
    }, [unlockedBadges, saveToCloud]);

    const unequipBadge = useCallback(() => {
        setEquippedBadgeId(null);
        saveToCloud({ equipped: null });
    }, [saveToCloud]);

    const getBadgeProgress = useCallback((id) => {
        const badge = BADGES.find(b => b.id === id);
        if (!badge) return { current: 0, max: 1, percent: 0 };

        if (unlockedBadges.includes(id)) {
            // Force 100% visualization for unlocked
            const p = badge.progress(stats, unlockedBadges.length);
            return { current: p.max, max: p.max, percent: 100 };
        }

        const p = badge.progress(stats, unlockedBadges.length);
        const percent = Math.min(100, Math.max(0, (p.current / p.max) * 100));
        return { ...p, percent };
    }, [stats, unlockedBadges]);

    const value = React.useMemo(() => ({
        stats,
        unlockedBadges,
        equippedBadgeId,
        incrementStat,
        updateStat,
        equipBadge,
        unequipBadge,
        getBadgeProgress
    }), [
        stats,
        unlockedBadges,
        equippedBadgeId,
        incrementStat,
        updateStat,
        equipBadge,
        unequipBadge,
        getBadgeProgress
    ]);

    return (
        <AchievementsContext.Provider value={value}>
            {children}
        </AchievementsContext.Provider>
    );
};

export const useAchievements = () => {
    const context = useContext(AchievementsContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementsProvider');
    }
    return context;
};
