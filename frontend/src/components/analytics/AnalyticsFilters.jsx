import React, { useContext } from 'react';
import { Filter, Search } from 'lucide-react';
import { CityContext } from '../../context/CityContext';

const AnalyticsFilters = ({ filters, setFilters }) => {
  const { availableCities } = useContext(CityContext);

  const handleDateChange = (e) => {
    setFilters({ ...filters, dateRange: e.target.value });
  };

  const handleCityChange = (e) => {
    setFilters({ ...filters, city: e.target.value });
  };
  
  const handleAqiCategoryChange = (e) => {
    setFilters({ ...filters, aqiCategory: e.target.value });
  };

  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '1rem', 
      alignItems: 'center', 
      padding: '1rem', 
      marginBottom: '1.5rem',
      flexDirection: 'row'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600, marginRight: '1rem' }}>
        <Filter size={18} /> Filters
      </div>

      <select 
        value={filters.city} 
        onChange={handleCityChange}
        style={{
          background: 'var(--bg-main)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          padding: '8px 12px',
          borderRadius: '8px',
          outline: 'none',
          cursor: 'pointer',
          minWidth: '150px'
        }}
      >
        {availableCities && availableCities.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select 
        value={filters.dateRange} 
        onChange={handleDateChange}
        style={{
          background: 'var(--bg-main)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          padding: '8px 12px',
          borderRadius: '8px',
          outline: 'none',
          cursor: 'pointer',
          minWidth: '150px'
        }}
      >
        <option value="today">Today</option>
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="90days">Last 90 Days</option>
        <option value="365days">Last 365 Days</option>
        <option value="all">All Time</option>
      </select>
      
      <select 
        value={filters.aqiCategory} 
        onChange={handleAqiCategoryChange}
        style={{
          background: 'var(--bg-main)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          padding: '8px 12px',
          borderRadius: '8px',
          outline: 'none',
          cursor: 'pointer',
          minWidth: '150px'
        }}
      >
        <option value="all">All Categories</option>
        <option value="good">Good (0-50)</option>
        <option value="moderate">Moderate (51-100)</option>
        <option value="poor">Poor (101-200)</option>
        <option value="very_poor">Very Poor (201+)</option>
      </select>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: 'var(--bg-main)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        padding: '0 12px',
        flex: 1,
        minWidth: '200px'
      }}>
        <Search size={16} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search insights..." 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '8px',
            outline: 'none',
            width: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default AnalyticsFilters;
