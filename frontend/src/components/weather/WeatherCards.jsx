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

const WeatherDashboardCards = ({ currentData, advancedData }) => {
  if (!currentData) return null;

  const temp = currentData.temperature ? Math.round(currentData.temperature) : '--';
  const humidity = currentData.humidity ? Math.round(currentData.humidity) : '--';
  const wind = currentData.wind_speed ? currentData.wind_speed.toFixed(1) : '--';

  // Advanced Data Fallbacks
  const feelsLike = advancedData?.feels_like !== undefined && advancedData?.feels_like !== null ? Math.round(advancedData.feels_like) : '--';
  const pressure = advancedData?.pressure !== undefined && advancedData?.pressure !== null ? Math.round(advancedData.pressure) : '--';
  const visibility = advancedData?.visibility !== undefined && advancedData?.visibility !== null ? advancedData.visibility : '--';
  const uvIndex = advancedData?.uv_index !== undefined && advancedData?.uv_index !== null ? Math.round(advancedData.uv_index) : '--';
  const cloudCover = advancedData?.cloud_cover !== undefined && advancedData?.cloud_cover !== null ? advancedData.cloud_cover : '--';
  const rainChance = advancedData?.rain_chance !== undefined && advancedData?.rain_chance !== null ? advancedData.rain_chance : '--';
  const windDirection = advancedData?.wind_direction !== undefined && advancedData?.wind_direction !== null ? `${advancedData.wind_direction}°` : '--';

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
      <WeatherCard title="Temperature" value={temp} unit="°C" icon={Thermometer} delay={1} subtitle={`Feels like ${feelsLike}°C`} />
      <WeatherCard title="Humidity" value={humidity} unit="%" icon={Droplets} delay={2} subtitle={`Actual relative humidity`} />
      <WeatherCard title="Wind Speed" value={wind} unit="km/h" icon={Wind} delay={3} subtitle={`Direction: ${windDirection}`} />
      <WeatherCard title="Pressure" value={pressure} unit="hPa" icon={Gauge} delay={4} subtitle="Surface Level" />
      <WeatherCard title="Visibility" value={visibility} unit="km" icon={Eye} delay={5} subtitle="Current visibility" />
      <WeatherCard title="UV Index" value={uvIndex} unit="" icon={Sun} delay={6} subtitle={uvIndex !== '--' && uvIndex > 5 ? "Use sunscreen" : "Low risk"} />
      <WeatherCard title="Cloud Cover" value={cloudCover} unit="%" icon={Cloud} delay={7} subtitle="Sky coverage" />
      <WeatherCard title="Rain Chance" value={rainChance} unit="%" icon={CloudRain} delay={8} subtitle={rainChance !== '--' && rainChance > 20 ? "Possible rain" : "Unlikely"} />
    </div>
  );
};

export default WeatherDashboardCards;
