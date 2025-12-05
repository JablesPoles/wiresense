import React from 'react';
import ReactApexChart from 'react-apexcharts';

export const HeatmapChart = () => {
    const series = [{
        name: 'Metric1',
        data: [
            { x: 'W1', y: 10 },
            { x: 'W2', y: 20 },
            { x: 'W3', y: 30 },
            { x: 'W4', y: 40 }
        ]
    }];

    const options = {
        chart: {
            type: 'heatmap',
            toolbar: { show: false },
            background: 'transparent',
        },
        theme: { mode: 'dark' },
        dataLabels: { enabled: false },
        colors: ["#008FFB"],
        title: { text: 'Heatmap' }
    };

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h3 className="text-foreground font-semibold mb-4">Mapa de Calor</h3>
            <ReactApexChart options={options} series={series} type="heatmap" height={300} />
        </div>
    );
};
