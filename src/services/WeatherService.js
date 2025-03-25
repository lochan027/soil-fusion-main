const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888/.netlify/functions';

export const WeatherService = {
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    reject(error);
                }
            );
        });
    },

    async getWeatherData(latitude, longitude) {
        try {
            console.log('Fetching weather data for:', { latitude, longitude });
            
            const response = await fetch(
                `${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Weather API Error Response:', errorText);
                throw new Error(`Failed to get weather data: ${errorText}`);
            }

            const data = await response.json();
            console.log('Weather API Response:', data);
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error getting weather data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}; 