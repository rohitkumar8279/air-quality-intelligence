import React from 'react';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExportButtons = ({ targetId = 'analytics-content', fileName = 'AirQuality_Analytics' }) => {
  const handleExportPDF = async () => {
    try {
      const element = document.getElementById(targetId);
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  const handleExportCSV = () => {
    // Basic CSV download stub (in a real app, this would use actual data)
    const csvContent = "data:text/csv;charset=utf-8,Date,AQI,PM2.5,PM10\n2023-01-01,150,55,100\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        className="icon-btn" 
        onClick={handleExportCSV}
        title="Export CSV"
        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
      >
        <Share2 size={16} />
        <span style={{ fontSize: '12px' }}>CSV</span>
      </button>
      <button 
        className="icon-btn" 
        onClick={handleExportPDF}
        title="Export PDF"
        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-light)', background: 'var(--accent-primary)', color: '#fff' }}
      >
        <Download size={16} />
        <span style={{ fontSize: '12px' }}>PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
