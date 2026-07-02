import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CityContext } from '../context/CityContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Activity, Settings, LogOut, FileText, Plus, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const cardStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};

const Profile = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { city } = useContext(CityContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <User color="var(--accent-primary)" size={28} />
        My Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: User Identity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ ...cardStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: 140, height: 140, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', 
              border: '2px solid rgba(34, 197, 94, 0.4)', boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)' 
            }}>
              <span style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{user.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              <Mail size={14} />
              <span style={{ fontSize: '0.9rem' }}>{user.email}</span>
            </div>
            
            <button onClick={() => navigate('/settings')} className="btn-secondary" style={{ width: '100%', marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: '12px' }}>
              <Settings size={18} /> Account Settings
            </button>
            
            <button onClick={handleLogout} style={{ 
              width: '100%', padding: '0.875rem', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', 
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', cursor: 'pointer', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          {/* Quick Stats / Primary City */}
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} /> Primary City Status
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user?.city || city}</div>
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>Poor Air Quality</div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>142</div>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', color: '#3b82f6' }}>
                <Calendar size={28} />
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Member Since</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {new Date(user.joined_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
            
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '16px', color: '#a855f7' }}>
                <Activity size={28} />
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Predictions Viewed</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.prediction_count}</div>
              </div>
            </div>
          </div>
          
          {/* Saved Reports (Engaging Empty State) */}
          <div style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Saved Reports</h3>
            </div>
            
            <div style={{ 
              border: '2px dashed rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '4rem 2rem', 
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(0,0,0,0.1)'
            }}>
              <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <FileText size={40} color="var(--text-secondary)" opacity={0.5} />
              </div>
              <h4 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>No reports saved yet</h4>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
                Generate detailed PDF and CSV analytics reports from the dashboard and save them here for quick access later.
              </p>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }} onClick={() => navigate('/analytics')}>
                <Plus size={18} /> Generate First Report
              </button>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              {/* Vertical Line */}
              <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(255,255,255,0.05)' }}></div>
              
              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <User size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Account created successfully</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Clock size={12} /> {new Date(user.joined_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <Settings size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Default preferences generated</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Clock size={12} /> System Automated
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
