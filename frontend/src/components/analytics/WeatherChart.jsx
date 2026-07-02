import React, { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const WeatherChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter(item => item.temperature !== null && item.aqi !== null)
      .map(item => ({
        temp: item.temperature,
        aqi: Math.round(item.aqi),
      }));
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Weather Correlation</p>
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--accent-purple)' }}>Temp: {payload[0].value}°C</p>
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--accent-cyan)' }}>AQI: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No weather correlation data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
        <XAxis 
          type="number" 
          dataKey="temp" 
          name="Temperature" 
          unit="°C" 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={false}
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <YAxis 
          type="number" 
          dataKey="aqi" 
          name="AQI" 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'var(--text-secondary)' }} content={<CustomTooltip />} />
        <Scatter name="Correlation" data={chartData} fill="var(--accent-cyan)" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default WeatherChart;
