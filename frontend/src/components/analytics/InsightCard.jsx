import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const InsightCard = ({ historicalData, predictionData }) => {
  const generateInsights = () => {
    const insights = [];
    if (!historicalData || historicalData.length < 2) {
      return ["Not enough data to generate insights."];
    }
    
    // Calculate average AQI for today vs previous days (assuming data is sorted)
    // Simplified logic for insight generation based on data trends
    const recent = historicalData.slice(0, Math.min(24, historicalData.length));
    const older = historicalData.slice(Math.min(24, historicalData.length), Math.min(48, historicalData.length));
    
    const avgRecent = recent.reduce((sum, r) => sum + r.aqi, 0) / (recent.length || 1);
    const avgOlder = older.length > 0 ? older.reduce((sum, r) => sum + r.aqi, 0) / (older.length) : avgRecent;
    
    const diffPercent = Math.round(((avgRecent - avgOlder) / avgOlder) * 100);
    
    if (diffPercent > 0) {
      insights.push(`Average AQI increased by ${diffPercent}% compared to the previous period.`);
    } else if (diffPercent < 0) {
      insights.push(`Air quality improved! Average AQI dropped by ${Math.abs(diffPercent)}%.`);
    } else {
      insights.push(`Air quality has remained stable over the recent period.`);
    }
    
    // Pollution insight
    let maxPM25 = 0;
    let maxNO2 = 0;
    recent.forEach(r => {
      if (r.pm25 > maxPM25) maxPM25 = r.pm25;
      if (r.no2 > maxNO2) maxNO2 = r.no2;
    });
    
    if (maxPM25 > maxNO2 * 2) {
      insights.push("PM2.5 continues to be the most prominent pollutant.");
    }
    
    // Prediction Insight
    if (predictionData && predictionData.predicted_aqi) {
      if (predictionData.predicted_aqi > predictionData.current_aqi) {
        insights.push("Forecasts suggest air quality might worsen in the next 24 hours.");
      } else {
        insights.push("Forecasts indicate conditions should remain stable or improve.");
      }
    }
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-purple)' }}>
        <Sparkles size={20} />
        <h4 style={{ margin: 0, fontWeight: 600 }}>AI Insights</h4>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {insights.map((insight, idx) => (
          <motion.li 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.2 }}
            style={{ 
              background: 'rgba(139, 92, 246, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--accent-purple)',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}
          >
            {insight}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default InsightCard;
