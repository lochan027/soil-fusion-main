import React, { useState, useEffect } from 'react';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices, IconCloud } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from './components/ui/Sidebar';
import { WeatherService } from './services/WeatherService';
import './Dashboard.css';
import './Weather.css';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Get location using WeatherService
      const location = await WeatherService.getCurrentLocation();
      
      // Get weather data using WeatherService
      const result = await WeatherService.getWeatherData(location.latitude, location.longitude);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setWeatherData(result.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again later.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFarmingRecommendation = (weather) => {
    if (!weather?.current) return '';
    
    const recommendations = [];
    const current = weather.current;
    
    if (current.temperature > 30) {
      recommendations.push('High temperature alert. Ensure proper irrigation.');
    }
    
    if (current.windSpeed.includes('mph')) {
      const windSpeed = parseInt(current.windSpeed);
      if (windSpeed > 15) {
        recommendations.push('Strong winds expected. Protect sensitive crops.');
      }
    }

    if (current.shortForecast.toLowerCase().includes('rain') || 
        current.shortForecast.toLowerCase().includes('shower')) {
      recommendations.push('Rain expected. Consider adjusting irrigation schedules.');
    }

    return recommendations.length > 0 ? recommendations.join(' ') : 'Weather conditions are suitable for farming activities.';
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
          />
          <SidebarItem
            icon={<IconCloud size={24} />}
            text="Weather"
            to="/weather"
            active
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
            onClick={() => {/* handle logout */}}
          />
        </div>
      </Sidebar>

      <main className="main-content">
        <div className="weather-container">
          {loading && <div className="loading">Loading weather data...</div>}
          {error && <div className="error">{error}</div>}
          
          {weatherData && (
            <>
              <div className="current-weather">
                <h2>Current Weather</h2>
                <div className="weather-info">
                  <div className="temperature">
                    <h3>{weatherData.current.temperature}°{weatherData.current.temperatureUnit}</h3>
                    <p>{weatherData.current.shortForecast}</p>
                  </div>
                  <div className="details">
                    <p>Humidity: {weatherData.current.humidity}%</p>
                    <p>Wind: {weatherData.current.windSpeed} {weatherData.current.windDirection}</p>
                    <p>{weatherData.current.detailedForecast}</p>
                  </div>
                </div>
                <div className="farming-recommendation">
                  <h3>Farming Recommendations</h3>
                  <p>{getFarmingRecommendation(weatherData)}</p>
                </div>
              </div>

              <div className="forecast">
                <h2>7-Day Forecast</h2>
                <div className="forecast-grid">
                  {weatherData.daily.map((day) => (
                    <div key={day.startTime} className="forecast-day">
                      <h4>{new Date(day.startTime).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
                      <p className="temp">{day.temperature}°{day.temperatureUnit}</p>
                      <p className="condition">{day.shortForecast}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Weather; 