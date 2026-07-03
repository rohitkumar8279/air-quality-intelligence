import React, { useState, useContext } from 'react';
import { CityContext } from '../context/CityContext';
import { CITY_CONFIG } from '../config/cities';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './MapCard.css';

const MapCard = ({ aqi }) => {
  const { city } = useContext(CityContext);
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const centerPos = CITY_CONFIG[city] ? [CITY_CONFIG[city].lat, CITY_CONFIG[city].lon] : [28.6139, 77.2090];

  const getBubbleColor = (value) => {
    if (value <= 50) return 'var(--status-good)';
    if (value <= 100) return 'var(--status-moderate)';
    if (value <= 200) return 'var(--status-poor)';
    if (value <= 300) return 'var(--status-very-poor)';
    return 'var(--status-hazardous)';
  };

  const createCustomIcon = (value, cityName) => {
    const color = getBubbleColor(value);
    const htmlString = `
      <div class="map-bubble-leaflet" style="border-color: ${color}">
        <span class="bubble-value-v2">${value}</span>
        <span class="bubble-label-v2">AQI</span>
      </div>
      <div class="city-label-leaflet">${cityName}</div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: htmlString,
      iconSize: [60, 80],
      iconAnchor: [30, 40],
    });
  };

  const mainAqi = aqi || 142;

  // Major Indian cities for the "All India" view
  const cities = Object.keys(CITY_CONFIG).map(cityName => ({
    name: cityName,
    pos: [CITY_CONFIG[cityName].lat, CITY_CONFIG[cityName].lon],
    value: cityName === city ? mainAqi : Math.floor(Math.random() * 100) + 40 // Dummy for other cities
  }));

  return (
    <>
      <div className="card map-card">
        <div className="card-header map-header">
          <h2 className="card-title">Air Quality Map</h2>
          <button onClick={() => setIsFullMapOpen(true)} className="view-details-link btn-view-map">View Full Map</button>
        </div>
        
        <div className="map-placeholder">
          <MapContainer 
            key={city} // Force re-render on city change to update center
            center={centerPos} 
            zoom={4.5} 
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ width: '100%', height: '100%', zIndex: 1, background: 'transparent' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <ZoomControl position="topright" />
            
            {cities.map((city, idx) => (
              <Marker key={idx} position={city.pos} icon={createCustomIcon(city.value, city.name)}>
                <Popup>
                  <strong>{city.name}</strong><br/>Air Quality Index: {city.value}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend */}
          <div className="map-legend" style={{ zIndex: 10 }}>
            <div className="legend-item"><span className="dot dot-good"></span> Good</div>
            <div className="legend-item"><span className="dot dot-moderate"></span> Moderate</div>
            <div className="legend-item"><span className="dot dot-poor"></span> Unhealthy</div>
            <div className="legend-item"><span className="dot dot-very-poor"></span> Very Unhealthy</div>
            <div className="legend-item"><span className="dot dot-hazardous"></span> Hazardous</div>
          </div>
        </div>
      </div>

      {isFullMapOpen && (
        <div className="full-map-modal">
          <div className="full-map-content">
            <button className="close-modal-btn" onClick={() => setIsFullMapOpen(false)}>
              <X size={24} />
            </button>
            <MapContainer 
              key={`full-${city}`}
              center={centerPos} 
              zoom={5} 
              style={{ width: '100%', height: '100%', background: 'transparent' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              
              {cities.map((city, idx) => (
                <Marker key={`full-${idx}`} position={city.pos} icon={createCustomIcon(city.value, city.name)}>
                  <Popup>
                    <strong>{city.name}</strong><br/>Air Quality Index: {city.value}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default MapCard;
