import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useLanguage } from '../../contexts/LanguageContext';

export const CostChart = React.memo(({ data, currencySymbol = '$', color, highlightDate }) => {
    const { t } = useLanguage();
    // data: [{ x: '2023-10-01', y: 15.2 }, ...]

    const options = React.useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            background: 'transparent',
            fontFamily: 'inherit',
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 4,
                dataLabels: { position: 'top' }
            }
        },
        colors: [function ({ value, seriesIndex, dataPointIndex, w }) {
            if (!highlightDate) return color || '#10b981';
            const pointData = data[dataPointIndex];
            if (!pointData) return color || '#10b981';
            return pointData.x === highlightDate ? (color || '#10b981') : '#334155'; // Dimmed to gray-slate-700
        }],
        xaxis: {
            type: 'category',
            labels: {
                style: { colors: '#94a3b8' }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#94a3b8' },
                formatter: (val) => `${currencySymbol}${val}`
            },
        },
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4,
        },
        dataLabels: {
            enabled: false,
            formatter: (val) => `${val}`,
            offsetY: -20,
            style: {
                colors: [color || '#10b981'],
                fontSize: '10px',
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val) => `${currencySymbol} ${val}`
            }
        },
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
    }), [t, currencySymbol, color, highlightDate, data]);

    const series = React.useMemo(() => [{
        name: t('estimated_cost'),
        data: data.map(d => ({ x: d.x, y: d.y }))
    }], [data, t]);

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-foreground font-semibold text-lg">{t('cost_evolution')}</h3>
                    <p className="text-xs text-muted-foreground">{t('based_on_tariff')}</p>
                </div>
            </div>
            <ReactApexChart options={options} series={series} type="bar" height={300} />
        </div>
    );
});
