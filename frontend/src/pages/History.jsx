import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { CityContext } from '../context/CityContext';
import { getHistoryData } from '../services/analyticsApi';

import HistoryTable from '../components/history/HistoryTable';
import ChartContainer from '../components/analytics/ChartContainer';
import { AQITrendChart } from '../components/air-quality/AirQualityCharts';

const History = () => {
  const { city } = useContext(CityContext);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hist = await getHistoryData({ limit: 500, city });
        setHistoryData(hist.records || []);
      } catch (error) {
        console.error("Failed to load history data", error);
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
      style={{ paddingBottom: '2rem' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database color="var(--accent-purple)" />
          Historical Records
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          Analyze past air quality, weather conditions, and export reports.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <ChartContainer title="Historical AQI Trend" delay={2}>
          <div style={{ height: '250px' }}>
             {loading ? <div className="loader" style={{ margin: 'auto', marginTop: '100px' }}></div> : <AQITrendChart historyData={historyData} />}
          </div>
        </ChartContainer>
      </div>

      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Data Logs</h3>
        {loading ? (
          <div className="card" style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loader"></div>
          </div>
        ) : (
          <HistoryTable data={historyData} />
        )}
      </div>

    </motion.div>
  );
};

export default History;
