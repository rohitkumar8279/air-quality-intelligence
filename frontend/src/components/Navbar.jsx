import React, { useState, useEffect, useContext } from 'react';
import { Sun, Moon, Bell, MapPin, ChevronDown, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CitySelector from './CitySelector';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const [isDark, setIsDark] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="md:hidden icon-btn mr-2" 
          onClick={toggleSidebar}
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
        <CitySelector />
        
        <div className="live-status-pill hidden sm:flex">
          <div className="status-dot-green"></div>
          <span>Live Data</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="search-box hidden md:flex">
          <Search size={16} className="text-muted" />
          <input type="text" placeholder="Search locations..." className="search-input" />
        </div>

        <div className="navbar-actions">
          <button className="icon-btn hidden sm:flex" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn">
            <Bell size={18} />
            <span className="notification-badge">2</span>
          </button>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="user-avatar" style={{ background: 'var(--accent-primary)', color: '#fff', cursor: 'pointer' }}>
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
