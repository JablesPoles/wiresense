import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const SIMULATION_EVENTS = [
    { title: "Pico de Consumo", message: "Detectado pico de 4.2kW no Ar Condicionado.", type: "alert", actionLink: "/history" },
    { title: "Tarifa Atualizada", message: "A tarifa mudou para Intermediária (R$ 0,89/kWh).", type: "info", actionLink: "/settings" },
    { title: "Dispositivo Conectado", message: "Novo dispositivo 'Smart TV' detectado na rede.", type: "success", actionLink: "/devices" },
    { title: "Meta Atingida", message: "Você atingiu 80% do orçamento mensal estipulado.", type: "alert", actionLink: "/reports" },
    { title: "Economia Gerada", message: "Seus painéis economizaram R$ 12,50 hoje.", type: "energy", actionLink: "/history" },
    { title: "Tensão Instável", message: "Variação de tensão detectada (118V -> 109V).", type: "alert", actionLink: "/settings" },
    { title: "Relatório Disponível", message: "O relatório semanal de eficiência está pronto.", type: "info", actionLink: "/reports" }
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
                title: "Sistema Iniciado",
                message: "Monitoramento em tempo real ativo. Bem-vindo ao WireSense.",
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
