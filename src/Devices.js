import React, { useState, useEffect } from 'react';
import ThingsBoardService from './services/ThingsBoardService';
import { CropRecommendationService } from './services/CropRecommendationService';
import { DeviceDataService } from './services/DeviceDataService';
import { predictSoilCondition } from './services/predictionService';
import { IconPlus, IconRefresh, IconTrash, IconDeviceFloppy, IconChevronDown } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from './components/ui/Sidebar';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices, IconCloud, IconBook } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const Devices = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [deviceData, setDeviceData] = useState({});
    const [credentials, setCredentials] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [manualData, setManualData] = useState({
        nitrogen: '',
        phosphorous: '',
        temperature: '',
        oxygen: '',
        potassium: '',
        ph: '',
        moisture: ''
    });

    useEffect(() => {
        // Login to ThingsBoard when component mounts
        const initializeThingsBoard = async () => {
            try {
                await ThingsBoardService.login(
                    process.env.REACT_APP_THINGSBOARD_USERNAME,
                    process.env.REACT_APP_THINGSBOARD_PASSWORD
                );
                fetchDevices();
            } catch (err) {
                setError('Failed to initialize ThingsBoard connection');
                console.error(err);
            }
        };

        initializeThingsBoard();
    }, []);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const deviceList = await ThingsBoardService.listDevices();
            setDevices(deviceList);
            
            // Fetch telemetry data for each device
            const dataPromises = deviceList.map(async device => {
                const data = await ThingsBoardService.getLatestTelemetry(device.id.id);
                return { deviceId: device.id.id, data };
            });
            
            const allData = await Promise.all(dataPromises);
            const dataMap = allData.reduce((acc, { deviceId, data }) => {
                acc[deviceId] = data;
                return acc;
            }, {});
            
            setDeviceData(dataMap);
            setError(null);
        } catch (err) {
            setError('Failed to fetch devices');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDevice = async () => {
        try {
            setLoading(true);
            const newDevice = await ThingsBoardService.createDevice(newDeviceName);
            
            // Get device credentials after creation
            const deviceCredentials = await ThingsBoardService.getDeviceCredentials(newDevice.id.id);
            setCredentials(deviceCredentials);
            
            setShowAddDevice(false);
            setNewDeviceName('');
            await fetchDevices();
        } catch (err) {
            setError('Failed to add device');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        try {
            setLoading(true);
            await ThingsBoardService.deleteDevice(deviceId);
            await fetchDevices();
        } catch (err) {
            setError('Failed to delete device');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderDeviceData = (device) => {
        const data = deviceData[device.id.id] || {};
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-gray-400 text-sm">{key.replace(/_/g, ' ').toUpperCase()}</h4>
                        <p className="text-white text-xl font-semibold">{typeof value === 'number' ? value.toFixed(2) : 'N/A'}</p>
                    </div>
                ))}
            </div>
        );
    };

    const handleLogout = () => {
        navigate('/');
    };

    const handleManualDataChange = (e) => {
        const { name, value } = e.target;
        setManualData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleManualDataSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            
            // Validate that all required fields are filled
            const requiredFields = ['nitrogen', 'phosphorous', 'potassium', 'temperature', 'moisture', 'ph'];
            const missingFields = requiredFields.filter(field => !manualData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            // Convert all values to numbers and validate
            const data = Object.entries(manualData).reduce((acc, [key, value]) => {
                const numValue = value === '' ? null : Number(value);
                if (requiredFields.includes(key) && (numValue === null || isNaN(numValue))) {
                    throw new Error(`Invalid value for ${key}`);
                }
                acc[key] = numValue;
                return acc;
            }, {});

            console.log('Submitting data:', data);

            // First store the data in Azure Blob storage
            const storageResult = await DeviceDataService.storeDeviceData(data);
            if (!storageResult.success) {
                throw new Error('Failed to store data in Azure Blob storage');
            }

            // Then get crop recommendations
            const result = await CropRecommendationService.getCropRecommendations(data);
            
            if (result.success) {
                // Clear form
                setManualData({
                    nitrogen: '',
                    phosphorous: '',
                    temperature: '',
                    oxygen: '',
                    potassium: '',
                    ph: '',
                    moisture: ''
                });
                setShowManualEntry(false);
                setError(null);
                
                console.log('Crop recommendations:', result.data);
                fetchLatestData();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to submit manual data: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching latest prediction...');
            
            // Get prediction using latest data from storage
            const result = await predictSoilCondition({});
            console.log('Prediction result:', result);
            
            if (result.latestData) {
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
                
                setDeviceData(prevData => ({
                    ...prevData,
                    latest: mappedData
                }));
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching latest data:', err);
            setError('Failed to fetch latest data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar>
                <div className="menu-items">
                    <SidebarItem
                        icon={<IconBook size={24} />}
                        text="ReadMe"
                        to="/readme"
                    />
                    <SidebarItem
                        icon={<IconLayoutDashboard size={24} />}
                        text="Dashboard"
                        to="/dashboard"
                    />
                    <SidebarItem
                        icon={<IconDevices size={24} />}
                        text="Devices"
                        to="/devices"
                        active
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
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">IoT Devices</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchDevices()}
                                className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                            >
                                <IconRefresh size={20} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowAddDevice(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <IconPlus size={20} />
                                Add Device
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {showAddDevice && (
                        <div className="bg-gray-900 p-6 rounded-lg mb-6 border border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Add New Device</h2>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={newDeviceName}
                                    onChange={(e) => setNewDeviceName(e.target.value)}
                                    placeholder="Enter device name"
                                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                />
                                <button
                                    onClick={handleAddDevice}
                                    disabled={!newDeviceName}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 flex items-center gap-2"
                                >
                                    <IconDeviceFloppy size={20} />
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddDevice(false);
                                        setCredentials(null);
                                    }}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                                >
                                    Cancel
                                </button>
                            </div>
                            {credentials && (
                                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                                    <h3 className="text-lg font-semibold text-white mb-2">Device Credentials</h3>
                                    <p className="text-gray-300">Access Token: <span className="text-green-400 font-mono">{credentials.credentialsId}</span></p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Save this token! You'll need it to connect your device to ThingsBoard.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Data Entry */}
                    <div className="bg-gray-900 rounded-lg mb-6 border border-gray-700 overflow-hidden">
                        <button
                            onClick={() => setShowManualEntry(!showManualEntry)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-lg font-semibold text-white">Manual Data Entry</span>
                            <IconChevronDown
                                size={20}
                                className={`text-gray-400 transform transition-transform ${showManualEntry ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {showManualEntry && (
                            <div className="p-6">
                                <form onSubmit={handleManualDataSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Nitrogen (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="nitrogen"
                                                value={manualData.nitrogen}
                                                onChange={handleManualDataChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                                placeholder="Enter nitrogen level"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Phosphorous (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="phosphorous"
                                                value={manualData.phosphorous}
                                                onChange={handleManualDataChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                                placeholder="Enter phosphorous level"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Temperature (°C)
                                            </label>
                                            <input
                                                type="number"
                                                name="temperature"
                                                value={manualData.temperature}
                                                onChange={handleManualDataChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                                placeholder="Enter temperature"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Oxygen (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="oxygen"
                                                value={manualData.oxygen}
                                                onChange={handleManualDataChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                                placeholder="Enter oxygen level"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Potassium (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="potassium"
                                                value={manualData.potassium}
                                                onChange={handleManualDataChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                                placeholder="Enter potassium level"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                pH Level
                                            </label>
                                            <input
                                                type="number"
                                                name="ph"
                                                value={manualData.ph}
                                                onChange={handleManualDataChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                                placeholder="Enter pH level"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Moisture (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="moisture"
                                                value={manualData.moisture}
                                                onChange={handleManualDataChange}
                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                                                placeholder="Enter moisture level"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <IconDeviceFloppy size={20} />
                                            Submit Data
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6">
                        {loading ? (
                            <div className="animate-pulse">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-gray-800 h-48 rounded-lg"></div>
                                ))}
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                                <p className="text-gray-400">No devices found. Add your first IoT device to get started.</p>
                            </div>
                        ) : (
                            devices.map(device => (
                                <div key={device.id.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-white">{device.name}</h3>
                                            <p className="text-gray-400 text-sm">ID: {device.id.id}</p>
                                            <p className="text-gray-400 text-sm">Type: {device.type}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDevice(device.id.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-800"
                                        >
                                            <IconTrash size={20} />
                                        </button>
                                    </div>
                                    {renderDeviceData(device)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Devices; 