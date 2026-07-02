import React from 'react';
import './PollutantsCard.css';

const PollutantsCard = ({ pm25, pm10, no2 }) => {
  // Use provided data and mock the rest to match mockup
  const pollutants = [
    { name: 'PM2.5', value: pm25 || 58, max: 100, unit: 'µg/m³', color: '#F59E0B' },
    { name: 'PM10', value: pm10 || 96, max: 150, unit: 'µg/m³', color: '#F97316' },
    { name: 'O3', value: 45, max: 100, unit: 'µg/m³', color: '#22C55E' },
    { name: 'NO2', value: no2 || 32, max: 100, unit: 'µg/m³', color: '#22C55E' },
    { name: 'SO2', value: 18, max: 100, unit: 'µg/m³', color: '#22C55E' },
    { name: 'CO', value: 0.6, max: 5, unit: 'mg/m³', color: '#22C55E' },
  ];

  return (
    <div className="card pollutants-card">
      <div className="card-header">
        <h2 className="card-title">Pollutants</h2>
        <a href="#" className="view-details-link">View Details</a>
      </div>
      
      <div className="pollutants-list-v2">
        {pollutants.map((pollutant, idx) => {
          const val = pollutant.value;
          const percentage = Math.min((val / pollutant.max) * 100, 100);
          
          return (
            <div key={idx} className="pollutant-row">
              <span className="pollutant-label-name">
                {pollutant.name === 'O3' ? <span>O<sub>3</sub></span> : 
                 pollutant.name === 'NO2' ? <span>NO<sub>2</sub></span> :
                 pollutant.name === 'SO2' ? <span>SO<sub>2</sub></span> :
                 pollutant.name}
              </span>
              
              <div className="pollutant-bar-bg-v2">
                <div 
                  className="pollutant-bar-fill-v2" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: pollutant.color,
                    boxShadow: `0 0 8px ${pollutant.color}`
                  }}
                ></div>
              </div>

              <div className="pollutant-value-wrapper">
                <span className="pollutant-val-text">{val}</span>
                <span className="pollutant-unit-text">{pollutant.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollutantsCard;
