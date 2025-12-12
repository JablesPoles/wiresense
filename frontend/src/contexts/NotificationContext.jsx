import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load notifications from localStorage on mount or user change
    useEffect(() => {
        if (currentUser) {
            const stored = localStorage.getItem(`wiresense_notifications_${currentUser.uid}`);
            if (stored) {
                try {
                    setNotifications(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse notifications", e);
                }
            } else {
                setNotifications([]);
            }
        } else {
            setNotifications([]);
        }
        setIsLoaded(true);
    }, [currentUser]);

    // Save to localStorage whenever notifications change
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(`wiresense_notifications_${currentUser.uid}`, JSON.stringify(notifications));
        }
    }, [notifications, currentUser]);

    const addNotification = (notification) => {
        const newNotif = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep max 50
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        isLoaded
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
