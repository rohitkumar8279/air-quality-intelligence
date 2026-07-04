import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AQITrendCard.css';

const AQITrendCard = ({ historyData }) => {
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    return [...historyData]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(item => {
        const d = new Date(item.timestamp);
        return {
          time: d.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
          AQI: Math.round(item.aqi),
        };
      });
  }, [historyData]);

  // Determine the gradient color based on the latest AQI value
  const latestAQI = chartData.length > 0 ? chartData[chartData.length - 1].AQI : 50;
  let color = 'var(--status-good)';
  if (latestAQI > 50 && latestAQI <= 100) color = 'var(--status-moderate)';
  else if (latestAQI > 100 && latestAQI <= 200) color = 'var(--status-poor)';
  else if (latestAQI > 200) color = 'var(--status-very-poor)';

  return (
    <div className="card trend-card">
      <div className="card-header">
        <h2 className="card-title">AQI Trend <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>(Last 24 Hours)</span></h2>
      </div>
      
      <div className="trend-chart-v2" style={{ height: '220px', width: '100%', marginTop: '1rem', position: 'relative', left: '-10px' }}>
        {chartData.length === 0 ? (
           <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
             <span className="text-muted" style={{fontSize: '0.9rem'}}>No trend data available for this city</span>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGlowTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px', padding: '10px' }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="AQI" 
                stroke={color} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#areaGlowTrend)" 
                activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AQITrendCard;
