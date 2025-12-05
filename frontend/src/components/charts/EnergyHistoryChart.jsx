import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

// Helper to get CSS variable value
const getCssVar = (name) => {
    if (typeof window !== 'undefined') {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return `hsl(${value})`;
    }
    return '#8b5cf6'; // Default purple
};

export const EnergyHistoryChart = ({ data, type = 'daily', unit = 'kWh' }) => {
    // data format: [{ x: '2023-10-01', y: 12.5 }, ...]

    // We want a gradient aesthetic
    const options = {
        chart: {
            type: 'area',
            height: 350,
            background: 'transparent',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        theme: { mode: 'dark' },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#8b5cf6', '#06b6d4'] // Violet to Cyan
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            type: 'category',
            categories: data.map(d => {
                const date = new Date(d.x);
                // Format depending on type
                if (type === 'daily') return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            }),
            labels: { style: { colors: '#94a3b8' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: '#94a3b8' },
                formatter: val => val.toFixed(1)
            },
            title: { text: unit }
        },
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        tooltip: {
            theme: 'dark',
            x: { show: true },
            y: { formatter: val => `${val} ${unit}` }
        },
        colors: ['#8b5cf6'],
        responsive: [{
            breakpoint: 640,
            options: {
                xaxis: {
                    tickAmount: 5, // Reduce ticks on mobile
                    labels: {
                        rotate: -45,
                        rotateAlways: false,
                        style: { fontSize: '10px' }
                    }
                }
            }
        }]
    };

    const series = [{
        name: 'Consumo',
        data: data.map(d => d.y)
    }];

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    {type === 'daily' ? 'Consumo Diário' : 'Consumo Mensal'}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {type === 'daily' ? 'Últimos 7 dias' : 'Últimos 6 meses'}
                </p>
            </div>
            <ReactApexChart options={options} series={series} type="area" height={350} />
        </div>
    );
};
