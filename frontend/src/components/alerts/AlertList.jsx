import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, Clock, Trash2, CheckSquare, Sparkles, TrendingUp, TrendingDown, Activity, HeartPulse } from 'lucide-react';
import { CityContext } from '../../context/CityContext';
import { AuthContext } from '../../context/AuthContext';
import { fetchCurrentData } from '../../services/api';
import { getPrediction } from '../../services/predictionApi';
import { getFavoriteCities } from '../../services/authApi';
import { getHistoryData } from '../../services/analyticsApi';
import { generateAlerts } from '../../services/alertEngine';

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

        if (city && !targetCities.includes(city)) {
           targetCities.unshift(city);
        }

        let allGeneratedAlerts = [];

        await Promise.all(targetCities.map(async (targetCity) => {
           let currentData = null;
           let predictionData = null;
           let historyData = [];

           try {
              currentData = await fetchCurrentData(targetCity);
           } catch (e) { /* ignore */ }

           try {
              predictionData = await getPrediction(targetCity);
           } catch (e) { /* ignore */ }

           try {
              // Fetch history for trend analysis
              const historyRes = await getHistoryData({ city: targetCity, limit: 3 });
              if (historyRes && historyRes.records) {
                 historyData = historyRes.records;
              }
           } catch (e) { /* ignore */ }

           // Pass everything to the central rule engine!
           const cityAlerts = generateAlerts(targetCity, currentData, predictionData, historyData);
           allGeneratedAlerts = [...allGeneratedAlerts, ...cityAlerts];
        }));

        if (allGeneratedAlerts.length === 0 && city) {
           const today = new Date().toISOString().split('T')[0];
           allGeneratedAlerts.push({
              id: `system-welcome-${city}-${today}`,
              category: 'System',
              priority: 'Low',
              title: 'System Active',
              description: `Live monitoring active for ${city} and your watchlisted cities. Air quality is currently within normal parameters.`,
              time: new Date().toISOString(),
              read: false,
              city
           });
        }

        // Sort new alerts by priority (High -> Medium -> Low)
        const priorityScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
        allGeneratedAlerts.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

        // Merge with locally stored states (so dismissed alerts stay dismissed)
        const saved = localStorage.getItem('user_alerts_state');
        const alertStates = saved ? JSON.parse(saved) : {};
        
        const mergedAlerts = allGeneratedAlerts.filter(a => {
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
    const interval = setInterval(fetchDynamicAlerts, 5 * 60 * 1000); 
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

  const getStyleProps = (category) => {
    switch(category) {
      case 'Air Quality': 
        return { icon: <Sparkles size={20} color="#8B5CF6" />, bg: 'rgba(139, 92, 246, 0.05)', border: 'rgba(139, 92, 246, 0.2)', glow: '0 0 15px rgba(139, 92, 246, 0.1)', tagBg: 'rgba(139, 92, 246, 0.1)', tagColor: '#8B5CF6' };
      case 'Health': 
        return { icon: <HeartPulse size={20} color="#EF4444" />, bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)', glow: '0 0 15px rgba(239, 68, 68, 0.1)', tagBg: 'rgba(239, 68, 68, 0.1)', tagColor: '#EF4444' };
      case 'Weather': 
        return { icon: <Info size={20} color="#3B82F6" />, bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.2)', glow: '0 0 15px rgba(59, 130, 246, 0.1)', tagBg: 'rgba(59, 130, 246, 0.1)', tagColor: '#3B82F6' };
      case 'Trend': 
        return { icon: <Activity size={20} color="#F97316" />, bg: 'rgba(249, 115, 22, 0.05)', border: 'rgba(249, 115, 22, 0.2)', glow: '0 0 15px rgba(249, 115, 22, 0.1)', tagBg: 'rgba(249, 115, 22, 0.1)', tagColor: '#F97316' };
      case 'System': 
      default: 
        return { icon: <Bell size={20} color="var(--text-secondary)" />, bg: 'var(--bg-main)', border: 'var(--border-light)', glow: 'none', tagBg: 'var(--bg-card)', tagColor: 'var(--text-secondary)' };
    }
  };

  const getPriorityColor = (priority) => {
      if (priority === 'High') return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444' };
      if (priority === 'Medium') return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B' };
      return { bg: 'var(--bg-card)', text: 'var(--text-secondary)' };
  };

  if (loading) {
     return (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
           <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '3px', margin: '0 auto', borderColor: 'var(--accent-primary) transparent transparent transparent' }}></div>
           <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Analyzing Air Quality Data</h3>
           <p className="text-muted" style={{ margin: 0 }}>Running AI engine across your watchlisted cities...</p>
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
            const styleProps = getStyleProps(alert.category);
            const prioProps = getPriorityColor(alert.priority);
            
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: styleProps.tagBg, color: styleProps.tagColor }}>{alert.category}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: prioProps.bg, color: prioProps.text }}>{alert.priority} Priority</span>
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
