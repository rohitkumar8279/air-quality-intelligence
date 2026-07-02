import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudSun } from 'lucide-react';
import { getCurrentData, getHistoryData } from '../services/analyticsApi';

import WeatherDashboardCards from '../components/weather/WeatherCards';
import { TemperatureTrendChart, HumidityWindChart } from '../components/weather/WeatherCharts';
import ChartContainer from '../components/analytics/ChartContainer';

const Weather = () => {
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [curr, hist] = await Promise.all([
          getCurrentData(),
          getHistoryData({ limit: 168 })
        ]);
        setCurrentData(curr);
        setHistoryData(hist.records || []);
      } catch (error) {
        console.error("Failed to load weather data", error);
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
          <CloudSun color="var(--accent-cyan)" />
          Meteorological Dashboard
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          Comprehensive weather conditions, forecasts, and atmospheric trends.
        </p>
      </div>

      <WeatherDashboardCards currentData={currentData} />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', marginBottom: '1.5rem' }}>
        <ChartContainer title="Temperature Trend (°C)" delay={8}>
          <TemperatureTrendChart historyData={historyData} />
        </ChartContainer>
        
        <ChartContainer title="Humidity (%) vs Wind Speed (km/h)" delay={9}>
          <HumidityWindChart historyData={historyData} />
        </ChartContainer>
      </div>

    </motion.div>
  );
};

export default Weather;
