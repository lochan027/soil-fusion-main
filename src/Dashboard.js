"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices, IconCloud } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from './components/ui/Sidebar';
import { predictSoilCondition } from './services/predictionService';
import { DeviceDataService } from './services/DeviceDataService';
import SoilAnalysisChart from './components/SoilAnalysisChart';
import CropRecommendations from './components/CropRecommendations';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const fetchLatestData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching latest prediction...');
      
      // Get prediction using latest data from storage
      const result = await predictSoilCondition({});
      console.log('Prediction result:', result);
      
      if (result.latestData) {
        // Log the raw data for debugging
        console.log('Raw latest data:', result.latestData);
        
        // Map the data correctly from the blob storage format
        const mappedData = {
          moisture: Number(result.latestData.Moisture || result.latestData.moisture || 0),
          temperature: Number(result.latestData.Temperature || result.latestData.temperature || 0),
          ph: Number(result.latestData.pH || result.latestData.ph || 0),
          nitrogen: Number(result.latestData.Nitrogen || result.latestData.nitrogen || 0),
          phosphorus: Number(result.latestData.Phosphorus || result.latestData.phosphorous || 0),
          potassium: Number(result.latestData.Potassium || result.latestData.potassium || 0),
          oxygen: Number(result.latestData.Oxygen || result.latestData.oxygen || 0),
          timestamp: new Date(result.latestData.Timestamp || result.latestData.timestamp || Date.now())
        };

        // Verify the mapped values
        console.log('Mapped device data:', mappedData);
        
        // Ensure no NaN values
        Object.keys(mappedData).forEach(key => {
          if (key !== 'timestamp' && isNaN(mappedData[key])) {
            mappedData[key] = 0;
          }
        });

        setDeviceData(mappedData);
        
        if (result.condition) {
          console.log('Setting recommendation:', {
            condition: result.condition,
            recommendation: result.recommendation,
            note: result.note
          });
          setRecommendation({
            condition: result.condition,
            recommendation: result.recommendation,
            note: result.note
          });
        }
      } else {
        console.error('No soil data in result:', result);
        setError('No soil data available');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch soil data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, fetching latest data...');
        fetchLatestData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const getStatusColor = (value, type) => {
    const thresholds = {
      moisture: { low: 30, high: 70 },
      temperature: { low: 15, high: 30 },
      ph: { low: 6.0, high: 7.5 },
      oxygen: { low: 15, high: 25 },
      nitrogen: { low: 20, high: 50 },
      phosphorus: { low: 20, high: 50 },
      potassium: { low: 20, high: 50 }
    };

    const threshold = thresholds[type];
    if (value < threshold.low) return 'text-red-500';
    if (value > threshold.high) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusMessage = (value, type) => {
    const thresholds = {
      moisture: { low: 30, high: 70, unit: '%' },
      temperature: { low: 15, high: 30, unit: '°C' },
      ph: { low: 6.0, high: 7.5, unit: '' },
      oxygen: { low: 15, high: 25, unit: '%' },
      nitrogen: { low: 20, high: 50, unit: '%' },
      phosphorus: { low: 20, high: 50, unit: '%' },
      potassium: { low: 20, high: 50, unit: '%' }
    };

    const threshold = thresholds[type];
    if (value < threshold.low) return `Low (${value}${threshold.unit})`;
    if (value > threshold.high) return `High (${value}${threshold.unit})`;
    return `Optimal (${value}${threshold.unit})`;
  };

  return (
    <>
      {/* Demo Notice Banner - Moved to top level */}
      <div className="fixed top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-3 text-center z-50">
        <p className="text-yellow-500 text-sm font-medium">
          🚧 Demo Mode: This application is for demonstration purposes only. Not all features are fully integrated. 🚧
        </p>
      </div>

      <div className="dashboard-container" style={{ paddingTop: "3rem" }}>
        <Sidebar>
          <div className="menu-items">
            <SidebarItem
              icon={<IconLayoutDashboard size={24} />}
              text="Dashboard"
              to="/dashboard"
              active
            />
            <SidebarItem
              icon={<IconDevices size={24} />}
              text="Devices"
              to="/devices"
            />
            <SidebarItem
              icon={<IconCloud size={24} />}
              text="Weather"
              to="/weather"
            />
            <SidebarItem
              icon={<IconUser size={24} />}
              text="Profile"
              to="/profile"
            />
            <SidebarItem
              icon={<IconSettings size={24} />}
              text="Settings"
              to="/settings"
            />
            <SidebarItem
              icon={<IconLogout size={24} />}
              text="Logout"
              onClick={handleLogout}
            />
          </div>
          <div className="profile-section">
            <div className="profile-image" />
            <span className="profile-name">John Doe</span>
          </div>
        </Sidebar>

        <main className="main-content">
          <div className="grid-container">
            <section className="overview-section">
              {/* Current Conditions Section */}
              <div className="current-conditions">
                <h2>Current Soil Conditions</h2>
                {loading ? (
                  <div className="card">
                    <h3>Loading soil data...</h3>
                  </div>
                ) : error ? (
                  <div className="card">
                    <h3 className="text-red-500">{error}</h3>
                  </div>
                ) : deviceData ? (
                  <>
                    <div className="conditions-grid">
                      <div className="condition-box">
                        <h4>Moisture</h4>
                        <div className={`value ${getStatusColor(deviceData.moisture, 'moisture')}`}>
                          <p>{deviceData.moisture}</p>
                          <span className="unit">%</span>
                        </div>
                      </div>
                      
                      <div className="condition-box">
                        <h4>Temperature</h4>
                        <div className={`value ${getStatusColor(deviceData.temperature, 'temperature')}`}>
                          <p>{deviceData.temperature}</p>
                          <span className="unit">°C</span>
                        </div>
                      </div>
                      
                      <div className="condition-box">
                        <h4>pH Level</h4>
                        <div className={`value ${getStatusColor(deviceData.ph, 'ph')}`}>
                          <p>{deviceData.ph}</p>
                        </div>
                      </div>
                      
                      <div className="condition-box">
                        <h4>Oxygen</h4>
                        <div className={`value ${getStatusColor(deviceData.oxygen, 'oxygen')}`}>
                          <p>{deviceData.oxygen}</p>
                          <span className="unit">%</span>
                        </div>
                      </div>

                      <div className="condition-box">
                        <h4>Nitrogen</h4>
                        <div className={`value ${getStatusColor(deviceData.nitrogen, 'nitrogen')}`}>
                          <p>{deviceData.nitrogen}</p>
                          <span className="unit">%</span>
                        </div>
                      </div>

                      <div className="condition-box">
                        <h4>Phosphorus</h4>
                        <div className={`value ${getStatusColor(deviceData.phosphorus, 'phosphorus')}`}>
                          <p>{deviceData.phosphorus}</p>
                          <span className="unit">%</span>
                        </div>
                      </div>

                      <div className="condition-box">
                        <h4>Potassium</h4>
                        <div className={`value ${getStatusColor(deviceData.potassium, 'potassium')}`}>
                          <p>{deviceData.potassium}</p>
                          <span className="unit">%</span>
                        </div>
                      </div>
                    </div>

                    {recommendation && (
                      <div className="card mb-6">
                        <h3 className="text-xl font-bold mb-4">AI Recommendations</h3>
                        <div className="card-content">
                          {recommendation.error ? (
                            <p className="text-red-500">{recommendation.error}</p>
                          ) : (
                            <>
                              <p className="font-semibold mb-2">Overall Condition: {recommendation.condition}</p>
                              <p className="mb-4">{recommendation.recommendation}</p>
                              {recommendation.note && (
                                <p className="text-sm text-gray-600 mb-4">{recommendation.note}</p>
                              )}
                              
                              {/* Integrated Crop Recommendations */}
                              {deviceData && (
                                <CropRecommendations soilData={{
                                  nitrogen: deviceData.nitrogen,
                                  phosphorous: deviceData.phosphorus,
                                  potassium: deviceData.potassium,
                                  temperature: deviceData.temperature,
                                  humidity: deviceData.moisture,
                                  ph: deviceData.ph,
                                  rainfall: 200
                                }} />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="card">
                      <h3>Last Updated</h3>
                      <div className="card-content">
                        <p>{deviceData.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="card">
                    <h3>No data available</h3>
                    <p>Please add soil measurements in the Devices section</p>
                  </div>
                )}
              </div>

              {/* Chart Section - Now below the current conditions */}
              <div className="chart-section bg-white rounded-lg p-6 shadow-sm mt-6">
                <h2 className="text-xl font-bold mb-4">Soil Analysis Trends</h2>
                <SoilAnalysisChart data={deviceData} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;

