import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const HeatmapCard = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No heatmap data available.</div>;
  }

  // Group data by day
  const daysData = {};
  data.forEach(item => {
    const d = new Date(item.timestamp);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!daysData[dateStr]) {
      daysData[dateStr] = [];
    }
    daysData[dateStr].push(item.aqi);
  });

  // Calculate average AQI per day
  const dailyAqi = {};
  Object.keys(daysData).forEach(dateStr => {
    const sum = daysData[dateStr].reduce((a, b) => a + b, 0);
    dailyAqi[dateStr] = Math.round(sum / daysData[dateStr].length);
  });

  // Get last 30 days
  const today = new Date();
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last30Days.push({
      dateStr,
      displayDate: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      aqi: dailyAqi[dateStr] || null
    });
  }

  const getColor = (aqi) => {
    if (aqi === null) return 'var(--border-light)';
    if (aqi <= 50) return 'var(--status-good)';
    if (aqi <= 100) return 'var(--status-moderate)';
    if (aqi <= 200) return 'var(--status-poor)';
    if (aqi <= 300) return 'var(--status-very-poor)';
    return 'var(--status-hazardous)';
  };

  const getCategory = (aqi) => {
    if (aqi === null) return 'No Data';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Hazardous';
  };

  return (
    <div style={{ padding: '1rem', width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '6px' }}>
        {last30Days.map((day, idx) => (
          <div 
            key={idx}
            data-tooltip-id={`heatmap-tooltip-${idx}`}
            style={{
              aspectRatio: '1/1',
              backgroundColor: getColor(day.aqi),
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: day.aqi === null ? 0.3 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ReactTooltip 
              id={`heatmap-tooltip-${idx}`}
              place="top"
              effect="solid"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', zIndex: 1000 }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600 }}>{day.displayDate}</div>
                <div>AQI: {day.aqi !== null ? day.aqi : 'N/A'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{getCategory(day.aqi)}</div>
              </div>
            </ReactTooltip>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', marginTop: '1rem', fontSize: '10px', color: 'var(--text-secondary)' }}>
        <span>Less</span>
        <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--border-light)', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--status-good)', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--status-moderate)', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--status-poor)', borderRadius: '2px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--status-very-poor)', borderRadius: '2px' }}></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapCard;
