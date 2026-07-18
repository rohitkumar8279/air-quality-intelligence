import React, { useState, useEffect, useContext } from 'react';
import { CityContext } from '../../context/CityContext';
import { SettingsContext } from '../../context/SettingsContext';
import { CITY_CONFIG } from '../../config/cities';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Target, Maximize, Map as MapIcon, Layers, Thermometer, Droplets, Wind, RefreshCw, ChevronRight } from 'lucide-react';
import './MapComponent.css'; 

const RecenterAutomatically = ({ lat, lng, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom || map.getZoom(), { animate: true });
    }
  }, [lat, lng, zoom, map]);
  
  // Expose map controls for custom buttons
  useEffect(() => {
    window.customMapControl = {
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      flyTo: (lat, lng, z) => map.flyTo([lat, lng], z || 11)
    };
  }, [map]);

  return null;
};

// Generate realistic data for surrounding areas based on the main city data
const generateRegionalData = (baseData, cityStr) => {
  const baseAqi = baseData?.aqi || 142;
  const baseLat = CITY_CONFIG[cityStr]?.lat || 28.6139;
  const baseLon = CITY_CONFIG[cityStr]?.lon || 77.2090;

  // Generate 10 pseudo-random surrounding points within ~0.3 degrees
  const regions = [
    { name: `Central ${cityStr}`, pos: [baseLat, baseLon], offset: 0 },
    { name: `${cityStr} North`, pos: [baseLat + 0.1, baseLon], offset: -18 },
    { name: `${cityStr} South`, pos: [baseLat - 0.12, baseLon + 0.05], offset: -32 },
    { name: `${cityStr} East`, pos: [baseLat + 0.02, baseLon + 0.15], offset: -9 },
    { name: `${cityStr} West`, pos: [baseLat - 0.05, baseLon - 0.13], offset: -47 },
    { name: `Outer ${cityStr} 1`, pos: [baseLat + 0.15, baseLon - 0.1], offset: -78 },
    { name: `Outer ${cityStr} 2`, pos: [baseLat - 0.18, baseLon + 0.12], offset: -85 },
    { name: `Outer ${cityStr} 3`, pos: [baseLat + 0.2, baseLon + 0.2], offset: +47 },
    { name: `Outer ${cityStr} 4`, pos: [baseLat - 0.2, baseLon - 0.2], offset: -94 },
    { name: `Industrial Zone`, pos: [baseLat + 0.05, baseLon + 0.25], offset: +60 },
  ];

  return regions.map(r => {
    let aqi = Math.max(10, Math.min(500, Math.round(baseAqi + r.offset)));
    // Add some random jitter so it doesn't look completely static across refreshes
    aqi += Math.floor(Math.random() * 10) - 5;
    
    // Scale pollutants roughly based on AQI
    const scale = aqi / baseAqi;
    
    return {
      id: r.name,
      name: r.name,
      pos: r.pos,
      aqi,
      pm25: Math.round((baseData?.pm25 || 148) * scale),
      pm10: Math.round((baseData?.pm10 || 206) * scale),
      no2: Math.round((baseData?.no2 || 32) * scale),
      co: ((baseData?.co || 0.8) * scale).toFixed(1),
      o3: Math.round((baseData?.o3 || 18) * (1 / scale)), // O3 often inverse
      so2: Math.round((baseData?.so2 || 16) * scale),
      temperature: baseData?.temperature || 28,
      humidity: baseData?.humidity || 62,
      wind_speed: baseData?.wind_speed || 12,
      timestamp: baseData?.timestamp || new Date().toISOString()
    };
  });
};

const getCategoryColor = (aqi) => {
  if (aqi <= 50) return '#22c55e'; // Good
  if (aqi <= 100) return '#eab308'; // Moderate
  if (aqi <= 200) return '#f97316'; // Poor
  if (aqi <= 300) return '#ef4444'; // Very Poor
  return '#7f1d1d'; // Severe
};

const getCategoryLabel = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Very Poor';
  return 'Severe';
};

const MapComponent = ({ currentData }) => {
  const { city } = useContext(CityContext);
  const baseLat = CITY_CONFIG[city]?.lat || 28.6139;
  const baseLon = CITY_CONFIG[city]?.lon || 77.2090;

  const [center, setCenter] = useState([baseLat, baseLon]);
  const [activeLayer, setActiveLayer] = useState('map'); // 'map' or 'satellite'
  const [activeFilter, setActiveFilter] = useState('AQI');
  
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    if (currentData) {
      setCenter([baseLat, baseLon]);
      const generated = generateRegionalData(currentData, city);
      setRegions(generated);
      setSelectedRegion(generated[0]);
    }
  }, [currentData, city, baseLat, baseLon]);

  if (!currentData || regions.length === 0) {
    return <div className="loader-container" style={{ height: '600px' }}><div className="loader"></div></div>;
  }

  const { settings } = useContext(SettingsContext);

  const handleZoomIn = () => window.customMapControl?.zoomIn();
  const handleZoomOut = () => window.customMapControl?.zoomOut();
  const handleTarget = () => {
    setCenter([baseLat, baseLon]);
    window.customMapControl?.flyTo(baseLat, baseLon, settings.defaultZoom || 11);
  };

  const createOverviewIcon = (region, isSelected) => {
    const color = getCategoryColor(region.aqi);
    const htmlString = `
      <div class="map-bubble-leaflet ${isSelected ? 'selected-bubble' : ''}" style="border-color: ${color}">
        <span class="bubble-value-v2">${region.aqi}</span>
        <span class="bubble-label-v2">AQI</span>
      </div>
      <div class="city-label-leaflet" style="opacity: ${isSelected ? '1' : '0.7'}">${region.name}</div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: htmlString,
      iconSize: [60, 80],
      iconAnchor: [30, 40],
    });
  };

  return (
    <div className="advanced-map-container">
      
      {/* Top Header Overlay */}
      <div className="map-top-bar">
        <div className="map-toggle-group">
          <button className={`map-toggle-btn ${activeLayer === 'map' ? 'active' : ''}`} onClick={() => setActiveLayer('map')}>Map</button>
          <button className={`map-toggle-btn ${activeLayer === 'satellite' ? 'active' : ''}`} onClick={() => setActiveLayer('satellite')}>Satellite</button>
        </div>
        
        <div className="pollutant-filters">
          {['AQI', 'PM2.5', 'PM10', 'NO₂', 'CO', 'O₃', 'SO₂'].map(f => (
            <button key={f} className={`filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
          <button className="filter-btn" style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={14} /> Heatmap
          </button>
        </div>
      </div>

      {/* Left Zoom Controls */}
      <div className="map-left-controls">
        <button className="map-control-btn" onClick={handleZoomIn} title="Zoom In"><Plus size={18} /></button>
        <button className="map-control-btn" onClick={handleZoomOut} title="Zoom Out"><Minus size={18} /></button>
        <button className="map-control-btn" onClick={handleTarget} style={{ marginTop: '8px' }} title="Recenter"><Target size={18} /></button>
        <button className="map-control-btn" title="Fullscreen"><Maximize size={18} /></button>
      </div>

      <MapContainer 
        center={center} 
        zoom={settings.defaultZoom || 11} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {activeLayer === 'map' ? (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri'
          />
        )}
        <RecenterAutomatically lat={center[0]} lng={center[1]} />
        
        {regions.map((region) => {
          const isSelected = selectedRegion?.id === region.id;
          return (
            <Marker 
              key={region.id} 
              position={region.pos} 
              icon={createOverviewIcon(region, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedRegion(region);
                },
              }}
            />
          );
        })}
      </MapContainer>
      
      {/* Map Legend Overlay */}
      <div className="map-scale-legend">
        <div className="map-scale-title">AQI Scale</div>
        <div className="scale-bars">
          <div className="scale-segment">
            <div className="scale-color-bar" style={{ background: '#22c55e' }}></div>
            <div className="scale-label-top">0-50</div>
            <div className="scale-label-bottom">Good</div>
          </div>
          <div className="scale-segment">
            <div className="scale-color-bar" style={{ background: '#eab308' }}></div>
            <div className="scale-label-top">51-100</div>
            <div className="scale-label-bottom">Moderate</div>
          </div>
          <div className="scale-segment">
            <div className="scale-color-bar" style={{ background: '#f97316' }}></div>
            <div className="scale-label-top">101-200</div>
            <div className="scale-label-bottom">Poor</div>
          </div>
          <div className="scale-segment">
            <div className="scale-color-bar" style={{ background: '#ef4444' }}></div>
            <div className="scale-label-top">201-300</div>
            <div className="scale-label-bottom">Very Poor</div>
          </div>
          <div className="scale-segment">
            <div className="scale-color-bar" style={{ background: '#7f1d1d' }}></div>
            <div className="scale-label-top">301+</div>
            <div className="scale-label-bottom">Severe</div>
          </div>
        </div>
      </div>

      {/* Right Details Sidebar Overlay */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div 
            className="map-details-sidebar"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="details-header">
              <div>
                <h3 className="details-title">{selectedRegion.name}</h3>
                <div className="details-status">
                  <span className="details-status-dot" style={{ background: getCategoryColor(selectedRegion.aqi) }}></span>
                  <span style={{ color: getCategoryColor(selectedRegion.aqi) }}>{getCategoryLabel(selectedRegion.aqi)}</span>
                </div>
              </div>
              <button className="details-close-btn" onClick={() => setSelectedRegion(null)}><X size={20} /></button>
            </div>

            <div className="details-aqi-huge" style={{ '--status-color': getCategoryColor(selectedRegion.aqi) }}>
              {selectedRegion.aqi} <span className="details-aqi-label">AQI</span>
            </div>
            
            <div className="details-updated">
              <RefreshCw size={12} /> Last Updated: Just now
            </div>

            <div className="details-metrics-grid">
              <div className="metric-row">
                <span className="metric-label"><span style={{ color: '#eab308' }}>●</span> PM2.5</span>
                <span className="metric-val">{selectedRegion.pm25} µg/m³</span>
              </div>
              <div className="metric-row">
                <span className="metric-label"><span style={{ color: '#22c55e' }}>●</span> PM10</span>
                <span className="metric-val">{selectedRegion.pm10} µg/m³</span>
              </div>
              <div className="metric-row">
                <span className="metric-label"><span style={{ color: '#3b82f6' }}>●</span> NO₂</span>
                <span className="metric-val">{selectedRegion.no2} µg/m³</span>
              </div>
              <div className="metric-row">
                <span className="metric-label"><span style={{ color: '#a855f7' }}>●</span> CO</span>
                <span className="metric-val">{selectedRegion.co} mg/m³</span>
              </div>
              <div className="metric-row">
                <span className="metric-label"><span style={{ color: '#06b6d4' }}>●</span> O₃</span>
                <span className="metric-val">{selectedRegion.o3} µg/m³</span>
              </div>
              <div className="metric-row">
                <span className="metric-label"><span style={{ color: '#f59e0b' }}>●</span> SO₂</span>
                <span className="metric-val">{selectedRegion.so2} µg/m³</span>
              </div>
              
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>
              
              <div className="metric-row">
                <span className="metric-label"><Thermometer size={16} color="#f97316" /> Temperature</span>
                <span className="metric-val">{Math.round(settings.units === 'Fahrenheit' ? (selectedRegion.temperature * 9/5) + 32 : selectedRegion.temperature)}{settings.units === 'Fahrenheit' ? '°F' : '°C'}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label"><Droplets size={16} color="#3b82f6" /> Humidity</span>
                <span className="metric-val">{Math.round(selectedRegion.humidity)}%</span>
              </div>
              <div className="metric-row">
                <span className="metric-label"><Wind size={16} color="#94a3b8" /> Wind</span>
                <span className="metric-val">{Math.round(selectedRegion.wind_speed)} km/h</span>
              </div>
            </div>

            <div className="details-footer">
              <button className="details-view-btn">
                View Detailed Analytics <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default MapComponent;
