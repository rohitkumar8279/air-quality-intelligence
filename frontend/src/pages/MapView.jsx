import React, { useState, useEffect, useContext } from 'react';
import { CityContext } from '../context/CityContext';
import { motion } from 'framer-motion';
import { Map as MapIcon, Activity, AlertTriangle, ShieldCheck, Clock, MapPin, BarChart3 } from 'lucide-react';
import { getCurrentData } from '../services/analyticsApi';
import MapComponent from '../components/map/MapComponent';

const SummaryCard = ({ icon: Icon, title, value, subtitle, highlight, highlightColor, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-light)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      boxShadow: 'var(--shadow-soft)'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
      <Icon size={16} /> {title}
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      {value}
    </div>
    {highlight && (
      <div style={{ fontSize: '0.85rem', color: highlightColor, fontWeight: 600 }}>
        {highlight}
      </div>
    )}
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
      {subtitle}
    </div>
  </motion.div>
);

const MapView = () => {
  const { city } = useContext(CityContext);
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCurrentData(city);
        setCurrentData(data);
      } catch (error) {
        console.error("Failed to load map data", error);
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
      style={{ paddingBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapIcon color="var(--accent-primary)" />
            Air Quality Map
          </h1>
          <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Real-time AQI across {city} and surrounding areas
          </p>
        </div>
      </div>

      <div style={{ padding: '0', overflow: 'hidden', borderRadius: '12px' }}>
        {loading ? (
          <div className="loader-container" style={{ height: '600px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
            <div className="loader"></div>
          </div>
        ) : (
          <MapComponent currentData={currentData} />
        )}
      </div>

      {/* Summary Cards Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem' 
      }}>
        <SummaryCard 
          icon={BarChart3} title="City Overview" 
          value="12" subtitle="Active & Live" highlight="Monitoring Stations" highlightColor="#3b82f6" 
          delay={0.3} 
        />
        <SummaryCard 
          icon={Activity} title="Average AQI" 
          value={currentData ? Math.round(currentData.aqi) : "98"} subtitle={`Across ${city}`} highlight="Moderate" highlightColor="#eab308" 
          delay={0.4} 
        />
        <SummaryCard 
          icon={MapPin} title="Best Area" 
          value="48" subtitle="Good" highlight="Green Park" highlightColor="#22c55e" 
          delay={0.5} 
        />
        <SummaryCard 
          icon={AlertTriangle} title="Worst Area" 
          value="189" subtitle="Very Poor" highlight="Anand Vihar" highlightColor="#ef4444" 
          delay={0.6} 
        />
        <SummaryCard 
          icon={ShieldCheck} title="Data Quality" 
          value="98%" subtitle="Data Accuracy" highlight="Excellent" highlightColor="#10b981" 
          delay={0.7} 
        />
        <SummaryCard 
          icon={Clock} title="Updates" 
          value="Real-time" subtitle="Every 5 min" highlight="Auto Refresh" highlightColor="#06b6d4" 
          delay={0.8} 
        />
      </div>
    </motion.div>
  );
};

export default MapView;
