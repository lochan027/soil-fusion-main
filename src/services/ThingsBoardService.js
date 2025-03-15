import axios from 'axios';

const THINGSBOARD_URL = process.env.REACT_APP_THINGSBOARD_URL || 'http://localhost:8080';
const ACCESS_TOKEN = process.env.REACT_APP_THINGSBOARD_ACCESS_TOKEN;

// Mock data for testing
let mockDevices = [];
let mockDeviceId = 1;

class ThingsBoardService {
    constructor() {
        this.token = null;
        this.isTestMode = !ACCESS_TOKEN;
    }

    async login(username, password) {
        if (this.isTestMode) {
            this.token = 'test_token';
            return this.token;
        }

        try {
            const response = await axios.post(`${THINGSBOARD_URL}/api/auth/login`, {
                username,
                password
            });
            this.token = response.data.token;
            return this.token;
        } catch (error) {
            console.error('ThingsBoard authentication failed:', error);
            throw error;
        }
    }

    async getHeaders() {
        return {
            'X-Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async listDevices() {
        if (this.isTestMode) {
            return mockDevices;
        }

        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${THINGSBOARD_URL}/api/tenant/devices?pageSize=100&page=0`, { headers });
            return response.data.data;
        } catch (error) {
            console.error('Failed to list devices:', error);
            throw error;
        }
    }

    async createDevice(deviceName) {
        if (this.isTestMode) {
            const newDevice = {
                id: {
                    entityType: 'DEVICE',
                    id: `device_${mockDeviceId++}`
                },
                name: deviceName,
                type: 'soil-sensor',
                additionalInfo: {
                    description: 'Soil monitoring sensor'
                }
            };
            mockDevices.push(newDevice);
            return newDevice;
        }

        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${THINGSBOARD_URL}/api/device`, {
                name: deviceName,
                type: 'soil-sensor',
                additionalInfo: {
                    description: 'Soil monitoring sensor'
                }
            }, { headers });
            return response.data;
        } catch (error) {
            console.error('Failed to create device:', error);
            throw error;
        }
    }

    async deleteDevice(deviceId) {
        if (this.isTestMode) {
            mockDevices = mockDevices.filter(d => d.id.id !== deviceId);
            return true;
        }

        try {
            const headers = await this.getHeaders();
            await axios.delete(`${THINGSBOARD_URL}/api/device/${deviceId}`, { headers });
            return true;
        } catch (error) {
            console.error('Failed to delete device:', error);
            throw error;
        }
    }

    async getLatestTelemetry(deviceId) {
        if (this.isTestMode) {
            return {
                soil_temperature: Math.random() * 30 + 10,
                soil_moisture: Math.random() * 100,
                soil_ph: Math.random() * 4 + 4,
                nitrogen_level: Math.random() * 100,
                phosphorus_level: Math.random() * 100,
                potassium_level: Math.random() * 100
            };
        }

        try {
            const headers = await this.getHeaders();
            const response = await axios.get(
                `${THINGSBOARD_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=soil_temperature,soil_moisture,soil_ph,nitrogen_level,phosphorus_level,potassium_level`,
                { headers }
            );
            
            // Transform the response to match our expected format
            const telemetry = {};
            Object.entries(response.data).forEach(([key, values]) => {
                telemetry[key] = values[0].value;
            });
            
            return telemetry;
        } catch (error) {
            console.error('Failed to get device telemetry:', error);
            throw error;
        }
    }

    async getDeviceCredentials(deviceId) {
        if (this.isTestMode) {
            return {
                credentialsId: `test_token_${deviceId}`,
                credentialsType: 'ACCESS_TOKEN'
            };
        }

        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${THINGSBOARD_URL}/api/device/${deviceId}/credentials`, { headers });
            return response.data;
        } catch (error) {
            console.error('Failed to get device credentials:', error);
            throw error;
        }
    }

    async sendTelemetry(deviceId, telemetryData) {
        if (this.isTestMode) {
            const device = mockDevices.find(d => d.id.id === deviceId);
            if (!device) {
                throw new Error('Device not found');
            }
            // Update mock device data
            Object.entries(telemetryData).forEach(([key, value]) => {
                if (value !== null) {
                    device[key] = value;
                }
            });
            return true;
        }

        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${THINGSBOARD_URL}/api/plugins/telemetry/DEVICE/${deviceId}/timeseries/values`,
                telemetryData,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to send telemetry data:', error);
            throw error;
        }
    }
}

export default new ThingsBoardService(); 