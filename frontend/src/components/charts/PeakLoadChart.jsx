import React from 'react';
import ReactApexChart from 'react-apexcharts';

export const PeakLoadChart = ({ data }) => {
    // data: [{ x: '2023-10-01', y: 15.2 }, ...]

    const options = {
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
        colors: ['#F59E0B'], // Amber for warning/high load
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
                formatter: (val) => `${val} Amperes`
            }
        }
    };

    const series = [{
        name: 'Pico de Corrente',
        data: data.map(d => ({ x: d.x, y: d.y }))
    }];

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-foreground font-semibold text-lg">Picos de Carga</h3>
                    <p className="text-xs text-muted-foreground">Corrente máxima registrada por dia</p>
                </div>
            </div>
            <ReactApexChart options={options} series={series} type="bar" height={300} />
        </div>
    );
};
