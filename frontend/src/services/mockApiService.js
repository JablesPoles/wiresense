export const mockApiService = {
    // Config
    settings: {
        baseCurrent: 3.5,
        noise: 0.5,
        lastUpdate: Date.now(),
        currentValue: 3.5,
    },

    // Simulates standard random walk for smooth realtime data
    generateRealtimeValue() {
        const now = Date.now();
        const timeDiff = (now - this.settings.lastUpdate) / 1000;

        // Simple random walk
        const change = (Math.random() - 0.5) * this.settings.noise;
        let newValue = this.settings.currentValue + change;

        // Bounds (e.g., min 0.5A, max 15A)
        if (newValue < 0.5) newValue = 0.5 + Math.random();
        if (newValue > 15) newValue = 14 + Math.random();

        this.settings.currentValue = newValue;
        this.settings.lastUpdate = now;

        return newValue;
    },

    async getLatestDataPoint() {
        await new Promise(r => setTimeout(r, 100)); // Simulate latency
        return {
            current: this.generateRealtimeValue(),
            voltage: 127, // Default assumption
            power: this.generateRealtimeValue() * 127,
            time: new Date().toISOString()
        };
    },

    async getRealtimeData(windowStr = '5m') {
        // Generate ~30 points for the chart
        const points = [];
        const now = Date.now();
        let val = this.settings.currentValue;

        for (let i = 29; i >= 0; i--) {
            points.push({
                time: new Date(now - i * 5000).toISOString(),
                current: val,
            });
            // Backwards random walk
            val = val - (Math.random() - 0.5) * 0.5;
            if (val < 0) val = 0.5;
        }

        return points;
    },

    async getEnergySummary() {
        // Return some convincing numbers
        return {
            today: 12.5 + Math.random(), // kWh
            month: 345.2 + Math.random() * 5, // kWh
            last_updated: new Date().toISOString()
        };
    },

    async getDailyEnergyHistory(days = 7) {
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);

            // Random daily consumption between 8 and 14 kWh
            const val = 8 + Math.random() * 6;

            data.push({
                x: d.toISOString().split('T')[0], // YYYY-MM-DD
                y: parseFloat(val.toFixed(2))
            });
        }
        return data;
    },

    async getMonthlyEnergyHistory(months = 12) {
        const data = [];
        const today = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(d.getMonth() - i);

            // Random monthly consumption between 280 and 380 kWh
            // Higher in "winter/summer" simulation? Let's just random
            const val = 280 + Math.random() * 100;

            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

            data.push({
                x: `${monthNames[d.getMonth()]}/${d.getFullYear()}`,
                y: parseFloat(val.toFixed(2))
            });
        }
        return data;
    },

    async getPeakLoadHistory(days = 7) {
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            // Random peak between 10A and 25A
            const val = 10 + Math.random() * 15;
            data.push({
                x: d.toISOString().split('T')[0],
                y: parseFloat(val.toFixed(1))
            });
        }
        return data;
    }
};
