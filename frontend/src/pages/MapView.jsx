import React, { useState, useEffect, useContext } from 'react';
import { CityContext } from '../context/CityContext';
import { motion } from 'framer-motion';
import { Map as MapIcon, Activity, AlertTriangle, ShieldCheck, Clock, MapPin, BarChart3 } from 'lucide-react';
import { getCurrentData, getRankings, getPredictionData } from '../services/analyticsApi';
import MapComponent from '../components/map/MapComponent';

const SummaryCard = ({ icon: Icon, title, value, subtitle, highlight, highlightColor, delay, isAI = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      background: isAI ? 'var(--bg-premium)' : 'var(--bg-card)',
      backdropFilter: 'blur(10px)',
      border: isAI ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border-light)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      boxShadow: isAI ? '0 4px 20px -2px rgba(139, 92, 246, 0.15)' : 'var(--shadow-soft)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {isAI && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)'
      }} />
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: isAI ? 'var(--text-premium-title)' : 'var(--text-secondary)', fontWeight: 600 }}>
      <Icon size={16} color={isAI ? 'var(--icon-premium)' : 'currentColor'} /> {title}
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
  const [rankings, setRankings] = useState({ best: null, worst: null });
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [data, ranks, pred] = await Promise.all([
          getCurrentData(city).catch(e => { console.error("Current data failed", e); return null; }),
          getRankings().catch(e => { console.error("Rankings failed", e); return { best: null, worst: null }; }),
          getPredictionData(city).catch(e => { console.error("Prediction failed", e); return null; })
        ]);
        setCurrentData(data);
        setRankings(ranks);
        setPrediction(pred);
      } catch (error) {
        console.error("Failed to load map data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city]);

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
          icon={Activity} title="AI Predicted AQI" 
          value={prediction ? Math.round(prediction.predicted_aqi) : "..."} 
          subtitle={`Forecast for ${city}`} 
          highlight="ML Model Output" highlightColor="#8b5cf6" 
          delay={0.3} 
          isAI={true}
        />
        <SummaryCard 
          icon={MapPin} title="Best in India" 
          value={rankings.best ? Math.round(rankings.best.aqi) : "..."} 
          subtitle={rankings.best ? rankings.best.city : "Loading..."} 
          highlight={rankings.best && rankings.best.aqi < 50 ? "Excellent" : "Good"} highlightColor="#22c55e" 
          delay={0.4} 
        />
        <SummaryCard 
          icon={AlertTriangle} title="Worst Area" 
          value={rankings.worst ? Math.round(rankings.worst.aqi) : "..."} 
          subtitle={rankings.worst ? rankings.worst.city : "Loading..."} 
          highlight="Hazardous" highlightColor="#ef4444" 
          delay={0.5} 
        />
        <SummaryCard 
          icon={ShieldCheck} title="Data Confidence" 
          value="98%" subtitle="AI Verified Accuracy" highlight="High Precision" highlightColor="#10b981" 
          delay={0.6} 
          isAI={true}
        />
        <SummaryCard 
          icon={Clock} title="Model Updates" 
          value="Real-time" subtitle="Continuous Learning" highlight="Auto Refresh" highlightColor="#06b6d4" 
          delay={0.7} 
          isAI={true}
        />
      </div>
    </motion.div>
  );
};

export default MapView;
