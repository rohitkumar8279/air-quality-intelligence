import React from 'react';
import { 
  Home, 
  Wind, 
  CloudSun, 
  Map,
  History, 
  HeartPulse, 
  Bell,
  FileText,
  Settings,
  MapPin,
  RefreshCw,
  Leaf
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { icon: <Home size={18} />, label: 'Overview', active: true },
    { icon: <Wind size={18} />, label: 'Air Quality' },
    { icon: <CloudSun size={18} />, label: 'Weather' },
    { icon: <Map size={18} />, label: 'Map View' },
    { icon: <History size={18} />, label: 'History' },
    { icon: <HeartPulse size={18} />, label: 'Health Advice' },
    { icon: <Bell size={18} />, label: 'Alerts' },
    { icon: <FileText size={18} />, label: 'Reports' },
    { icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Leaf className="brand-icon" size={24} color="var(--accent-primary)" />
        <div className="brand-text">
          <h2>AirIntel</h2>
          <span>Air Quality Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
              <div className="nav-icon">{item.icon}</div>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-widget">
          <MapPin size={18} className="widget-icon text-muted" />
          <div className="widget-info">
            <strong>Delhi, India</strong>
            <span className="text-primary" style={{color: 'var(--accent-primary)', fontSize: '10px'}}>Change Location</span>
          </div>
        </div>
        
        <div className="sidebar-widget">
          <div className="status-dot"></div>
          <div className="widget-info">
            <span className="text-muted" style={{fontSize: '10px'}}>Data Updated</span>
            <strong>Just now</strong>
          </div>
          <RefreshCw size={14} className="widget-icon text-muted" style={{marginLeft: 'auto'}} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
