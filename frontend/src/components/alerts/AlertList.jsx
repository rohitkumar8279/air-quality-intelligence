import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, Clock, Trash2, CheckSquare } from 'lucide-react';
import { CityContext } from '../../context/CityContext';
import { fetchCurrentData } from '../../services/api';
import { getPrediction } from '../../services/predictionApi';

const AlertList = () => {
  const { city } = useContext(CityContext);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicAlerts = async () => {
      if (!city) return;
      setLoading(true);
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const newAlerts = [];
        
        // Fetch live data
        let currentData = null;
        try {
           currentData = await fetchCurrentData(city);
        } catch (e) {
           console.error("Could not fetch current data for alerts", e);
        }
        
        let predictionData = null;
        try {
           predictionData = await getPrediction(city);
        } catch (e) {
           console.error("Could not fetch prediction for alerts", e);
        }

        // 1. AQI Danger Alert
        if (currentData && currentData.aqi > 200) {
          newAlerts.push({
            id: `danger-aqi-${city}-${today}`,
            type: 'Danger',
            priority: 'High',
            title: `Severe AQI Warning in ${city}`,
            description: `AQI has crossed 200. It is currently at ${Math.round(currentData.aqi)}. Please avoid outdoor activities.`,
            time: new Date().toISOString(),
            read: false
          });
        }
        
        // 2. PM2.5 Warning
        if (currentData && currentData.pm25 > 60) {
          newAlerts.push({
            id: `warning-pm25-${city}-${today}`,
            type: 'Warning',
            priority: 'High',
            title: `High PM2.5 Levels in ${city}`,
            description: `PM2.5 concentration is ${Math.round(currentData.pm25)} µg/m³, exceeding safe limits.`,
            time: new Date().toISOString(),
            read: false
          });
        }

        // 3. High Humidity / Weather Warning
        if (currentData && currentData.humidity > 85) {
          newAlerts.push({
            id: `weather-humidity-${city}-${today}`,
            type: 'Weather',
            priority: 'Medium',
            title: `High Humidity Expected`,
            description: `Humidity is extremely high at ${currentData.humidity}%. Conditions may feel uncomfortable.`,
            time: new Date().toISOString(),
            read: false
          });
        }

        // 4. Prediction Alerts
        if (predictionData) {
          if (predictionData.status === 'Improving') {
            newAlerts.push({
              id: `prediction-improving-${city}-${today}`,
              type: 'Prediction',
              priority: 'Low',
              title: `AQI Improvement Expected`,
              description: `AI models predict air quality in ${city} will improve to ${Math.round(predictionData.predicted_aqi)} soon.`,
              time: new Date().toISOString(),
              read: false
            });
          } else if (predictionData.status === 'Worsening') {
            newAlerts.push({
              id: `prediction-worsening-${city}-${today}`,
              type: 'Warning',
              priority: 'High',
              title: `Deteriorating Air Quality`,
              description: `AI predicts AQI will worsen to ${Math.round(predictionData.predicted_aqi)} in ${city}. Prepare accordingly.`,
              time: new Date().toISOString(),
              read: false
            });
          }
        }
        
        // Add a system welcome alert if nothing else triggers
        if (newAlerts.length === 0) {
           newAlerts.push({
              id: `system-welcome-${city}-${today}`,
              type: 'System',
              priority: 'Low',
              title: 'System Active',
              description: `Live monitoring active for ${city}. Air quality is currently within normal parameters.`,
              time: new Date().toISOString(),
              read: false
           });
        }

        // Merge with locally stored states (so dismissed alerts stay dismissed)
        const saved = localStorage.getItem('user_alerts_state');
        const alertStates = saved ? JSON.parse(saved) : {};
        
        const mergedAlerts = newAlerts.filter(a => {
           // If deleted, remove entirely
           if (alertStates[a.id]?.deleted) return false;
           
           // Apply read state
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
  }, [city]);

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

  const getIcon = (type) => {
    switch(type) {
      case 'Danger': return <XCircle color="#EF4444" />;
      case 'Warning': return <AlertTriangle color="#F59E0B" />;
      case 'System': return <Info color="#3B82F6" />;
      case 'Prediction': return <CheckCircle2 color="#10B981" />;
      case 'Weather': return <Info color="#06b6d4" />;
      default: return <Bell color="var(--text-secondary)" />;
    }
  };

  if (loading) {
     return (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
           <span className="loader" style={{ width: '30px', height: '30px', borderWidth: '3px', margin: '0 auto' }}></span>
           <p className="text-muted" style={{ marginTop: '1rem' }}>Generating live intelligence alerts...</p>
        </div>
     );
  }

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Unread', 'High Priority'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                border: 'none', 
                cursor: 'pointer',
                background: filter === f ? 'var(--accent-primary)' : 'var(--bg-main)',
                color: filter === f ? '#fff' : 'var(--text-primary)',
                fontWeight: filter === f ? 600 : 400
              }}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={markAllRead} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <CheckSquare size={16} /> Mark all read
          </button>
          <button onClick={clearAll} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', color: '#EF4444', cursor: 'pointer' }}>
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        <AnimatePresence>
          {filteredAlerts.length === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
               <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <p>No active alerts for {city}.</p>
             </motion.div>
          )}

          {filteredAlerts.map((alert) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1.25rem', 
                marginBottom: '0.5rem',
                borderRadius: '12px',
                background: alert.read ? 'transparent' : 'var(--bg-main)',
                border: alert.read ? '1px solid transparent' : '1px solid var(--border-light)',
                position: 'relative'
              }}
            >
              <div style={{ paddingTop: '0.25rem' }}>
                {getIcon(alert.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: alert.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{alert.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Clock size={12} /> {new Date(alert.time).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{alert.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>{alert.type}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: alert.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)', color: alert.priority === 'High' ? '#EF4444' : 'var(--text-secondary)' }}>{alert.priority} Priority</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                {!alert.read && (
                  <button onClick={() => markAsRead(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '0.75rem' }} title="Mark as read">
                    <CheckCircle2 size={20} />
                  </button>
                )}
                <button onClick={() => deleteAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.75rem' }} title="Delete">
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertList;
