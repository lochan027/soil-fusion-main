import React, { useState, useEffect } from 'react';
import { IconLayoutDashboard, IconUser, IconSettings, IconLogout, IconDevices, IconCloud } from '@tabler/icons-react';
import { Sidebar, SidebarItem } from './components/ui/Sidebar';
import './Dashboard.css';
import './Weather.css';

const API_KEY = 'deeb45792cfb4e6585623957252101';
const BASE_URL = 'http://api.weatherapi.com/v1';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setError('Unable to get location. Using default location.');
          setLocation({ lat: 51.5074, lon: -0.1278 }); // Default to London
        }
      );
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location.lat},${location.lon}&days=5&aqi=yes`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      setWeatherData(data.current);
      setForecast(data.forecast);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again later.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFarmingRecommendation = (weather) => {
    if (!weather) return '';
    
    const recommendations = [];
    
    if (weather.precip_mm > 5) {
      recommendations.push('Heavy rain expected. Consider postponing outdoor activities.');
    }
    
    if (weather.temp_c > 30) {
      recommendations.push('High temperature alert. Ensure proper irrigation.');
    }
    
    if (weather.wind_kph > 20) {
      recommendations.push('Strong winds expected. Protect sensitive crops.');
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
                  <img src={weatherData.condition.icon} alt={weatherData.condition.text} />
                  <div className="temperature">
                    <h3>{weatherData.temp_c}°C</h3>
                    <p>{weatherData.condition.text}</p>
                  </div>
                  <div className="details">
                    <p>Humidity: {weatherData.humidity}%</p>
                    <p>Wind: {weatherData.wind_kph} km/h</p>
                    <p>Precipitation: {weatherData.precip_mm} mm</p>
                  </div>
                </div>
                <div className="farming-recommendation">
                  <h3>Farming Recommendations</h3>
                  <p>{getFarmingRecommendation(weatherData)}</p>
                </div>
              </div>

              {forecast && (
                <div className="forecast">
                  <h2>5-Day Forecast</h2>
                  <div className="forecast-grid">
                    {forecast.forecastday.map((day) => (
                      <div key={day.date} className="forecast-day">
                        <h4>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
                        <img src={day.day.condition.icon} alt={day.day.condition.text} />
                        <p className="temp">{day.day.avgtemp_c}°C</p>
                        <p className="condition">{day.day.condition.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Weather; 