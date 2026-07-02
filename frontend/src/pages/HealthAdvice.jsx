import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import { getCurrentData } from '../services/analyticsApi';

import HealthCards from '../components/health/HealthCards';

const HealthAdvice = () => {
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const curr = await getCurrentData();
        setCurrentData(curr);
      } catch (error) {
        console.error("Failed to load current data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '2rem' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartPulse color="#EF4444" />
          AI Health Advice
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          Personalized health recommendations based on real-time air quality indexing.
        </p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Current City AQI:</span>
        {loading ? (
           <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
        ) : (
           <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(currentData?.aqi) || '--'}</span>
        )}
      </div>

      {!loading && <HealthCards aqi={currentData?.aqi} />}

    </motion.div>
  );
};

export default HealthAdvice;
