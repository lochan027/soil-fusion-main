import React, { useState, useEffect } from 'react';
import ArduinoCloudService from '../services/ArduinoCloudService';
import { IconPlus, IconRefresh, IconTrash, IconDeviceFloppy } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from '../components/ui/Sidebar';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices, IconCloud } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const Devices = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [deviceData, setDeviceData] = useState({});

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const deviceList = await ArduinoCloudService.listDevices();
            setDevices(deviceList);
            
            // Fetch data for each device
            const dataPromises = deviceList.map(async device => {
                const data = await ArduinoCloudService.getDeviceData(device.id);
                return { deviceId: device.id, data };
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

    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const handleAddDevice = async () => {
        try {
            setLoading(true);
            const newDevice = await ArduinoCloudService.createDevice(newDeviceName);
            await ArduinoCloudService.createDeviceProperties(newDevice.id);
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

    const renderDeviceData = (device) => {
        const data = deviceData[device.id] || {};
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-gray-400 text-sm">{key.replace(/_/g, ' ').toUpperCase()}</h4>
                        <p className="text-white text-xl font-semibold">{value?.toFixed(2) || 'N/A'}</p>
                    </div>
                ))}
            </div>
        );
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <Sidebar>
                <div className="menu-items">
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
                                    onClick={() => setShowAddDevice(false)}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

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
                                <div key={device.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-white">{device.name}</h3>
                                            <p className="text-gray-400 text-sm">ID: {device.id}</p>
                                        </div>
                                        <button
                                            onClick={() => {/* Handle device deletion */}}
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