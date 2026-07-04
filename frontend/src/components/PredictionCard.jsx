import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingDown, TrendingUp, Equal, AlertCircle } from 'lucide-react';
import { CityContext } from '../context/CityContext';
import { getPrediction } from '../services/predictionApi';
import './PredictionCard.css';

const getStatusConfig = (status) => {
  switch (status) {
    case 'Improving':
      return {
        color: '#22c55e', // green-500
        bg: 'rgba(34, 197, 94, 0.1)',
        icon: TrendingDown,
        message: 'Air quality expected to improve.'
      };
    case 'Worsening':
      return {
        color: '#ef4444', // red-500
        bg: 'rgba(239, 68, 68, 0.1)',
        icon: TrendingUp,
        message: 'Air quality expected to worsen.'
      };
    case 'Stable':
    default:
      return {
        color: '#3b82f6', // blue-500
        bg: 'rgba(59, 130, 246, 0.1)',
        icon: Equal,
        message: 'Air quality expected to remain stable.'
      };
  }
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Very Poor';
  return 'Severe';
};

const getCategoryColor = (aqi) => {
  if (aqi <= 50) return '#22c55e'; // Green
  if (aqi <= 100) return '#eab308'; // Yellow
  if (aqi <= 200) return '#f97316'; // Orange
  if (aqi <= 300) return '#ef4444'; // Red
  return '#7f1d1d'; // Dark Red/Purple
};

const PredictionCard = () => {
  const { city } = React.useContext(CityContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPrediction(city);
      setData(res);
    } catch (err) {
      if (err.message.includes('404')) {
        setError(`Insufficient historical data for ${city} to generate prediction.`);
      } else {
        setError('Prediction service currently unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      fetchPrediction();
    }
  }, [city]);

  if (loading) {
    return (
      <div className="prediction-card">
        <div className="prediction-header">
          <div className="skeleton skeleton-title"></div>
        </div>
        <div className="prediction-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton skeleton-gauge"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prediction-card">
        <div className="prediction-header">
          <div className="prediction-title">
            <Activity size={20} /> AI Prediction
          </div>
        </div>
        <div className="prediction-error">
          <AlertCircle size={40} color="#ef4444" />
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchPrediction}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { current_aqi, predicted_aqi, status, prediction_time } = data;
  const diff = predicted_aqi - current_aqi;
  const pctChange = current_aqi > 0 ? ((diff / current_aqi) * 100).toFixed(1) : 0;
  
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;
  const category = getAQICategory(predicted_aqi);
  const categoryColor = getCategoryColor(predicted_aqi);

  // Gauge calculations
  const maxAQI = 500;
  const radius = 60; // Increased radius for more room
  const circumference = 2 * Math.PI * radius;
  const fillPct = Math.min(predicted_aqi / maxAQI, 1);
  const dashoffset = circumference - fillPct * circumference;

  const formattedTime = new Date(prediction_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      className="prediction-card"
      style={{ '--status-color': config.color, '--status-bg': config.bg, '--gauge-color': categoryColor }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="prediction-header">
        <div className="prediction-title">
          <Activity size={20} color={config.color} /> AI Prediction
        </div>
        <div className="prediction-time">Updated: {formattedTime}</div>
      </div>

      <div className="prediction-content">
        <div className="prediction-gauge-container">
          <svg className="gauge-svg" viewBox="0 0 140 140">
            <circle className="gauge-bg" cx="70" cy="70" r={radius} />
            <motion.circle 
              className="gauge-fill" 
              cx="70" cy="70" r={radius}
              style={{ stroke: 'var(--gauge-color)' }}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeDasharray={circumference}
            />
          </svg>
          <div className="gauge-text">
            <motion.div 
              className="gauge-value"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(predicted_aqi)}
            </motion.div>
            <div className="gauge-label" style={{ color: categoryColor }}>{category}</div>
          </div>
        </div>

        <div className="prediction-details">
          <motion.div 
            className="status-badge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatusIcon size={18} />
            {status}
          </motion.div>
          <motion.p 
            className="status-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {config.message}
          </motion.p>
        </div>
      </div>

      <motion.div 
        className="prediction-trend"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="trend-header">
          <span>Trend Analysis</span>
          <span>Next 24h</span>
        </div>
        <div className="trend-values">
          <div className="trend-current">
            <span className="trend-val">{current_aqi.toFixed(0)}</span>
            <span className="trend-label">Current</span>
          </div>
          <div className="trend-diff">
            <span className="diff-val">{diff > 0 ? '+' : ''}{diff.toFixed(0)}</span>
            <span className="diff-pct">{pctChange}%</span>
          </div>
          <div className="trend-predicted">
            <span className="trend-val">{predicted_aqi.toFixed(0)}</span>
            <span className="trend-label">Predicted</span>
          </div>
        </div>
        
        {/* Simple animated trend line (SVG) */}
        <div className="trend-line-container">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
            {/* Start at bottom left if improving (AQI dropping), top left if worsening (AQI rising) */}
            <motion.path 
              d={`M 5 ${current_aqi > predicted_aqi ? 5 : 35} Q 50 20 95 ${current_aqi > predicted_aqi ? 35 : 5}`}
              fill="none" 
              stroke={config.color} 
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <circle cx="5" cy={current_aqi > predicted_aqi ? 5 : 35} r="3" fill="#fff" />
            <circle cx="95" cy={current_aqi > predicted_aqi ? 35 : 5} r="3" fill={config.color} />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PredictionCard;
