import React from 'react';
import { Calendar, CloudRain, Sun, Cloud, CloudLightning } from 'lucide-react';
import './ForecastCard.css';

const ForecastCard = () => {
  // Mock forecast data for UI placeholder
  const forecast = [
    { day: 'Mon', temp: 32, aqi: 120, icon: <Sun size={24} color="#FBBF24" />, statusColor: 'var(--status-moderate)' },
    { day: 'Tue', temp: 30, aqi: 85, icon: <Cloud size={24} color="#94A3B8" />, statusColor: 'var(--status-good)' },
    { day: 'Wed', temp: 28, aqi: 150, icon: <CloudRain size={24} color="#60A5FA" />, statusColor: 'var(--status-poor)' },
    { day: 'Thu', temp: 29, aqi: 110, icon: <Cloud size={24} color="#94A3B8" />, statusColor: 'var(--status-moderate)' },
    { day: 'Fri', temp: 27, aqi: 210, icon: <CloudLightning size={24} color="#818CF8" />, statusColor: 'var(--status-very-poor)' },
  ];

  return (
    <div className="card forecast-card animate-fade-in delay-200">
      <div className="card-header">
        <h2 className="card-title">
          5-Day Forecast
        </h2>
        <div className="card-icon" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Calendar size={20} />
        </div>
      </div>
      
      <div className="forecast-grid">
        {forecast.map((item, index) => (
          <div key={index} className="forecast-day-card">
            <span className="f-day">{item.day}</span>
            <div className="f-icon">{item.icon}</div>
            <div className="f-temp">{item.temp}°</div>
            <div className="f-aqi">
              <div className="f-aqi-dot" style={{ backgroundColor: item.statusColor }}></div>
              AQI {item.aqi}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastCard;
