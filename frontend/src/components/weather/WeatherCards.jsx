import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, Gauge, Sun, Cloud, CloudRain, Sunrise, Sunset, Eye } from 'lucide-react';

const WeatherCard = ({ title, value, unit, icon: Icon, delay = 0, subtitle }) => (
  <motion.div 
    className="card"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1, duration: 0.4 }}
    whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}
    style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
  >
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Icon size={24} />
    </div>
    <div>
      <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
        <div className="text-muted" style={{ fontSize: '0.875rem' }}>{unit}</div>
      </div>
      {subtitle && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{subtitle}</div>}
    </div>
  </motion.div>
);

const WeatherDashboardCards = ({ currentData }) => {
  if (!currentData) return null;

  const temp = currentData.temperature ? Math.round(currentData.temperature) : '--';
  const humidity = currentData.humidity ? Math.round(currentData.humidity) : '--';
  const wind = currentData.wind_speed ? currentData.wind_speed.toFixed(1) : '--';

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
      <WeatherCard title="Temperature" value={temp} unit="°C" icon={Thermometer} delay={1} subtitle="Feels like 32°C" />
      <WeatherCard title="Humidity" value={humidity} unit="%" icon={Droplets} delay={2} subtitle="Dew point 21°C" />
      <WeatherCard title="Wind Speed" value={wind} unit="km/h" icon={Wind} delay={3} subtitle="Direction: NE" />
      <WeatherCard title="Pressure" value="1012" unit="hPa" icon={Gauge} delay={4} subtitle="Steady" />
      <WeatherCard title="Visibility" value="8" unit="km" icon={Eye} delay={5} subtitle="Clear" />
      <WeatherCard title="UV Index" value="6" unit="Mod" icon={Sun} delay={6} subtitle="Use sunscreen" />
      <WeatherCard title="Cloud Cover" value="20" unit="%" icon={Cloud} delay={7} subtitle="Partly cloudy" />
      <WeatherCard title="Rain Chance" value="5" unit="%" icon={CloudRain} delay={8} subtitle="Unlikely" />
    </div>
  );
};

export default WeatherDashboardCards;
