import React from 'react';
import { motion } from 'framer-motion';

const PollutantCard = ({ name, value, limit, unit, delay = 0 }) => {
  const safeValue = value || 0;
  const percentage = Math.min((safeValue / limit) * 100, 100);
  
  let statusColor = 'var(--status-good)';
  if (percentage > 50) statusColor = 'var(--status-moderate)';
  if (percentage > 100) statusColor = 'var(--status-poor)'; // Values can exceed limit, but bar caps at 100%
  if (percentage > 200) statusColor = 'var(--status-very-poor)';

  // Re-calculate visual percentage up to 100% for the bar
  const visualPercentage = Math.min((safeValue / limit) * 100, 100);

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}
      style={{ padding: '1.25rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Safe limit: {limit} {unit}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: statusColor }}>{value ? Math.round(value) : '--'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{unit}</span>
        </div>
      </div>

      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${visualPercentage}%` }}
          transition={{ duration: 1, delay: delay * 0.1 + 0.3 }}
          style={{ height: '100%', backgroundColor: statusColor, borderRadius: '4px' }}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor }}>
          {value ? Math.round((value / limit) * 100) : 0}% of limit
        </span>
      </div>
    </motion.div>
  );
};

export default PollutantCard;
