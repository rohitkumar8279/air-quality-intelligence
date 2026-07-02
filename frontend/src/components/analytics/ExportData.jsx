import React from 'react';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ExportData = () => {
  const handleExportCSV = () => {
    // Generate dummy CSV
    const csv = "Date,AQI,PM2.5,PM10\n2026-07-01,142,55,90\n2026-07-02,130,45,85";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'air_quality_report.csv';
    a.click();
  };

  const handleExportPDF = () => {
    alert("PDF export requires html2canvas/jspdf. Feature mock triggered.");
  };

  return (
    <motion.div whileHover={{ y: -2 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Download size={20} color="var(--accent-primary)" />
        <span style={{ fontWeight: 600 }}>Export Analytics</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleExportCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <FileText size={16} /> CSV
        </button>
        <button onClick={handleExportPDF} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ImageIcon size={16} /> PDF
        </button>
      </div>
    </motion.div>
  );
};

export default ExportData;
