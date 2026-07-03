import React, { useState, useEffect, useContext } from 'react';
import { CityContext } from '../context/CityContext';
import { Sun, Droplets, Wind, Leaf, Compass } from 'lucide-react';
import AQICard from '../components/AQICard';
import PollutantsCard from '../components/PollutantsCard';
import MapCard from '../components/MapCard';
import ForecastCard from '../components/ForecastCard';
import HealthAdvisoryCard from '../components/HealthAdvisoryCard';
import AQITrendCard from '../components/AQITrendCard';
import PredictionCard from '../components/PredictionCard';
import AQIWatchlist from '../components/AQIWatchlist';
import { fetchCurrentData } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { city } = useContext(CityContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const responseData = await fetchCurrentData(city);
        setData(responseData);
        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Failed to connect to the API server.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  if (loading && !data) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="card">
          <h2 style={{color: 'var(--status-very-poor)'}}>Connection Error</h2>
          <p className="text-muted" style={{marginTop: '0.5rem'}}>{error}</p>
          <button className="map-btn" style={{marginTop: '1.5rem', width: 'auto', padding: '0 1.5rem'}} onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="dashboard-container">
      {/* Background Image Header Section */}
      <div className="dashboard-header-bg">
        <div className="header-overlay"></div>
      </div>

      <div className="dashboard-content animate-fade-in">
        
        {/* Top Hero Banner */}
        <div className="hero-banner">
          <div className="hero-left">
            <p className="hero-greeting">Good Evening, Rohit 👋</p>
            <h1 className="hero-main-title">Live Air Quality</h1>
            <p className="hero-sub">Real-time AI Powered Air Quality Intelligence Platform</p>
            
            <div className="weather-cards-row">
              <div className="w-card">
                <Sun size={24} color="#FBBF24" />
                <div className="w-data">
                  <strong>{data.temperature !== null && data.temperature !== undefined ? `${data.temperature}°C` : '--'}</strong>
                  <span>Clear Sky</span>
                </div>
              </div>
              <div className="w-card">
                <Droplets size={24} color="var(--accent-cyan)" />
                <div className="w-data">
                  <strong>{data.humidity !== null && data.humidity !== undefined ? `${data.humidity}%` : '--'}</strong>
                  <span>Humidity</span>
                </div>
              </div>
              <div className="w-card">
                <Wind size={24} color="var(--accent-cyan)" />
                <div className="w-data">
                  <strong>{data.wind_speed !== null && data.wind_speed !== undefined ? `${data.wind_speed} km/h` : '--'}</strong>
                  <span>Wind Speed</span>
                </div>
              </div>
              <div className="w-card">
                <Compass size={24} color="var(--text-secondary)" />
                <div className="w-data">
                  <strong>--</strong>
                  <span>Wind Direction</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="hero-health-card">
              <div className="hh-header">
                <div className="hh-icon-wrap">
                  <Leaf size={20} color="var(--status-good)" />
                </div>
                <div className="hh-text">
                  <h3>Breathe Safe, Live Healthy</h3>
                  <p>Stay informed. Stay protected.</p>
                </div>
              </div>
              <div className="hh-sparkline">
                <svg viewBox="0 0 300 50" preserveAspectRatio="none" className="sparkline-svg">
                  <path 
                    d="M 0 40 Q 20 30, 40 40 T 80 45 T 120 40 T 160 45 T 200 40 T 240 30 L 280 10 L 280 10" 
                    fill="none" 
                    stroke="var(--status-good)" 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="280" cy="10" r="4" fill="var(--status-good)" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Top Cards Row */}
        <div className="grid-row-3">
          <AQICard 
            aqi={data.aqi} 
            pm25={data.pm25} 
            pm10={data.pm10} 
            no2={data.no2} 
          />
          <PollutantsCard 
            pm25={data.pm25} 
            pm10={data.pm10} 
            no2={data.no2} 
          />
          <MapCard aqi={data.aqi} />
        </div>

        <AQIWatchlist />

        {/* Bottom Cards Row (Now starting with PredictionCard) */}
        <div className="grid-row-3" style={{marginTop: '1.5rem'}}>
          <PredictionCard />
          <ForecastCard />
          <HealthAdvisoryCard aqi={data.aqi} />
        </div>

        <div className="grid-row-3" style={{marginTop: '1.5rem'}}>
          <AQITrendCard />
        </div>

        {/* Bottom Banner */}
        <div className="bottom-banner card mt-6">
          <div className="banner-icon-bg">
            <Leaf size={24} color="var(--accent-primary)" />
          </div>
          <div className="banner-text">
            <h3>Stay Informed, Stay Healthy</h3>
            <p className="text-muted">Enable notifications to receive air quality alerts and health tips.</p>
          </div>
          <div className="banner-actions">
            <button className="btn-primary">Enable Alerts</button>
            <button className="btn-close">×</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
