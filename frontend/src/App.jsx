import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Wind, Droplets, Thermometer, MapPin, MessageSquare, AlertTriangle, ShieldAlert } from 'lucide-react';
import L from 'leaflet';
import './index.css';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE = 'http://localhost:8000/api';
const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai'];

function App() {
  const [city, setCity] = useState('Delhi');
  const [currentAqi, setCurrentAqi] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: 'Hello! I am your AI Air Quality Assistant. Ask me anything about the pollution levels or health tips.' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [city]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [currRes, histRes, foreRes, advRes] = await Promise.all([
        axios.get(`${API_BASE}/current/${city}`),
        axios.get(`${API_BASE}/history/${city}`),
        axios.get(`${API_BASE}/forecast/${city}`),
        axios.get(`${API_BASE}/advisory/${city}`)
      ]);
      
      setCurrentAqi(currRes.data);
      // History comes sorted by desc timestamp, we need asc for chart
      setHistory(histRes.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      setForecast(foreRes.data);
      setAdvisory(advRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    
    try {
      const res = await axios.post(`${API_BASE}/chat`, { message: userMsg, city });
      setChatHistory(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the AI brain.' }]);
    }
  };

  const getAqiClass = (aqi) => {
    if (aqi <= 50) return 'aqi-good bg-aqi-good';
    if (aqi <= 100) return 'aqi-moderate bg-aqi-moderate';
    if (aqi <= 200) return 'aqi-poor bg-aqi-poor';
    return 'aqi-severe bg-aqi-severe';
  };

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 200) return '#f97316';
    return '#ef4444';
  };

  const mapCoords = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bengaluru': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707]
  };

  if (loading && !currentAqi) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Intelligence...</h2></div>;
  }

  const chartData = [...history.map(h => ({
    time: new Date(h.timestamp).toLocaleDateString(),
    aqi: h.aqi,
    type: 'Historical'
  }))];
  if (forecast) {
    chartData.push({
      time: 'Tomorrow',
      aqi: forecast.predicted_aqi,
      type: 'Forecast'
    });
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wind color="#3b82f6" /> AirOS
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Urban Air Quality Intelligence</p>
        </div>

        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Select City</label>
          <select 
            className="city-selector" 
            style={{ width: '100%' }}
            value={city} 
            onChange={(e) => setCity(e.target.value)}
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
          <a href="#" className="nav-link active"><MapPin size={18}/> Dashboard</a>
          <a href="#" className="nav-link"><AlertTriangle size={18}/> Advisories</a>
          <a href="#" className="nav-link"><MessageSquare size={18}/> AI Assistant</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>{city} Overview</h1>
          <div style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Main AQI Widget */}
          <div className="glass-panel col-span-4 aqi-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className={`aqi-status ${getAqiClass(currentAqi?.aqi)}`} style={{ position: 'absolute', top: '16px', right: '16px' }}>
              {advisory?.aqi_level || 'Unknown'}
            </div>
            <div className="aqi-label">Current AQI</div>
            <div className={`aqi-value ${getAqiClass(currentAqi?.aqi).split(' ')[0]}`}>
              {currentAqi?.aqi.toFixed(0) || '--'}
            </div>
            
            <div className="stat-grid" style={{ width: '100%', marginTop: '24px' }}>
              <div className="stat-box">
                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Thermometer size={14}/> Temp</div>
                <div className="stat-value">{currentAqi?.temperature?.toFixed(1) || '--'}°C</div>
              </div>
              <div className="stat-box">
                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wind size={14}/> Wind</div>
                <div className="stat-value">{currentAqi?.wind_speed?.toFixed(1) || '--'} km/h</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">PM2.5</div>
                <div className="stat-value" style={{ fontSize: '18px' }}>{currentAqi?.pm25?.toFixed(1) || '--'} µg/m³</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">PM10</div>
                <div className="stat-value" style={{ fontSize: '18px' }}>{currentAqi?.pm10?.toFixed(1) || '--'} µg/m³</div>
              </div>
            </div>
          </div>

          {/* AI Forecast & History Chart */}
          <div className="glass-panel col-span-8">
            <h3 style={{ marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AI Predictive Forecast
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(11, 15, 25, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                  <Line type="monotone" dataKey="aqi" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {forecast && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <strong>AI Prediction:</strong> Tomorrow's AQI is expected to be around <span style={{ color: getAqiColor(forecast.predicted_aqi), fontWeight: 'bold' }}>{forecast.predicted_aqi.toFixed(0)}</span>.
              </div>
            )}
          </div>

          {/* Map */}
          <div className="glass-panel col-span-6" style={{ height: '400px', padding: '16px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Geospatial Heatmap</h3>
            <MapContainer center={mapCoords[city] || [28.6139, 77.2090]} zoom={10} style={{ height: 'calc(100% - 32px)', width: '100%', borderRadius: '8px' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
              />
              {currentAqi && (
                <CircleMarker
                  center={mapCoords[city]}
                  radius={40}
                  pathOptions={{ 
                    color: getAqiColor(currentAqi.aqi), 
                    fillColor: getAqiColor(currentAqi.aqi), 
                    fillOpacity: 0.4,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div style={{ color: '#333' }}>
                      <strong>{city}</strong><br/>
                      AQI: {currentAqi.aqi.toFixed(0)}<br/>
                      PM2.5: {currentAqi.pm25.toFixed(0)}
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>

          {/* Health Advisory & Chat */}
          <div className="col-span-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Advisory */}
            <div className="glass-panel" style={{ borderColor: 'var(--warning-color)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-color)', marginBottom: '12px' }}>
                <ShieldAlert size={20} /> Health Risk Advisory
              </h3>
              <p style={{ lineHeight: '1.6' }}>{advisory?.health_advice || 'Loading advisory...'}</p>
            </div>

            {/* Chatbot */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} /> AI Assistant
              </h3>
              
              <div className="chat-container">
                <div className="chat-messages">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`chat-message ${msg.role}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleChat} className="chat-input-wrapper">
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Ask about sources, interventions, etc..." 
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                  />
                  <button type="submit" className="btn">Send</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
