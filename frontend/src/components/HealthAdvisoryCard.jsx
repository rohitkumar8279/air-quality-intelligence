import React from 'react';
import { ShieldCheck, UserCheck, Wind, PlusCircle } from 'lucide-react';
import './HealthAdvisoryCard.css';

const HealthAdvisoryCard = ({ aqi }) => {
  return (
    <div className="card health-card">
      <div className="card-header" style={{ marginBottom: '0.75rem' }}>
        <h2 className="card-title">
          <PlusCircle size={18} color="var(--accent-primary)" />
          Health Advice
        </h2>
      </div>
      
      <div className="health-main-text">
        <p className="health-status-green">Enjoy outdoor activities.</p>
        <p className="health-status-green">Air quality is satisfactory.</p>
      </div>

      <div className="health-tips-list">
        <div className="health-tip">
          <UserCheck size={16} className="tip-icon" />
          <span>Suitable for outdoor sports</span>
        </div>
        <div className="health-tip">
          <UserCheck size={16} className="tip-icon" />
          <span>Good time for a walk or run</span>
        </div>
        <div className="health-tip">
          <Wind size={16} className="tip-icon" />
          <span>Open windows for fresh air</span>
        </div>
      </div>
    </div>
  );
};

export default HealthAdvisoryCard;
