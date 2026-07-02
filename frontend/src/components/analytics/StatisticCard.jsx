import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StatisticCard = ({ title, value, unit, trend, isPositive, delay = 0, chartColor }) => {
  const [count, setCount] = useState(0);

  // Simple counter animation effect
  useEffect(() => {
    const target = parseFloat(value) || 0;
    const duration = 1500;
    const steps = 30;
    const stepTime = Math.abs(Math.floor(duration / steps));
    let current = 0;
    
    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);

  const displayValue = count % 1 !== 0 ? count.toFixed(1) : Math.round(count);

  return (
    <motion.div 
      className="card statistic-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{displayValue}</h2>
          {unit && <span className="text-muted" style={{ fontSize: '1rem' }}>{unit}</span>}
        </div>
        
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: isPositive ? 'var(--status-good)' : 'var(--status-very-poor)'
          }}>
            <span style={{ marginRight: '0.5rem', fontWeight: 600 }}>
              {isPositive ? '↓' : '↑'} {trend}%
            </span>
            <span className="text-muted" style={{ color: 'var(--text-secondary)' }}>vs last week</span>
          </div>
        )}
      </div>

      {/* Decorative gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: `radial-gradient(circle, ${chartColor}22 0%, rgba(0,0,0,0) 70%)`,
        transform: 'translate(30%, -30%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      {/* Mini sparkline placeholder */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40px',
        opacity: 0.2,
        background: `linear-gradient(to top, ${chartColor} 0%, rgba(0,0,0,0) 100%)`,
        pointerEvents: 'none'
      }} />
    </motion.div>
  );
};

export default StatisticCard;
