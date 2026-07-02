import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';

const HistoryTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Filter Data
  const filteredData = data.filter(item => {
    const dateStr = new Date(item.timestamp).toLocaleDateString();
    return dateStr.includes(searchTerm) || Math.round(item.aqi).toString().includes(searchTerm);
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatus = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'var(--status-good)' };
    if (aqi <= 100) return { label: 'Moderate', color: 'var(--status-moderate)' };
    if (aqi <= 200) return { label: 'Poor', color: 'var(--status-poor)' };
    if (aqi <= 300) return { label: 'Very Poor', color: 'var(--status-very-poor)' };
    return { label: 'Severe', color: 'var(--status-hazardous)' };
  };

  const exportCSV = () => {
    const headers = ['Date', 'AQI', 'PM2.5', 'PM10', 'Temp', 'Humidity', 'Status'];
    const csvData = filteredData.map(item => {
      const status = getStatus(item.aqi).label;
      return [
        new Date(item.timestamp).toLocaleString(),
        Math.round(item.aqi),
        item.pm25?.toFixed(1) || 'N/A',
        item.pm10?.toFixed(1) || 'N/A',
        item.temperature?.toFixed(1) || 'N/A',
        item.humidity?.toFixed(1) || 'N/A',
        status
      ].join(',');
    });
    const blob = new Blob([headers.join(',') + '\n' + csvData.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_aqi_data.csv';
    a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_aqi_data.json';
    a.click();
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search date or AQI..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ 
              background: 'var(--bg-main)', 
              border: '1px solid var(--border-light)', 
              color: 'var(--text-primary)',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              borderRadius: '8px',
              outline: 'none',
              width: '250px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Download size={16} /> CSV
          </button>
          <button onClick={exportJSON} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Download size={16} /> JSON
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date & Time</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>AQI</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>PM2.5</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>PM10</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Temp (°C)</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Humidity (%)</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const status = getStatus(item.aqi);
              return (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>{new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: status.color }}>{Math.round(item.aqi)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{item.pm25?.toFixed(1) || '--'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{item.pm10?.toFixed(1) || '--'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{item.temperature?.toFixed(1) || '--'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{item.humidity?.toFixed(1) || '--'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: `${status.color}15`,
                      color: status.color
                    }}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No historical records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
