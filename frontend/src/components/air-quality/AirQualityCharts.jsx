import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const AQITrendChart = ({ historyData }) => {
  const chartData = useMemo(() => {
    if (!historyData) return [];
    return [...historyData]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(item => ({
        time: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
        AQI: Math.round(item.aqi),
      }));
  }, [historyData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
        <Line type="monotone" dataKey="AQI" stroke="var(--accent-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const PollutantComparisonChart = ({ currentData }) => {
  const chartData = useMemo(() => {
    if (!currentData) return [];
    return [
      { name: 'PM2.5', value: currentData.pm25 || 0, fill: '#EF4444' },
      { name: 'PM10', value: currentData.pm10 || 0, fill: '#F59E0B' },
      { name: 'NO2', value: currentData.no2 || 0, fill: '#3B82F6' },
    ];
  }, [currentData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
