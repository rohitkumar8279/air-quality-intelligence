import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, TrendingUp, ShieldAlert, Activity } from 'lucide-react';

const PollutionSummary = ({ currentData, historyData }) => {
  if (!currentData || !historyData || historyData.length === 0) return null;

  // Calculate highest/lowest from current data
  const pollutants = [
    { name: 'PM2.5', value: currentData.pm25 || 0 },
    { name: 'PM10', value: currentData.pm10 || 0 },
    { name: 'NO2', value: currentData.no2 || 0 }
  ].sort((a, b) => b.value - a.value);
  
  const highest = pollutants[0];
  const lowest = pollutants[pollutants.length - 1];

  const avgAQI = Math.round(historyData.reduce((acc, curr) => acc + curr.aqi, 0) / historyData.length);
  
  let riskLevel = 'Low';
  let riskColor = 'var(--status-good)';
  if (currentData.aqi > 50) { riskLevel = 'Moderate'; riskColor = 'var(--status-moderate)'; }
  if (currentData.aqi > 100) { riskLevel = 'High'; riskColor = 'var(--status-poor)'; }
  if (currentData.aqi > 200) { riskLevel = 'Severe'; riskColor = 'var(--status-hazardous)'; }

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}
    >
      <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldAlert color="var(--accent-primary)" />
        Pollution Summary
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={14} color="var(--status-very-poor)"/> Highest Pollutant</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{highest.name}</div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>{Math.round(highest.value)} µg/m³</div>
        </div>
        
        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingDown size={14} color="var(--status-good)"/> Lowest Pollutant</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{lowest.name}</div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>{Math.round(lowest.value)} µg/m³</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Historical Average AQI</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{avgAQI}</div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-cyan)' }}>
          <Activity size={20} />
        </div>
      </div>

      <div style={{ 
        marginTop: 'auto',
        padding: '1rem',
        borderRadius: '12px',
        backgroundColor: `${riskColor}15`,
        border: `1px solid ${riskColor}30`,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <AlertTriangle color={riskColor} size={28} />
        <div>
          <div style={{ fontSize: '0.75rem', color: riskColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Health Risk</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{riskLevel} Risk</div>
        </div>
      </div>
    </motion.div>
  );
};

export default PollutionSummary;
