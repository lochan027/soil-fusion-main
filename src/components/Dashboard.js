import React, { useEffect, useState } from 'react';
import { DeviceDataService } from '../services/DeviceDataService';
import SoilAnalysisChart from './SoilAnalysisChart';
import './Dashboard.css';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchLatestData();
    }, []);

    const fetchLatestData = async () => {
        try {
            setLoading(true);
            const response = await DeviceDataService.getDeviceData(1);
            if (response.success && response.data.length > 0) {
                setData(response.data[0]);
            } else {
                setError('No data available');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <h1>Soil Analysis Dashboard</h1>
            
            {/* Chart Section */}
            <div className="chart-section">
                <SoilAnalysisChart />
            </div>

            {/* Current Conditions Section */}
            <div className="current-conditions">
                <h2>Current Soil Conditions</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : data ? (
                    <div className="conditions-grid">
                        <div className="condition-card">
                            <h3>Moisture</h3>
                            <p>{data.moisture}%</p>
                        </div>
                        <div className="condition-card">
                            <h3>Temperature</h3>
                            <p>{data.temperature}°C</p>
                        </div>
                        <div className="condition-card">
                            <h3>pH Level</h3>
                            <p>{data.ph}</p>
                        </div>
                        <div className="condition-card">
                            <h3>Nitrogen</h3>
                            <p>{data.nitrogen}%</p>
                        </div>
                        <div className="condition-card">
                            <h3>Phosphorus</h3>
                            <p>{data.phosphorous}%</p>
                        </div>
                        <div className="condition-card">
                            <h3>Potassium</h3>
                            <p>{data.potassium}%</p>
                        </div>
                        <div className="condition-card">
                            <h3>Oxygen</h3>
                            <p>{data.oxygen}%</p>
                        </div>
                    </div>
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 