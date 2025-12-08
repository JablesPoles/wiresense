export const mockApiService = {
    // Config
    settings: {
        baseCurrent: 3.5,
        noise: 0.5,
        lastUpdate: Date.now(),
        currentValue: 3.5,
    },

    // Devices Config
    devices: [
        { id: "main-breaker", name: "Disjuntor Principal", type: "consumer" },
        { id: "solar-inverter", name: "Inversor Solar", type: "generator" },
        { id: "ac-unit-1", name: "Ar Condicionado Sala", type: "consumer" },
    ],

    // Generates simulated realtime values with random noise
    generateRealtimeValue(deviceId = 'main-breaker') {
        const now = Date.now();
        // Different base values per device
        let base = 3.5;
        let noise = 0.5;

        if (deviceId === 'solar-inverter') {
            base = 12.0; // High generation during "day"
            noise = 2.0;
        } else if (deviceId === 'ac-unit-1') {
            base = 8.5;
            noise = 0.2;
        }

        const change = (Math.random() - 0.5) * noise;
        let newValue = base + change;

        // Ensure non-negative values
        if (newValue < 0) newValue = 0;

        return newValue;
    },

    async getDevices() {
        await new Promise(r => setTimeout(r, 100));
        return this.devices.map(d => d.id);
    },

    async getLatestDataPoint(deviceId) {
        await new Promise(r => setTimeout(r, 100)); // Simulate latency
        const current = this.generateRealtimeValue(deviceId);
        return {
            current: current,
            voltage: 127, // Default assumption
            power: current * 127,
            time: new Date().toISOString()
        };
    },

    async getRealtimeData(windowStr = '5m', deviceId) {
        // Generate ~30 points for the chart
        const points = [];
        const now = Date.now();
        let val = this.generateRealtimeValue(deviceId);

        for (let i = 29; i >= 0; i--) {
            points.push({
                time: new Date(now - i * 5000).toISOString(),
                current: val,
            });
            // Backwards random walk
            val = val - (Math.random() - 0.5) * 0.5;
            if (val < 0) val = 0;
        }

        return points;
    },

    async getEnergySummary(deviceId) {
        // Adjust multipliers to simulate different device types
        let multiplier = 1;
        if (deviceId === 'solar-inverter') multiplier = 1.5;
        if (deviceId === 'ac-unit-1') multiplier = 0.4;

        return {
            today: (12.5 + Math.random()) * multiplier, // kWh
            month: (345.2 + Math.random() * 5) * multiplier, // kWh
            last_updated: new Date().toISOString()
        };
    },

    async getDailyEnergyHistory(limit = 7, deviceId) {
        const data = [];
        const today = new Date();

        let multiplier = 1;
        if (deviceId === 'solar-inverter') multiplier = 1.5;
        if (deviceId === 'ac-unit-1') multiplier = 0.4;

        for (let i = limit - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);

            // Random daily consumption between 8 and 14 kWh
            const val = (8 + Math.random() * 6) * multiplier;

            data.push({
                x: d.toISOString().split('T')[0], // YYYY-MM-DD
                y: parseFloat(val.toFixed(2))
            });
        }
        return data;
    },

    async getMonthlyEnergyHistory(limit = 12, deviceId) {
        const data = [];
        const today = new Date();

        let multiplier = 1;
        if (deviceId === 'solar-inverter') multiplier = 1.5;
        if (deviceId === 'ac-unit-1') multiplier = 0.4;

        for (let i = limit - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(d.getMonth() - i);

            // Random monthly consumption between 280 and 380 kWh
            const val = (280 + Math.random() * 100) * multiplier;

            // YYYY-MM-01 format for robust parsing
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');

            data.push({
                x: `${year}-${month}-01`,
                y: parseFloat(val.toFixed(2))
            });
        }
        return data;
    },

    async getPeakLoadHistory(limit = 7, deviceId) {
        const data = [];
        const today = new Date();

        let multiplier = 1;
        if (deviceId === 'solar-inverter') multiplier = 1.5;
        if (deviceId === 'ac-unit-1') multiplier = 0.4;

        for (let i = limit - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            // Random peak between 10A and 25A
            const val = (10 + Math.random() * 15) * multiplier;
            data.push({
                x: d.toISOString().split('T')[0],
                y: parseFloat(val.toFixed(1))
            });
        }
        return data;
    }
};
