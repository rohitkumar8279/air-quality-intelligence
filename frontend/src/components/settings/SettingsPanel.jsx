import React, { useState, useContext } from 'react';
import { User, Moon, BellRing, Map, Globe, ShieldCheck, Database, Cpu, Activity, Save } from 'lucide-react';
import { SettingsContext } from '../../context/SettingsContext';

const SettingsPanel = () => {
  const { settings, updateSettings } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
      
      {/* Profile Settings */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}><User color="var(--accent-primary)" /> Profile Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input type="text" name="name" value={localSettings.name} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" name="email" value={localSettings.email} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}><Globe color="var(--accent-cyan)" /> Localization & Theme</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Theme Preference</label>
            <select name="theme" value={localSettings.theme} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
              <option>Dark</option>
              <option>Light</option>
              <option>System Default</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Temperature</label>
              <select name="units" value={localSettings.units} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                <option>Celsius</option>
                <option>Fahrenheit</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Language</label>
              <select name="language" value={localSettings.language} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}><BellRing color="var(--accent-yellow)" /> Notifications</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" name="notifications" checked={localSettings.notifications} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
            <span>Enable Push Notifications</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" name="predictiveAlerts" checked={localSettings.predictiveAlerts} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
            <span>Predictive AQI Alerts (AI)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" name="weatherAlerts" checked={localSettings.weatherAlerts} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
            <span>Severe Weather Alerts</span>
          </label>
        </div>
      </motion.div>

      {/* Map Settings */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}><Map color="var(--accent-purple)" /> Map Configuration</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Default City</label>
            <input type="text" name="defaultCity" value={localSettings.defaultCity} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Default Zoom Level ({localSettings.defaultZoom})</label>
            <input type="range" name="defaultZoom" min="1" max="18" value={localSettings.defaultZoom} onChange={handleChange} style={{ width: '100%' }} />
          </div>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ gridColumn: '1 / -1' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}><ShieldCheck color="#10B981" /> System Diagnostics</h3>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginTop: '1.5rem', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10B981' }}><Activity size={20} /></div>
            <div>
              <div style={{ fontWeight: 600 }}>API Status</div>
              <div style={{ fontSize: '0.875rem', color: '#10B981' }}>Operational (99.9% Uptime)</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10B981' }}><Database size={20} /></div>
            <div>
              <div style={{ fontWeight: 600 }}>Database (PostgreSQL)</div>
              <div style={{ fontSize: '0.875rem', color: '#10B981' }}>Connected • 42ms ping</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10B981' }}><Cpu size={20} /></div>
            <div>
              <div style={{ fontWeight: 600 }}>ML Model (XGBoost)</div>
              <div style={{ fontSize: '0.875rem', color: '#10B981' }}>Active • v2.4.1</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={saveSettings} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
          <Save size={20} /> {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
      
    </div>
  );
};

export default SettingsPanel;
