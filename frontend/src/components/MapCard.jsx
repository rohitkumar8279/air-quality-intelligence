import React from 'react';
import './MapCard.css';

const MapCard = ({ aqi }) => {
  const getBubbleColor = (value) => {
    if (value <= 50) return 'var(--status-good)';
    if (value <= 100) return 'var(--status-moderate)';
    if (value <= 200) return 'var(--status-poor)';
    if (value <= 300) return 'var(--status-very-poor)';
    return 'var(--status-hazardous)';
  };

  const bubbleColor = getBubbleColor(aqi || 142);

  return (
    <div className="card map-card">
      <div className="card-header map-header">
        <h2 className="card-title">Air Quality Map</h2>
        <a href="#" className="view-details-link">View Full Map</a>
      </div>
      
      <div className="map-placeholder">
        <div className="map-roads">
          {/* Mock Road network */}
          <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M0 150 Q 100 120, 200 180 T 400 150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <path d="M100 0 Q 120 150, 80 300" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
            <path d="M250 0 Q 280 200, 350 300" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <path d="M300 0 Q 200 100, 150 250" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </svg>
        </div>
        
        {/* Mock City Labels */}
        <div className="city-label" style={{top: '30%', left: '40%'}}>Rohini</div>
        <div className="city-label" style={{top: '40%', left: '55%'}}>Pitampura</div>
        <div className="city-label" style={{top: '55%', left: '20%'}}>Dwarka</div>
        <div className="city-label" style={{top: '75%', left: '35%'}}>Gurugram</div>
        <div className="city-label" style={{top: '75%', left: '80%'}}>Faridabad</div>
        <div className="city-label" style={{top: '60%', left: '85%'}}>Noida</div>

        {/* Central AQI Bubble */}
        <div className="map-bubble-v2" style={{ borderColor: bubbleColor }}>
          <span className="bubble-value-v2">{aqi || 142}</span>
          <span className="bubble-label-v2">AQI</span>
        </div>
        <div className="city-label-main">New Delhi</div>
        
        {/* Map Legend */}
        <div className="map-legend">
          <div className="legend-item"><span className="dot dot-good"></span> Good</div>
          <div className="legend-item"><span className="dot dot-moderate"></span> Moderate</div>
          <div className="legend-item"><span className="dot dot-poor"></span> Unhealthy</div>
          <div className="legend-item"><span className="dot dot-very-poor"></span> Very Unhealthy</div>
          <div className="legend-item"><span className="dot dot-hazardous"></span> Hazardous</div>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
