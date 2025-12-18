import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useLanguage } from '../../contexts/LanguageContext';

export const PeakLoadChart = React.memo(({ data, color, highlightDate }) => {
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
                columnWidth: '40%',
                borderRadius: 4,
            }
        },
        colors: [function ({ value, seriesIndex, dataPointIndex, w }) {
            if (!highlightDate) return color || '#F59E0B';
            const pointData = data[dataPointIndex];
            if (!pointData) return color || '#F59E0B';
            return pointData.x === highlightDate ? (color || '#F59E0B') : '#334155';
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
                formatter: (val) => `${val}A`
            },
            title: { text: t('amperes') }
        },
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4,
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val) => `${val} ${t('amperes')}`
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
    }), [t, color, highlightDate, data]);

    const series = React.useMemo(() => [{
        name: t('peak_current'),
        data: data.map(d => ({ x: d.x, y: d.y }))
    }], [data, t]);

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-foreground font-semibold text-lg">{t('peak_load_title')}</h3>
                    <p className="text-xs text-muted-foreground">{t('peak_load_desc')}</p>
                </div>
            </div>
            <ReactApexChart options={options} series={series} type="bar" height={300} />
        </div>
    );
});
