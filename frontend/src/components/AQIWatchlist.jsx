import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Plus, X, Sun, CloudRain, Wind } from 'lucide-react';
import { getFavoriteCities, addFavoriteCity } from '../services/authApi';
import { motion } from 'framer-motion';
import { CITY_CONFIG } from '../config/cities';
import api from '../services/api';

const mockCityData = {
  'Mumbai': { aqi: 110, temp: 30, condition: 'Clear', trend: 'Stable', prediction: 115 },
  'Bangalore': { aqi: 45, temp: 24, condition: 'Rain', trend: 'Improving', prediction: 40 },
  'Kolkata': { aqi: 180, temp: 32, condition: 'Cloudy', trend: 'Worsening', prediction: 190 },
  'Chennai': { aqi: 65, temp: 34, condition: 'Sunny', trend: 'Stable', prediction: 60 }
};

const WatchlistCard = ({ city }) => {
  const data = mockCityData[city] || { aqi: 142, temp: 28, condition: 'Clear', trend: 'Stable', prediction: 145 };
  
  const getStatusColor = (aqi) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 200) return '#ef4444';
    return '#7f1d1d';
  };

  const color = getStatusColor(data.aqi);

  return (
    <motion.div whileHover={{ y: -2 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem', position: 'relative' }}>
      <button style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        <X size={14} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <MapPin size={16} color="var(--accent-primary)" />
        <span style={{ fontWeight: 600 }}>{city}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{data.aqi}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current AQI</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{data.prediction}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Predicted</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{data.temp}°C {data.condition === 'Rain' ? <CloudRain size={12}/> : <Sun size={12}/>}</span>
        <span style={{ color: data.trend === 'Improving' ? '#22c55e' : data.trend === 'Worsening' ? '#ef4444' : '#f59e0b' }}>{data.trend}</span>
      </div>
    </motion.div>
  );
};

const AQIWatchlist = () => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState('');

  const fetchFavorites = () => {
    if (user) {
      getFavoriteCities().then(data => {
        if (data && data.length > 0) {
          setFavorites(data.map(d => d.city_name));
        } else {
          setFavorites(['Mumbai', 'Bangalore']);
        }
      }).catch(console.error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleAddCity = async () => {
    if (!newCity) return;
    const addedCity = newCity;
    
    // Optimistic UI update
    setFavorites(prev => [...prev, addedCity]);
    setIsAdding(false);
    setNewCity('');

    try {
      await addFavoriteCity(addedCity);
    } catch (err) {
      console.error("Failed to add city to backend", err);
    }
  };

  if (!user) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          My Watchlist
        </h3>
        {isAdding ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select 
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '0.25rem 0.5rem' }}
            >
              <option value="">Select city...</option>
              {Object.keys(CITY_CONFIG).filter(c => !favorites.includes(c)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={handleAddCity} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Add</button>
            <button className="btn-secondary" onClick={() => setIsAdding(false)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Cancel</button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <Plus size={16} /> Add City
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {favorites.map((city, idx) => (
          <WatchlistCard key={idx} city={city} />
        ))}
      </div>
    </div>
  );
};

export default AQIWatchlist;
