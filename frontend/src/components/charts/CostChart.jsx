import React from 'react';
import ReactApexChart from 'react-apexcharts';

export const CostChart = ({ data, currencySymbol = '$' }) => {
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
                columnWidth: '50%',
                borderRadius: 4,
                dataLabels: { position: 'top' }
            }
        },
        colors: ['#10b981'], // Emerald/Green for money
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
            enabled: true,
            formatter: (val) => `${val}`,
            offsetY: -20,
            style: {
                colors: ['#10b981'],
                fontSize: '10px',
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val) => `${currencySymbol} ${val}`
            }
        }
    };

    const series = [{
        name: 'Custo Estimado',
        data: data.map(d => ({ x: d.x, y: d.y }))
    }];

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-foreground font-semibold text-lg">Evolução de Custos</h3>
                    <p className="text-xs text-muted-foreground">Baseado na tarifa configurada</p>
                </div>
            </div>
            <ReactApexChart options={options} series={series} type="bar" height={300} />
        </div>
    );
};
