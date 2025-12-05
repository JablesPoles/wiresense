import { mockApiService } from './mockApiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper: Try real API, fallback to Mock
async function fetchWithFallback(endpoint, options = {}, mockMethod) {
  try {
    if (!API_BASE_URL) throw new Error("No API URL");

    // Simple check: if we are supposed to be offline/mock, fail fast
    // For now, we attempt fetch.
    // Race fetch with a timeout to prevent long hangs on bad connections
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));

    const response = await Promise.race([
      fetch(`${API_BASE_URL}/${endpoint}`, options),
      timeout
    ]);

    if (!response.ok) throw new Error("API Error");
    return await response.json();
  } catch (error) {
    console.warn(`API unavailable (${endpoint}) - ${error.message}. Switching to Mock Data.`);
    return await mockMethod();
  }
}

export const getLatestDataPoint = async () => {
  return await fetchWithFallback('latest', {}, () => mockApiService.getLatestDataPoint());
};

export const getRealtimeData = async (windowSize = '5m') => {
  return await fetchWithFallback(`data?window=${windowSize}`, {}, () => mockApiService.getRealtimeData(windowSize));
};

export const getEnergySummary = async () => {
  return await fetchWithFallback('summary', {}, () => mockApiService.getEnergySummary());
};

export const getDailyEnergyHistory = async (limit = 30) => {
  return await fetchWithFallback(`history/daily?limit=${limit}`, {}, () => mockApiService.getDailyEnergyHistory(limit));
};

export const getMonthlyEnergyHistory = async (limit = 12) => {
  return await fetchWithFallback(`history/monthly?limit=${limit}`, {}, () => mockApiService.getMonthlyEnergyHistory(limit));
};

export const getPeakLoadHistory = async (limit = 7) => {
  return await fetchWithFallback(`history/peak?limit=${limit}`, {}, () => mockApiService.getPeakLoadHistory(limit));
};
