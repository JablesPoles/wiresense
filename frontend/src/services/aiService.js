
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini only if key exists
let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * Generates a quick energy insight based on current device metrics.
 * @param {Object} data - The energy context.
 * @param {boolean} data.isSolar - Whether it's a generator or consumer.
 * @param {number} data.currentPower - Current power in Watts.
 * @param {number} data.todayEnergy - Energy today in kWh.
 * @param {number} data.monthlyCost - Current month cost/savings.
 * @param {number} data.budgetLimit - Budget target (if any).
 * @returns {Promise<string>} - A concise insight.
 */
export const generateEnergyInsight = async (data) => {
    if (!genAI) {
        console.warn("Gemini API Key missing.");
        return null;
    }

    try {
        // Using specific version 'gemini-2.5-flash-lite' as verified by probe script.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const type = data.isSolar ? "Painel Solar (Gerador)" : "Dispositivo Residencial (Consumidor)";
        const metrics = `
            Tipo: ${type}
            Potência Atual: ${data.currentPower.toFixed(0)} W
            Energia Hoje: ${data.todayEnergy.toFixed(2)} kWh
            Custo/Economia Mês: ${data.monthlyCost}
            Meta/Orçamento: ${data.budgetLimit > 0 ? data.budgetLimit : 'N/A'}
        `;

        const prompt = `
            Você é um assistente de energia inteligente do app WireSense.
            Analise os dados abaixo e forneça UM insight curto (máx 2 frases) e útil para o usuário.
            Seja direto, amigável e use emojis.
            
            Dados:
            ${metrics}

            Exemplos de resposta desejada:
            "Sua geração está ótima hoje! Aproveite para ligar equipamentos pesados agora."
            "Atenção: seu consumo está alto para este horário. Verifique se há luzes acesas desnecessariamente."
            "Você está dentro da meta de orçamento. Continue assim!"
            
            Responda em Português do Brasil.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error; // Re-throw to let component handle the UI feedback
    }
};
