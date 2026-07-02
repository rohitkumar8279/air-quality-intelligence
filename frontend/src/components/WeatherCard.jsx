import React from 'react';
import { Cloud, Droplets, Wind as WindIcon, Thermometer } from 'lucide-react';
import './WeatherCard.css';

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="card weather-card animate-fade-in delay-200">
      <div className="weather-bg-animation"></div>
      
      <div className="card-header relative-z">
        <h2 className="card-title">
          Current Weather
        </h2>
        <div className="card-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
          <Cloud size={20} />
        </div>
      </div>
      
      <div className="weather-main relative-z">
        <div className="temperature-group">
          <div className="temperature">
            {weather.temperature}°
          </div>
          <div className="conditions">
            {weather.conditions || 'Clear Sky'}
          </div>
        </div>
      </div>
      
      <div className="weather-details grid grid-cols-3 relative-z">
        <div className="weather-metric">
          <Droplets size={16} className="metric-icon" />
          <div className="metric-value">{weather.humidity}%</div>
          <div className="metric-label">Humidity</div>
        </div>
        
        <div className="weather-metric">
          <WindIcon size={16} className="metric-icon" />
          <div className="metric-value">{weather.wind_speed} km/h</div>
          <div className="metric-label">Wind</div>
        </div>
        
        <div className="weather-metric">
          <Thermometer size={16} className="metric-icon" />
          <div className="metric-value">{weather.temperature}°</div>
          <div className="metric-label">Feels Like</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
