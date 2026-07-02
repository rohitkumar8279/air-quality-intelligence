import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, Clock, Trash2, CheckSquare } from 'lucide-react';

const mockAlerts = [
  { id: 1, type: 'Danger', priority: 'High', title: 'Severe AQI Warning', description: 'AQI has crossed 300 in your primary location. Avoid outdoor activities.', time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false },
  { id: 2, type: 'Weather', priority: 'Medium', title: 'Heavy Rain Expected', description: 'Precipitation chance is 90% for the next 3 hours. Carry an umbrella.', time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), read: false },
  { id: 3, type: 'Prediction', priority: 'Low', title: 'AQI Improvement', description: 'Model predicts AQI will drop to Moderate levels by tomorrow evening.', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
  { id: 4, type: 'System', priority: 'Low', title: 'System Maintenance', description: 'Scheduled maintenance for backend APIs at 2 AM UTC.', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
  { id: 5, type: 'Warning', priority: 'High', title: 'High PM2.5 Levels', description: 'PM2.5 concentration is 4x the WHO safe limit.', time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), read: true }
];

const AlertList = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const saved = localStorage.getItem('user_alerts');
    if (saved) {
      setAlerts(JSON.parse(saved));
    } else {
      setAlerts(mockAlerts);
      localStorage.setItem('user_alerts', JSON.stringify(mockAlerts));
    }
  }, []);

  const saveAlerts = (newAlerts) => {
    setAlerts(newAlerts);
    localStorage.setItem('user_alerts', JSON.stringify(newAlerts));
  };

  const markAsRead = (id) => {
    saveAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    saveAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const deleteAlert = (id) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all alerts?")) {
      saveAlerts([]);
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
      default: return <Bell color="var(--text-secondary)" />;
    }
  };

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
          <button onClick={() => saveAlerts(mockAlerts)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Bell size={16} /> Restore Defaults
          </button>
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
               <p>No alerts to display.</p>
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
                    <Clock size={12} /> {new Date(alert.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
