import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

const PredictionChart = ({ predictionData }) => {
  if (!predictionData) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No prediction data available</div>;
  }

  const { current_aqi, predicted_aqi } = predictionData;

  const data = [
    { name: 'Current AQI', value: Math.round(current_aqi), color: 'var(--accent-blue)' },
    { name: 'Predicted AQI (Next 24h)', value: Math.round(predicted_aqi), color: 'var(--accent-purple)' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="chart-tooltip" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{dataPoint.name}</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: dataPoint.color, fontSize: '1.2rem' }}>
            {dataPoint.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }} barSize={30}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
        <XAxis type="number" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" stroke="var(--text-primary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
        
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PredictionChart;
