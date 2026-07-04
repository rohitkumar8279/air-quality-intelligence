import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, Clock, Trash2, CheckSquare, Sparkles } from 'lucide-react';
import { CityContext } from '../../context/CityContext';
import { AuthContext } from '../../context/AuthContext';
import { fetchCurrentData } from '../../services/api';
import { getPrediction } from '../../services/predictionApi';
import { getFavoriteCities } from '../../services/authApi';

const AlertList = () => {
  const { city } = useContext(CityContext);
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicAlerts = async () => {
      setLoading(true);
      
      try {
        let targetCities = [city];
        if (user && user.name !== 'Guest User') {
           try {
              const favs = await getFavoriteCities();
              if (favs && favs.length > 0) {
                 targetCities = favs.map(f => f.city_name);
              }
           } catch(e) {
              console.error("Failed to fetch favorites for alerts", e);
           }
        }

        // Ensure current city is always included
        if (city && !targetCities.includes(city)) {
           targetCities.unshift(city);
        }

        const today = new Date().toISOString().split('T')[0];
        const newAlerts = [];

        // Fetch data for all target cities in parallel
        await Promise.all(targetCities.map(async (targetCity) => {
           let currentData = null;
           let predictionData = null;

           try {
              currentData = await fetchCurrentData(targetCity);
           } catch (e) { /* ignore */ }

           try {
              predictionData = await getPrediction(targetCity);
           } catch (e) { /* ignore */ }

           // 1. AQI Danger Alert
           if (currentData && currentData.aqi > 200) {
             newAlerts.push({
               id: `danger-aqi-${targetCity}-${today}`,
               type: 'Danger',
               priority: 'High',
               title: `Severe AQI Warning in ${targetCity}`,
               description: `AQI has crossed hazardous levels. It is currently at ${Math.round(currentData.aqi)}. Please avoid outdoor activities.`,
               time: new Date().toISOString(),
               read: false
             });
           }
           
           // 2. PM2.5 Warning
           if (currentData && currentData.pm25 > 60) {
             newAlerts.push({
               id: `warning-pm25-${targetCity}-${today}`,
               type: 'Warning',
               priority: 'High',
               title: `High PM2.5 Levels in ${targetCity}`,
               description: `PM2.5 concentration is ${Math.round(currentData.pm25)} µg/m³, exceeding safe limits.`,
               time: new Date().toISOString(),
               read: false
             });
           }

           // 3. High Humidity / Weather Warning
           if (currentData && currentData.humidity > 85) {
             newAlerts.push({
               id: `weather-humidity-${targetCity}-${today}`,
               type: 'Weather',
               priority: 'Medium',
               title: `High Humidity in ${targetCity}`,
               description: `Humidity is extremely high at ${currentData.humidity}%. Conditions may feel uncomfortable.`,
               time: new Date().toISOString(),
               read: false
             });
           }

           // 4. Prediction Alerts
           if (predictionData) {
             if (predictionData.status === 'Improving') {
               newAlerts.push({
                 id: `prediction-improving-${targetCity}-${today}`,
                 type: 'Prediction',
                 priority: 'Low',
                 title: `AI Forecast: ${targetCity} Improving`,
                 description: `AI models predict air quality in ${targetCity} will improve to ${Math.round(predictionData.predicted_aqi)} soon.`,
                 time: new Date().toISOString(),
                 read: false
               });
             } else if (predictionData.status === 'Worsening') {
               newAlerts.push({
                 id: `prediction-worsening-${targetCity}-${today}`,
                 type: 'Warning',
                 priority: 'High',
                 title: `AI Forecast: ${targetCity} Deteriorating`,
                 description: `AI predicts AQI will worsen to ${Math.round(predictionData.predicted_aqi)} in ${targetCity}. Prepare accordingly.`,
                 time: new Date().toISOString(),
                 read: false
               });
             }
           }
        }));

        // Add a system welcome alert if nothing else triggers
        if (newAlerts.length === 0 && city) {
           newAlerts.push({
              id: `system-welcome-${city}-${today}`,
              type: 'System',
              priority: 'Low',
              title: 'System Active',
              description: `Live monitoring active for ${city} and your watchlisted cities. Air quality is currently within normal parameters.`,
              time: new Date().toISOString(),
              read: false
           });
        }

        // Sort new alerts by priority (High -> Medium -> Low)
        const priorityScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
        newAlerts.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

        // Merge with locally stored states (so dismissed alerts stay dismissed)
        const saved = localStorage.getItem('user_alerts_state');
        const alertStates = saved ? JSON.parse(saved) : {};
        
        const mergedAlerts = newAlerts.filter(a => {
           if (alertStates[a.id]?.deleted) return false;
           if (alertStates[a.id]?.read) {
             a.read = true;
           }
           return true;
        });
        
        setAlerts(mergedAlerts);

      } catch (err) {
        console.error("Error generating dynamic alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicAlerts();
    const interval = setInterval(fetchDynamicAlerts, 5 * 60 * 1000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, [city, user]);

  const updateAlertState = (id, updates) => {
    const saved = localStorage.getItem('user_alerts_state');
    const alertStates = saved ? JSON.parse(saved) : {};
    
    alertStates[id] = { ...alertStates[id], ...updates };
    localStorage.setItem('user_alerts_state', JSON.stringify(alertStates));
    
    if (updates.deleted) {
       setAlerts(alerts.filter(a => a.id !== id));
    } else if (updates.read) {
       setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
    }
  };

  const markAsRead = (id) => updateAlertState(id, { read: true });
  const deleteAlert = (id) => updateAlertState(id, { deleted: true });

  const markAllRead = () => {
    const saved = localStorage.getItem('user_alerts_state');
    const alertStates = saved ? JSON.parse(saved) : {};
    
    const newAlerts = alerts.map(a => {
       alertStates[a.id] = { ...alertStates[a.id], read: true };
       return { ...a, read: true };
    });
    
    localStorage.setItem('user_alerts_state', JSON.stringify(alertStates));
    setAlerts(newAlerts);
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all current alerts?")) {
      const saved = localStorage.getItem('user_alerts_state');
      const alertStates = saved ? JSON.parse(saved) : {};
      
      alerts.forEach(a => {
         alertStates[a.id] = { ...alertStates[a.id], deleted: true };
      });
      
      localStorage.setItem('user_alerts_state', JSON.stringify(alertStates));
      setAlerts([]);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !a.read;
    if (filter === 'High Priority') return a.priority === 'High';
    return true;
  });

  const getStyleProps = (type) => {
    switch(type) {
      case 'Danger': return { icon: <XCircle size={20} color="#EF4444" />, bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)', glow: '0 0 15px rgba(239, 68, 68, 0.1)' };
      case 'Warning': return { icon: <AlertTriangle size={20} color="#F59E0B" />, bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)', glow: '0 0 15px rgba(245, 158, 11, 0.1)' };
      case 'System': return { icon: <Info size={20} color="#3B82F6" />, bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.2)', glow: '0 0 15px rgba(59, 130, 246, 0.1)' };
      case 'Prediction': return { icon: <Sparkles size={20} color="#10B981" />, bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)', glow: '0 0 15px rgba(16, 185, 129, 0.1)' };
      case 'Weather': return { icon: <Info size={20} color="#06b6d4" />, bg: 'rgba(6, 182, 212, 0.05)', border: 'rgba(6, 182, 212, 0.2)', glow: '0 0 15px rgba(6, 182, 212, 0.1)' };
      default: return { icon: <Bell size={20} color="var(--text-secondary)" />, bg: 'var(--bg-main)', border: 'var(--border-light)', glow: 'none' };
    }
  };

  if (loading) {
     return (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
           <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '3px', margin: '0 auto', borderColor: 'var(--accent-primary) transparent transparent transparent' }}></div>
           <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Analyzing Air Quality Data</h3>
           <p className="text-muted" style={{ margin: 0 }}>Gathering live intelligence and running AI predictions across your watchlisted cities...</p>
        </div>
     );
  }

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Unread', 'High Priority'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                padding: '0.5rem 1.25rem', 
                borderRadius: '20px', 
                border: filter === f ? '1px solid var(--accent-primary)' : '1px solid var(--border-light)', 
                cursor: 'pointer',
                background: filter === f ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                color: filter === f ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontWeight: filter === f ? 600 : 500,
                transition: 'all 0.2s ease'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={markAllRead} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <CheckSquare size={16} /> Mark all read
          </button>
          <button onClick={clearAll} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <AnimatePresence>
          {filteredAlerts.length === 0 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <Bell size={40} style={{ opacity: 0.5 }} color="var(--text-muted)" />
               </div>
               <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>You're all caught up!</h3>
               <p style={{ maxWidth: '400px', margin: '0 auto' }}>There are currently no active alerts or AI warnings for your watchlisted cities.</p>
             </motion.div>
          )}

          {filteredAlerts.map((alert) => {
            const styleProps = getStyleProps(alert.type);
            return (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  display: 'flex', 
                  gap: '1.25rem', 
                  padding: '1.25rem', 
                  marginBottom: '1rem',
                  borderRadius: '16px',
                  background: alert.read ? 'transparent' : styleProps.bg,
                  border: alert.read ? '1px solid var(--border-light)' : `1px solid ${styleProps.border}`,
                  boxShadow: alert.read ? 'none' : styleProps.glow,
                  position: 'relative',
                  opacity: alert.read ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                    padding: '0.75rem', 
                    borderRadius: '12px', 
                    background: alert.read ? 'var(--bg-main)' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'fit-content'
                }}>
                  {styleProps.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: alert.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{alert.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', background: 'var(--bg-main)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                      <Clock size={12} /> {new Date(alert.time).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: alert.read ? 'var(--text-muted)' : 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.description}</p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '4px 10px', borderRadius: '20px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>{alert.type}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: alert.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', color: alert.priority === 'High' ? '#EF4444' : 'var(--text-secondary)' }}>{alert.priority} Priority</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  {!alert.read && (
                    <button onClick={() => markAsRead(alert.id)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--accent-primary)', transition: 'all 0.2s' }} title="Mark as read" className="hover-btn">
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button onClick={() => deleteAlert(alert.id)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#EF4444', transition: 'all 0.2s' }} title="Delete" className="hover-btn">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertList;
