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

// Helper to clean append params
const appendDevice = (url, deviceId) => {
  if (!deviceId) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}device_id=${encodeURIComponent(deviceId)}`;
};

export const getDevices = async () => {
  return await fetchWithFallback('data?type=devices', {}, () => mockApiService.getDevices());
};

export const getLatestDataPoint = async (deviceId) => {
  return await fetchWithFallback(appendDevice('latest', deviceId), {}, () => mockApiService.getLatestDataPoint(deviceId));
};

export const getRealtimeData = async (windowSize = '5m', deviceId) => {
  return await fetchWithFallback(appendDevice(`data?window=${windowSize}`, deviceId), {}, () => mockApiService.getRealtimeData(windowSize, deviceId));
};

export const getEnergySummary = async (deviceId) => {
  return await fetchWithFallback(appendDevice('summary', deviceId), {}, () => mockApiService.getEnergySummary(deviceId));
};

export const getDailyEnergyHistory = async (limit = 30, deviceId) => {
  return await fetchWithFallback(appendDevice(`history/daily?limit=${limit}`, deviceId), {}, () => mockApiService.getDailyEnergyHistory(limit, deviceId));
};

export const getMonthlyEnergyHistory = async (limit = 12, deviceId) => {
  return await fetchWithFallback(appendDevice(`history/monthly?limit=${limit}`, deviceId), {}, () => mockApiService.getMonthlyEnergyHistory(limit, deviceId));
};

export const getPeakLoadHistory = async (limit = 7, deviceId) => {
  return await fetchWithFallback(appendDevice(`history/peak?limit=${limit}`, deviceId), {}, () => mockApiService.getPeakLoadHistory(limit, deviceId));
};
