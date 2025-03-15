import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DeviceDataService } from '../services/DeviceDataService';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SoilAnalysisChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            setLoading(true);
            const response = await DeviceDataService.getLast7DaysData();
            console.log('Chart data response:', response);

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch data');
            }

            const data = response.data;
            if (!data || data.length === 0) {
                throw new Error('No data available for chart');
            }

            console.log('Processing data:', data);

            const labels = data.map(item => {
                const date = new Date(item.Timestamp);
                return date.toLocaleDateString();
            });

            const chartDataConfig = {
                labels,
                datasets: [
                    {
                        label: 'Moisture (%)',
                        data: data.map(item => item.Moisture),
                        borderColor: 'rgb(53, 162, 235)',
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        tension: 0.1
                    },
                    {
                        label: 'Temperature (°C)',
                        data: data.map(item => item.Temperature),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        tension: 0.1
                    },
                    {
                        label: 'pH',
                        data: data.map(item => item.pH),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1
                    },
                    {
                        label: 'Nitrogen (%)',
                        data: data.map(item => item.Nitrogen),
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.5)',
                        tension: 0.1
                    },
                    {
                        label: 'Phosphorus (%)',
                        data: data.map(item => item.Phosphorus),
                        borderColor: 'rgb(153, 102, 255)',
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                        tension: 0.1
                    },
                    {
                        label: 'Potassium (%)',
                        data: data.map(item => item.Potassium),
                        borderColor: 'rgb(255, 205, 86)',
                        backgroundColor: 'rgba(255, 205, 86, 0.5)',
                        tension: 0.1
                    },
                    {
                        label: 'Oxygen (%)',
                        data: data.map(item => item.Oxygen),
                        borderColor: 'rgb(201, 203, 207)',
                        backgroundColor: 'rgba(201, 203, 207, 0.5)',
                        tension: 0.1
                    }
                ]
            };

            console.log('Setting chart data:', chartDataConfig);
            setChartData(chartDataConfig);
            setLoading(false);
        } catch (err) {
            console.error('Error in fetchChartData:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true
                }
            },
            title: {
                display: true,
                text: 'Soil Analysis Trends (Last 7 Days)',
                padding: 20
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    if (loading) return (
        <div className="chart-loading">
            <p>Loading chart data...</p>
        </div>
    );
    
    if (error) return (
        <div className="chart-error">
            <p>Error loading chart: {error}</p>
        </div>
    );
    
    if (!chartData || !chartData.datasets) return (
        <div className="chart-no-data">
            <p>No data available for chart</p>
        </div>
    );

    return (
        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
            <Line options={options} data={chartData} />
        </div>
    );
};

export default SoilAnalysisChart; 