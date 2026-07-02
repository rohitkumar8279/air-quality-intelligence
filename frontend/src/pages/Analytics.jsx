import React, { useState, useEffect, useMemo, useContext } from 'react';
import { CityContext } from '../context/CityContext';
import { motion } from 'framer-motion';
import { getHistoryData, getCurrentData, getPredictionData } from '../services/analyticsApi';

import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import StatisticCard from '../components/analytics/StatisticCard';
import ChartContainer from '../components/analytics/ChartContainer';
import AQILineChart from '../components/analytics/AQILineChart';
import PollutantChart from '../components/analytics/PollutantChart';
import WeatherChart from '../components/analytics/WeatherChart';
import PredictionChart from '../components/analytics/PredictionChart';
import HeatmapCard from '../components/analytics/HeatmapCard';
import InsightCard from '../components/analytics/InsightCard';
import ExportButtons from '../components/analytics/ExportButtons';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';

const Analytics = () => {
  const { city } = useContext(CityContext);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  
  const [filters, setFilters] = useState({
    dateRange: '30days',
    aqiCategory: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hist, curr, pred] = await Promise.all([
          getHistoryData({ limit: 1000, city }), // Pass city here
          getCurrentData(city),
          getPredictionData(city)
        ]);
        
        setHistoryData(hist.records || []);
        setCurrentData(curr);
        setPredictionData(pred);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [city]);

  // Apply filters using useMemo for performance
  const filteredHistory = useMemo(() => {
    let result = [...historyData];
    
    // Filter by Date Range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let days = 30;
      if (filters.dateRange === 'today') days = 1;
      else if (filters.dateRange === '7days') days = 7;
      else if (filters.dateRange === '90days') days = 90;
      else if (filters.dateRange === '365days') days = 365;
      
      const cutoff = new Date(now.setDate(now.getDate() - days));
      result = result.filter(item => new Date(item.timestamp) >= cutoff);
    }
    
    // Filter by Category
    if (filters.aqiCategory !== 'all') {
      result = result.filter(item => {
        const aqi = item.aqi;
        if (filters.aqiCategory === 'good') return aqi <= 50;
        if (filters.aqiCategory === 'moderate') return aqi > 50 && aqi <= 100;
        if (filters.aqiCategory === 'poor') return aqi > 100 && aqi <= 200;
        if (filters.aqiCategory === 'very_poor') return aqi > 200;
        return true;
      });
    }
    
    return result;
  }, [historyData, filters]);

  // Calculate statistics from filtered data
  const stats = useMemo(() => {
    if (!filteredHistory.length) return { avg: 0, high: 0, low: 0 };
    
    let sum = 0, high = 0, low = Infinity;
    filteredHistory.forEach(item => {
      sum += item.aqi;
      if (item.aqi > high) high = item.aqi;
      if (item.aqi < low) low = item.aqi;
    });
    
    return {
      avg: Math.round(sum / filteredHistory.length),
      high: Math.round(high),
      low: Math.round(low)
    };
  }, [filteredHistory]);

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
      id="analytics-content"
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <ExportButtons targetId="analytics-content" fileName="AirIntel_Analytics_Report" />
      </div>

      <AnalyticsHeader city={city} lastUpdated={currentData?.timestamp} />
      
      <AnalyticsFilters filters={filters} setFilters={setFilters} />

      {/* Top Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatisticCard 
          title="Average AQI" 
          value={stats.avg} 
          trend={11} 
          isPositive={false} 
          delay={1} 
          chartColor="#3B82F6"
        />
        <StatisticCard 
          title="Highest AQI" 
          value={stats.high} 
          delay={2} 
          chartColor="#EF4444"
        />
        <StatisticCard 
          title="Lowest AQI" 
          value={stats.low} 
          delay={3} 
          chartColor="#22C55E"
        />
        <StatisticCard 
          title="Prediction Accuracy" 
          value={94.2} 
          unit="%" 
          trend={2.1} 
          isPositive={true} 
          delay={4} 
          chartColor="#8B5CF6"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ChartContainer title="Historical AQI Trend" delay={5}>
          <AQILineChart data={filteredHistory} />
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Pollutant Breakdown" delay={6}>
          <PollutantChart data={filteredHistory} />
        </ChartContainer>
        
        <ChartContainer title="Weather Correlation" delay={7}>
          <WeatherChart data={filteredHistory} />
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="AQI Forecast" delay={8}>
          <PredictionChart predictionData={predictionData} />
        </ChartContainer>
        
        <ChartContainer title="Monthly Heatmap" delay={9}>
          <HeatmapCard data={historyData} />
        </ChartContainer>
      </div>

      {/* Insights */}
      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        <ChartContainer title="" delay={10}>
          <InsightCard historicalData={filteredHistory} predictionData={predictionData} />
        </ChartContainer>
      </div>
      
    </motion.div>
  );
};

export default Analytics;
