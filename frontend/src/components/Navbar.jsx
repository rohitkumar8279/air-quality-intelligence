import React from 'react';
import { Sun, Bell, MapPin, ChevronDown, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="location-pill">
          <MapPin size={16} className="location-icon" />
          <span>Delhi, India</span>
          <ChevronDown size={14} className="text-muted" />
        </div>
        
        <div className="live-status-pill">
          <div className="status-dot-green"></div>
          <span>Live Data</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="search-box">
          <Search size={16} className="text-muted" />
          <input type="text" placeholder="Search locations..." className="search-input" />
        </div>

        <div className="navbar-actions">
          <button className="icon-btn">
            <Sun size={18} />
          </button>
          <button className="icon-btn">
            <Bell size={18} />
            <span className="notification-badge">2</span>
          </button>
          <div className="user-avatar">
            RK
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
