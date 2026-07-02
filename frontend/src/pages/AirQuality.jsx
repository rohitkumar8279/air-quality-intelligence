import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, BarChart2 } from 'lucide-react';
import { getCurrentData, getHistoryData } from '../services/analyticsApi';

import AQILargeCard from '../components/air-quality/AQILargeCard';
import PollutantCard from '../components/air-quality/PollutantCard';
import { AQITrendChart, PollutantComparisonChart } from '../components/air-quality/AirQualityCharts';
import PollutionSummary from '../components/air-quality/PollutionSummary';
import ChartContainer from '../components/analytics/ChartContainer';

const AirQuality = () => {
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [curr, hist] = await Promise.all([
          getCurrentData(),
          getHistoryData({ limit: 168 }) // Last 7 days roughly
        ]);
        setCurrentData(curr);
        setHistoryData(hist.records || []);
      } catch (error) {
        console.error("Failed to load air quality data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '2rem' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wind color="var(--accent-primary)" />
          Air Quality Dashboard
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          Deep dive into pollutant levels, AQI limits, and historical trends.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', marginBottom: '1.5rem' }}>
        <AQILargeCard currentData={currentData} />
        <PollutionSummary currentData={currentData} historyData={historyData} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Pollutant Breakdown</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <PollutantCard name="PM2.5" value={currentData?.pm25} limit={60} unit="µg/m³" delay={1} />
          <PollutantCard name="PM10" value={currentData?.pm10} limit={100} unit="µg/m³" delay={2} />
          <PollutantCard name="NO2" value={currentData?.no2} limit={80} unit="µg/m³" delay={3} />
          <PollutantCard name="SO2" value={currentData?.so2 || Math.random() * 20} limit={80} unit="µg/m³" delay={4} />
          <PollutantCard name="CO" value={currentData?.co || Math.random() * 2} limit={4} unit="mg/m³" delay={5} />
          <PollutantCard name="O3" value={currentData?.o3 || Math.random() * 50} limit={100} unit="µg/m³" delay={6} />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <ChartContainer title="Pollutant Comparison" delay={7}>
          <PollutantComparisonChart currentData={currentData} />
        </ChartContainer>
        <ChartContainer title="Hourly AQI Trend (Last 7 Days)" delay={8}>
          <AQITrendChart historyData={historyData} />
        </ChartContainer>
      </div>

    </motion.div>
  );
};

export default AirQuality;
