import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Wind, 
  CloudSun, 
  Map,
  History, 
  HeartPulse, 
  Bell,
  BarChart2,
  BrainCircuit,
  Settings,
  MapPin,
  RefreshCw,
  Leaf
} from 'lucide-react';
import { CityContext } from '../context/CityContext';
import './Sidebar.css';

const Sidebar = () => {
  const { city } = useContext(CityContext);

  const menuItems = [
    { icon: <Home size={18} />, label: 'Overview', path: '/' },
    { icon: <BarChart2 size={18} />, label: 'Analytics', path: '/analytics' },
    { icon: <BrainCircuit size={18} />, label: 'AI Insights', path: '/ai-insights' },
    { icon: <Wind size={18} />, label: 'Air Quality', path: '/air-quality' },
    { icon: <CloudSun size={18} />, label: 'Weather', path: '/weather' },
    { icon: <Map size={18} />, label: 'Map View', path: '/map' },
    { icon: <History size={18} />, label: 'History', path: '/history' },
    { icon: <HeartPulse size={18} />, label: 'Health Advice', path: '/health' },
    { icon: <Bell size={18} />, label: 'Alerts', path: '/alerts' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
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
            <li key={index} className="nav-item-container">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', width: '100%', gap: '1rem', color: 'inherit' }}
              >
                <div className="nav-icon">{item.icon}</div>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-widget">
          <MapPin size={18} className="widget-icon text-muted" />
          <div className="widget-info">
            <strong style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{city}</strong>
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
