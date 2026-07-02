import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Activity } from 'lucide-react';

const AnalyticsHeader = ({ city = 'Delhi', lastUpdated }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const displayLastUpdated = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity color="var(--accent-primary)" />
          Performance Analytics
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          Comprehensive air quality intelligence and predictive insights.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '1.5rem',
        background: 'var(--bg-card)',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MapPin size={20} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: '0.75rem' }} className="text-muted">Location</div>
            <div style={{ fontWeight: 600 }}>{city}</div>
          </div>
        </div>

        <div style={{ width: '1px', background: 'var(--border-light)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={20} color="var(--accent-purple)" />
          <div>
            <div style={{ fontSize: '0.75rem' }} className="text-muted">Date</div>
            <div style={{ fontWeight: 600 }}>{formattedDate}</div>
          </div>
        </div>

        <div style={{ width: '1px', background: 'var(--border-light)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={20} color="var(--accent-green)" />
          <div>
            <div style={{ fontSize: '0.75rem' }} className="text-muted">Time</div>
            <div style={{ fontWeight: 600, minWidth: '90px' }}>{formattedTime}</div>
          </div>
        </div>
        
        <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="live-pulse"></div>
          <div>
            <div style={{ fontSize: '0.75rem' }} className="text-muted">Live Status</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Updated {displayLastUpdated}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
