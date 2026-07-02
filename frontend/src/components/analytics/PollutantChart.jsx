import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const PollutantChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Calculate averages for pollutants
    let pm25Sum = 0, pm10Sum = 0, no2Sum = 0, count = 0;
    
    data.forEach(item => {
      if (item.pm25 !== null) { pm25Sum += item.pm25; count++; }
      if (item.pm10 !== null) { pm10Sum += item.pm10; }
      if (item.no2 !== null) { no2Sum += item.no2; }
    });
    
    if (count === 0) return [];
    
    const avg = (sum) => Math.round(sum / count);
    
    return [
      { name: 'PM2.5', value: avg(pm25Sum), color: '#EF4444' }, // Red
      { name: 'PM10', value: avg(pm10Sum), color: '#F59E0B' },  // Yellow
      { name: 'NO2', value: avg(no2Sum), color: '#3B82F6' },    // Blue
      // If we had SO2, CO, NH3 in schema, we'd add them here
    ];
  }, [data]);

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
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{dataPoint.name} Average</p>
          <p style={{ margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: dataPoint.color }}>
            {dataPoint.value} <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>µg/m³</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No pollutant data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PollutantChart;
