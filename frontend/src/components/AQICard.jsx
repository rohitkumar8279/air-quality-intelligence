import React, { useState, useEffect } from 'react';
import { Info, Leaf } from 'lucide-react';
import './AQICard.css';

const AQICard = ({ aqi, pm25, pm10, no2 }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getAQIDetails = (value) => {
    if (value <= 50) return { category: 'Good', color: 'var(--status-good)', text: 'Air quality is satisfactory, and air pollution poses little or no risk.' };
    if (value <= 100) return { category: 'Moderate', color: 'var(--status-good)', text: 'Air quality is acceptable. However, there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.' };
    if (value <= 200) return { category: 'Unhealthy for Sensitive Groups', color: 'var(--status-moderate)', text: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.' };
    if (value <= 300) return { category: 'Unhealthy', color: 'var(--status-poor)', text: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' };
    return { category: 'Hazardous', color: 'var(--status-hazardous)', text: 'Health warning of emergency conditions. The entire population is more likely to be affected.' };
  };

  const { category, color, text } = getAQIDetails(aqi);
  const percentage = Math.min((aqi / 500) * 100, 100);
  const strokeDasharray = 283; 
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <div className="card aqi-card">
      <div className="card-header">
        <h2 className="card-title">Air Quality Index <Info size={14} className="text-muted ml-2" /></h2>
      </div>
      
      <div className="aqi-card-content-v2">
        <div className="aqi-info-left">
          <div className="aqi-number-large" style={{ color }}>{aqi}</div>
          <div className="aqi-category-text" style={{ color }}>{category}</div>
        </div>

        <div className="aqi-gauge-container-v2">
          <svg className="aqi-gauge" width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={color} 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={animated ? strokeDashoffset : strokeDasharray}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="aqi-leaf-icon" style={{ opacity: animated ? 1 : 0, transform: animated ? 'scale(1)' : 'scale(0.5)', transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <Leaf size={32} color={color} />
          </div>
        </div>
      </div>
      
      <p className="aqi-description text-muted">
        {text}
      </p>
    </div>
  );
};

export default AQICard;
