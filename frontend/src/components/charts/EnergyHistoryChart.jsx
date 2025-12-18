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

import { useLanguage } from '../../contexts/LanguageContext';

export const EnergyHistoryChart = React.memo(({ data, type = 'daily', unit = 'kWh', color, label = 'Consumo', subtitle, highlightDate }) => {
    const { language, t } = useLanguage();
    // data format: [{ x: '2023-10-01', y: 12.5 }, ...]

    // We want a gradient aesthetic
    const strokeColor = color || '#8b5cf6';
    const secondaryColor = '#06b6d4';

    const formattedData = React.useMemo(() => (data || []).map(d => {
        // If it's a simple date string (YYYY-MM-DD), append time to avoid timezone shifts (use noon)
        // If it's already an ISO string with time, use as is.
        const dateStr = d.x && !d.x.includes('T') ? `${d.x}T12:00:00` : d.x;
        return {
            x: new Date(dateStr).getTime(),
            y: d.y
        };
    }), [data]);

    const options = React.useMemo(() => ({
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
            colors: [strokeColor, secondaryColor]
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
            type: 'datetime',
            labels: {
                style: { colors: '#94a3b8' },
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM \'yy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
            tooltip: { enabled: false } // Disable Axis tooltip, use global tooltip
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
        annotations: highlightDate ? {
            xaxis: [{
                x: new Date(highlightDate.includes('T') ? highlightDate : highlightDate + 'T12:00:00').getTime(),
                strokeDashArray: 4,
                borderColor: '#ffffff',
                opacity: 0.5,
                label: {
                    borderColor: 'transparent',
                    style: {
                        color: 'transparent',
                        background: 'transparent',
                    },
                    text: '',
                }
            }],
            points: (() => {
                const point = data.find(d => d.x === highlightDate);
                if (!point) return [];
                return [{
                    x: new Date(point.x.includes('T') ? point.x : point.x + 'T12:00:00').getTime(),
                    y: point.y,
                    marker: {
                        size: 6,
                        fillColor: '#ffffff',
                        strokeColor: strokeColor,
                        strokeWidth: 3,
                        cssClass: 'apexcharts-custom-marker'
                    }
                }];
            })()
        } : {},
        tooltip: {
            theme: 'dark',
            x: {
                format: type === 'daily' ? 'dd MMM yyyy' : 'MMM yyyy'
            },
            y: { formatter: val => `${val.toFixed(2)} ${unit}` }
        },
        colors: [strokeColor],
        responsive: [{
            breakpoint: 640,
            options: {
                xaxis: {
                    tickAmount: 3,
                    labels: {
                        rotate: -45,
                        rotateAlways: false,
                        style: { fontSize: '10px' }
                    }
                }
            }
        }]
    }), [strokeColor, secondaryColor, type, unit, highlightDate]);

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm h-[350px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <div className="p-3 bg-white/5 rounded-full">
                    {/* Placeholder Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
                </div>
                <p className="text-sm">{t('no_history_data')}</p>
            </div>
        );
    }

    const displayLabel = label || t('consumption');

    const series = [{
        name: displayLabel,
        data: formattedData
    }];

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm" >
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    {displayLabel} - {type === 'daily' ? t('daily') : t('monthly')}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {subtitle || (type === 'daily' ? t('days_30') : t('months_12'))}
                </p>
            </div>
            <ReactApexChart options={options} series={series} type="area" height={350} />
        </div >
    );
});
