import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const SIMULATION_EVENTS = [
    { titleKey: "notif_peak_load", messageKey: "notif_peak_load_desc", type: "alert", actionLink: "/history" },
    { titleKey: "notif_tariff_update", messageKey: "notif_tariff_update_desc", type: "info", actionLink: "/settings" },
    { titleKey: "notif_device_connected", messageKey: "notif_device_connected_desc", type: "success", actionLink: "/devices" },
    { titleKey: "notif_goal_reached", messageKey: "notif_goal_reached_desc", type: "alert", actionLink: "/reports" },
    { titleKey: "notif_savings_generated", messageKey: "notif_savings_generated_desc", type: "energy", actionLink: "/history" },
    { titleKey: "notif_voltage_unstable", messageKey: "notif_voltage_unstable_desc", type: "alert", actionLink: "/settings" },
    { titleKey: "notif_report_ready", messageKey: "notif_report_ready_desc", type: "info", actionLink: "/reports" }
];

export const useNotificationSimulator = () => {
    const { addNotification, notifications, isLoaded } = useNotifications();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Wait for context to load data from storage
        if (!isLoaded) return;

        // Prevent double init in strict mode or excessive notifications
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // If empty, add a welcome notification immediately
        if (notifications.length === 0) {
            addNotification({
                titleKey: "notif_system_started",
                messageKey: "notif_system_started_desc",
                type: "success"
            });
        }

        // Randomly add a notification every 30-90 seconds
        const interval = setInterval(() => {
            const shouldTrigger = Math.random() > 0.6; // 40% chance
            if (shouldTrigger) {
                const event = SIMULATION_EVENTS[Math.floor(Math.random() * SIMULATION_EVENTS.length)];
                addNotification(event);
            }
        }, 45000);

        return () => clearInterval(interval);
    }, [isLoaded]); // Dependencies: run when loaded status changes
};
