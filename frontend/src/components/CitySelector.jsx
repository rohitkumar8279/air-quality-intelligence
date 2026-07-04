import React, { useContext } from 'react';
import { CityContext } from '../context/CityContext';
import { MapPin, ChevronDown } from 'lucide-react';

const CitySelector = () => {
  const { city, setCity, availableCities } = useContext(CityContext);

  return (
    <div className="location-pill" style={{ position: 'relative' }}>
      <MapPin size={16} className="location-icon" />
      
      <select 
        value={city} 
        onChange={(e) => setCity(e.target.value)}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          outline: 'none',
          paddingRight: '1rem' // space for chevron
        }}
      >
        {availableCities.map(c => (
          <option key={c} value={c} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            {c}
          </option>
        ))}
      </select>
      
      <ChevronDown size={14} className="text-muted" style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
    </div>
  );
};

export default CitySelector;
