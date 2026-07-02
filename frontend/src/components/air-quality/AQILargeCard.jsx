import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Wind } from 'lucide-react';

const AQILargeCard = ({ currentData }) => {
  if (!currentData) return <div className="card" style={{ minHeight: '300px' }} />;

  const aqi = Math.round(currentData.aqi);
  
  let statusColor = 'var(--status-good)';
  let category = 'Good';
  let message = 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
  
  if (aqi > 50) { statusColor = 'var(--status-moderate)'; category = 'Moderate'; message = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern.'; }
  if (aqi > 100) { statusColor = 'var(--status-poor)'; category = 'Poor'; message = 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'; }
  if (aqi > 200) { statusColor = 'var(--status-very-poor)'; category = 'Very Poor'; message = 'Health alert: everyone may experience more serious health effects.'; }
  if (aqi > 300) { statusColor = 'var(--status-hazardous)'; category = 'Hazardous'; message = 'Health warnings of emergency conditions. The entire population is more likely to be affected.'; }

  const formattedTime = new Date(currentData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem',
        background: `radial-gradient(circle at center, ${statusColor}15 0%, var(--bg-card) 70%)`,
        borderTop: `4px solid ${statusColor}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div className="live-pulse" style={{ backgroundColor: statusColor, boxShadow: `0 0 0 rgba(0,0,0,0)` }}></div>
        <span className="text-muted" style={{ fontSize: '0.875rem' }}>Live • {formattedTime}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        <Wind size={24} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Current AQI</h2>
      </div>

      <div style={{ 
        fontSize: '6rem', 
        fontWeight: 800, 
        lineHeight: 1, 
        color: statusColor,
        textShadow: `0 0 40px ${statusColor}40`
      }}>
        {aqi}
      </div>

      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem 1.5rem',
        borderRadius: '20px',
        backgroundColor: `${statusColor}20`,
        color: statusColor,
        fontWeight: 700,
        fontSize: '1.25rem',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        {category}
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', maxWidth: '80%', lineHeight: 1.6 }}>
        {message}
      </p>
    </motion.div>
  );
};

export default AQILargeCard;
