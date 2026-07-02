import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line
} from 'recharts';

export const TemperatureTrendChart = ({ historyData }) => {
  const chartData = useMemo(() => {
    if (!historyData) return [];
    return [...historyData]
      .filter(item => item.temperature !== null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(item => ({
        time: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
        temp: Math.round(item.temperature),
      }));
  }, [historyData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
        <Area type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const HumidityWindChart = ({ historyData }) => {
  const chartData = useMemo(() => {
    if (!historyData) return [];
    return [...historyData]
      .filter(item => item.humidity !== null && item.wind_speed !== null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(item => ({
        time: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
        humidity: Math.round(item.humidity),
        wind: item.wind_speed.toFixed(1)
      }));
  }, [historyData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis yAxisId="left" stroke="#06B6D4" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
        <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#06B6D4" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="wind" stroke="#8B5CF6" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
