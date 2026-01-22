import { mockApiService } from './mockApiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Default to relative path for proxy/k8s

// --- Real API Implementation ---
const realApiService = {
  async getDevices() {
    // Current backend doesn't have a devices endpoint, returning defaults or empty
    // TODO: Add /api/devices to Python backend. For now, we return a static list or empty
    return ['main-breaker', 'solar-inverter', 'ac-unit-1'];
  },

  async getLatestDataPoint(deviceId) {
    const params = new URLSearchParams();
    if (deviceId) params.append('device_id', deviceId);

    const response = await fetch(`${API_BASE_URL}/latest?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');

    // Backend returns array thanks to previous fix, but for "latest" logical concept we may want the last one
    // However, the backend "get_latest" without window returns a single point in a list
    const data = await response.json();
    if (data && data.length > 0) {
      const point = data[0];
      // Map influx format to frontend format
      return {
        current: point.value,
        voltage: 127, // Hardcoded for now as backend only has current
        power: point.value * 127,
        time: point.time
      };
    }
    return null;
  },

  async getRealtimeData(windowSize = '5m', deviceId) {
    const params = new URLSearchParams();
    if (deviceId) params.append('device_id', deviceId);
    params.append('window', windowSize); // The modification we made to backend

    const response = await fetch(`${API_BASE_URL}/latest?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return data.map(point => ({
      time: point.time,
      current: point.value,
      // voltage/power missing in backend for now
    }));
  },

  async getEnergySummary(deviceId) {
    // Backend doesn't have summary endpoint yet.
    // We can fallback to mock or return zeros
    console.warn('getEnergySummary not implemented in Real API yet. Using Mock.');
    return mockApiService.getEnergySummary(deviceId);
  },

  async getDailyEnergyHistory(limit = 30, deviceId) {
    const params = new URLSearchParams();
    if (deviceId) params.append('device_id', deviceId);
    params.append('limit', limit);
    params.append('period', 'daily');

    const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    // Map: backend returns {time, value} -> frontend expects {x (YYYY-MM-DD), y}
    return data.map(d => ({
      x: d.time.split('T')[0],
      y: d.value
    }));
  },

  async getMonthlyEnergyHistory(limit = 12, deviceId) {
    const params = new URLSearchParams();
    if (deviceId) params.append('device_id', deviceId);
    params.append('limit', limit);
    params.append('period', 'monthly');

    const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return data.map(d => ({
      x: d.time.split('T')[0], // Approximation
      y: d.value
    }));
  },

  async getPeakLoadHistory(limit = 7, deviceId) {
    // Not implemented in backend yet
    console.warn('getPeakLoadHistory not implemented in Real API yet. Using Mock.');
    return mockApiService.getPeakLoadHistory(limit, deviceId);
  }
};

// --- Strategy Switching Logic ---

// Default to saved preference or 'mock'
let currentMode = localStorage.getItem('appMode') || 'mock';

export const setApiMode = (mode) => {
  if (mode === 'real' || mode === 'mock') {
    currentMode = mode;
    localStorage.setItem('appMode', mode);
    // Reload page to apply changes cleanly (simplest approach for now)
    window.location.reload();
  }
};

export const getApiMode = () => currentMode;

// Proxy that delegates to the selected implementation
const getActiveService = () => (currentMode === 'real' ? realApiService : mockApiService);

export const getDevices = (...args) => getActiveService().getDevices(...args);
export const getLatestDataPoint = (...args) => getActiveService().getLatestDataPoint(...args);
export const getRealtimeData = (...args) => getActiveService().getRealtimeData(...args);
export const getEnergySummary = (...args) => getActiveService().getEnergySummary(...args);
export const getDailyEnergyHistory = (...args) => getActiveService().getDailyEnergyHistory(...args);
export const getMonthlyEnergyHistory = (...args) => getActiveService().getMonthlyEnergyHistory(...args);
export const getPeakLoadHistory = (...args) => getActiveService().getPeakLoadHistory(...args);
