import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector, 
  LineChart, Line, CartesianGrid
} from 'recharts';
import { getFeatureImportance, getPollutionAnalysis } from '../../services/aiApi';
import { BarChart2, PieChart as PieChartIcon } from 'lucide-react';

const cardStyle = {
  background: 'var(--bg-card)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--border-light)',
  borderRadius: '16px',
  padding: '1.5rem',
  color: 'var(--text-primary)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  height: '100%',
  boxShadow: 'var(--shadow-soft)'
};

const Header = ({ icon: Icon, title, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>
    <Icon size={20} />
    {title}
  </div>
);

const SkeletonChart = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '1rem', opacity: 0.5 }}>
    {[40, 70, 45, 90, 60, 30].map((h, i) => (
      <div key={i} style={{ flex: 1, height: `${h}%`, background: 'rgba(255,255,255,0.1)', borderRadius: '4px 4px 0 0', animation: 'pulse 2s infinite' }}></div>
    ))}
  </div>
);

export const FeatureImportanceChart = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    getFeatureImportance().then(res => setData(res.features)).catch(console.error);
  }, []);

  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={BarChart2} title="AI Feature Importance" color="#f59e0b" />
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>How different factors impact the XGBoost prediction model.</p>
      
      {!data ? <SkeletonChart /> : (
        <div style={{ width: '100%', height: 250, marginTop: 'auto' }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={80} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                formatter={(val) => [(val * 100).toFixed(1) + '%', 'Importance']}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]} animationDuration={3000}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#64748b'];

export const PollutionAnalysisCard = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    getPollutionAnalysis().then(setData).catch(console.error);
  }, []);

  return (
    <motion.div style={cardStyle} whileHover={{ y: -2 }}>
      <Header icon={PieChartIcon} title="Pollutant Contribution" color="#10b981" />
      {!data ? <SkeletonChart /> : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Highest: <b style={{ color: '#ef4444' }}>{data.highest_pollutant}</b></span>
            <span>Main Source: <b>{data.main_source}</b></span>
          </div>
          
          <div style={{ width: '100%', height: 200, marginTop: 'auto' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.contributions}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="percentage"
                  animationDuration={3000}
                >
                  {data.contributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => [val + '%', 'Contribution']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
            {data.contributions.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }}></span>
                {c.name}: {c.percentage}%
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const ConfidenceMeter = ({ confidence = 92 }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <motion.div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center' }} whileHover={{ y: -2 }}>
      <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Prediction Confidence</div>
      <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <motion.circle 
            cx="50" cy="50" r={radius} 
            fill="none" 
            stroke="#22c55e" 
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 700 }}>
          {confidence}%
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
        Based on model validation accuracy (R² Score: 0.89)
      </div>
    </motion.div>
  );
};
