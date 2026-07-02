import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AQILineChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort chronologically and format for Recharts
    return [...data]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(item => ({
        time: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
        rawDate: new Date(item.timestamp),
        AQI: Math.round(item.aqi),
      }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const aqi = payload[0].value;
      let statusColor = 'var(--status-good)';
      if (aqi > 50) statusColor = 'var(--status-moderate)';
      if (aqi > 100) statusColor = 'var(--status-poor)';
      if (aqi > 200) statusColor = 'var(--status-very-poor)';
      if (aqi > 300) statusColor = 'var(--status-hazardous)';

      return (
        <div className="chart-tooltip" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</p>
          <p style={{ margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }}></span>
            AQI: <span style={{ color: statusColor }}>{aqi}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No historical data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis 
          dataKey="time" 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={false} 
          minTickGap={30}
        />
        <YAxis 
          stroke="var(--text-secondary)" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="AQI" 
          stroke="var(--accent-primary)" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorAqi)" 
          activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent-primary)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AQILineChart;
