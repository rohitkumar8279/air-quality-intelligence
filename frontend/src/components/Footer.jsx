import React from 'react';
import { Database, Server, Code2, CloudSnow } from 'lucide-react';
import './Footer.css';

const Footer = ({ timestamp }) => {
  const syncTime = timestamp ? new Date(timestamp).toLocaleTimeString() : 'Just now';

  return (
    <footer className="dashboard-footer animate-fade-in delay-300">
      <div className="footer-left">
        <span className="text-muted text-sm">Data Sources & Tech Stack:</span>
        <div className="tech-stack-icons">
          <div className="tech-badge" title="Open-Meteo API">
            <CloudSnow size={14} /> Open-Meteo
          </div>
          <div className="tech-badge" title="PostgreSQL">
            <Database size={14} /> PostgreSQL
          </div>
          <div className="tech-badge" title="FastAPI">
            <Server size={14} /> FastAPI
          </div>
          <div className="tech-badge" title="React">
            <Code2 size={14} /> React
          </div>
        </div>
      </div>
      <div className="footer-right">
        <span className="sync-status">
          <span className="sync-dot"></span>
          Last Sync: {syncTime}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
