import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Calendar, Activity, CloudRain, Cpu, AlertTriangle, Info, Server } from 'lucide-react';
import { 
  getAIInsights, 
  getPredictionExplanation, 
  getDailySummary, 
  getHealthAdvice, 
  getWeatherImpact, 
  getModelInfo 
} from '../../services/aiApi';

// Reusable styling for the AI cards to match the existing theme
const cardStyle = {
  background: 'var(--bg-card)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--border-light)',
  borderRadius: '16px',
  padding: '1.5rem',
  color: 'var(--text-primary)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  height: '100%',
  boxShadow: 'var(--shadow-soft)'
};

const Header = ({ icon: Icon, title, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>
    <Icon size={20} />
    {title}
  </div>
);

const Skeleton = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} style={{ 
        height: i === 0 ? '24px' : '16px', 
        width: i === 0 ? '60%' : '100%', 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '4px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
    ))}
  </div>
);

export const AIInsightsCard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { getAIInsights().then(setData).catch(console.error); }, []);
  
  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={Sparkles} title="Intelligent Insights" color="#3b82f6" />
      {!data ? <Skeleton /> : (
        <div>
          <p style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>{data.summary}</p>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem' }}>
            <li>Trend: <span style={{ color: 'var(--text-primary)' }}>{data.trend}</span></li>
            <li>Dominant Pollutant: <span style={{ color: '#ef4444' }}>{data.dominant_pollutant}</span></li>
            <li>Weather Effect: <span style={{ color: 'var(--text-primary)' }}>{data.weather_effect}</span></li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export const PredictionExplanationCard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { getPredictionExplanation().then(setData).catch(console.error); }, []);
  
  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={BrainCircuit} title="Why this prediction?" color="#a855f7" />
      {!data ? <Skeleton /> : (
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-very-poor)', marginBottom: '1rem' }}>
            {Math.round(data.prediction)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Predicted AQI</span>
          </div>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem' }}>
            {data.explanation.map((exp, idx) => (
              <li key={idx}>{exp}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export const DailySummaryCard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { getDailySummary().then(setData).catch(console.error); }, []);
  
  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={Calendar} title="Today's Summary" />
      {!data ? <Skeleton /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Current AQI</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{Math.round(data.current_aqi)}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Predicted AQI</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{Math.round(data.predicted_aqi)}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Risk Level</div>
            <div style={{ fontWeight: 600, color: data.risk === 'Low' ? '#22c55e' : '#ef4444' }}>{data.risk}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Weather</div>
            <div style={{ fontWeight: 600 }}>{data.weather}</div>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Recommendations:</div>
            <ul style={{ paddingLeft: '1.25rem' }}>
              {data.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const HealthRecommendationCard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { getHealthAdvice().then(setData).catch(console.error); }, []);
  
  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={Activity} title="Personalized Health Advice" color="#10b981" />
      {!data ? <Skeleton lines={5} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '200px', paddingRight: '0.5rem' }} className="custom-scrollbar">
          {Object.entries(data).map(([group, advice]) => (
            <div key={group} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{group}</span>
              <span style={{ fontSize: '0.875rem' }}>{advice}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export const WeatherImpactCard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { getWeatherImpact().then(setData).catch(console.error); }, []);
  
  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={CloudRain} title="Weather Impact" color="#06b6d4" />
      {!data ? <Skeleton /> : (
        <ul style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem' }}>
          {data.insights.map((ins, idx) => (
            <li key={idx}>{ins}</li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export const ModelInformationCard = () => {
  const [data, setData] = useState(null);
  useEffect(() => { getModelInfo().then(setData).catch(console.error); }, []);
  
  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={Cpu} title="Model Architecture" color="#f59e0b" />
      {!data ? <Skeleton /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
          <div><span style={{ color: 'var(--text-secondary)' }}>Algorithm:</span><br/><b>{data.algorithm}</b></div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Version:</span><br/><b>{data.version}</b></div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Training Samples:</span><br/><b>{data.training_samples.toLocaleString()}</b></div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Features Used:</span><br/><b>{data.features_used}</b></div>
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Evaluation Metrics:</span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>MAE: <b>{data.evaluation_metrics.MAE}</b></span>
              <span>RMSE: <b>{data.evaluation_metrics.RMSE}</b></span>
              <span>R² Score: <b>{data.evaluation_metrics.R2_Score}</b></span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const AIStatusPanel = () => {
  return (
    <motion.div style={{ ...cardStyle, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }} whileHover={{ y: -2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></div>
        <span style={{ fontWeight: 600 }}>Model Healthy</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Server size={16} color="var(--text-secondary)" />
        <span style={{ fontSize: '0.85rem' }}>Prediction Engine: <span style={{ color: '#22c55e' }}>Running</span></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Info size={16} color="var(--text-secondary)" />
        <span style={{ fontSize: '0.85rem' }}>Database: Connected</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Last Prediction: {new Date().toLocaleTimeString()}
      </div>
    </motion.div>
  );
};
