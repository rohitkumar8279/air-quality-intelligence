import React from 'react';
import './AQITrendCard.css';

const AQITrendCard = () => {
  return (
    <div className="card trend-card">
      <div className="card-header">
        <h2 className="card-title">AQI Trend <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>(Last 24 Hours)</span></h2>
      </div>
      
      <div className="trend-chart-v2">
        <svg viewBox="0 0 400 180" preserveAspectRatio="none" className="trend-svg">
          <defs>
            <linearGradient id="areaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--status-good)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--status-good)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Y Axis Lines */}
          <path d="M 0 0 L 400 0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <path d="M 0 45 L 400 45" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <path d="M 0 90 L 400 90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <path d="M 0 135 L 400 135" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          
          {/* Filled Area */}
          <path 
            d="M 0 180 L 0 120 Q 50 130, 100 100 T 200 40 T 250 80 T 300 100 T 400 110 L 400 180 Z" 
            fill="url(#areaGlow)"
          />
          
          {/* Solid Line */}
          <path 
            d="M 0 120 Q 50 130, 100 100 T 200 40 T 250 80 T 300 100 T 400 110" 
            fill="none" 
            stroke="var(--status-good)" 
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Active Data Point */}
          <circle cx="200" cy="40" r="4" fill="#fff" />
          <circle cx="200" cy="40" r="16" fill="var(--status-good)" opacity="0.2" />
        </svg>

        {/* Tooltip Over Data Point */}
        <div className="chart-tooltip" style={{ left: '50%', top: '10%' }}>
          <div className="tooltip-time">10:00 AM</div>
          <div className="tooltip-value">
            <span className="dot dot-good"></span> AQI <strong>142</strong>
          </div>
        </div>

        {/* Y Axis Labels */}
        <div className="trend-y-axis">
          <span>200</span>
          <span>150</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        {/* X Axis Labels */}
        <div className="trend-x-axis-v2">
          <span>12 AM</span>
          <span>4 AM</span>
          <span>8 AM</span>
          <span>12 PM</span>
          <span>4 PM</span>
          <span>8 PM</span>
          <span>12 AM</span>
        </div>
      </div>
    </div>
  );
};

export default AQITrendCard;
