import React from 'react';
import { motion } from 'framer-motion';

const ChartContainer = ({ title, children, delay = 0, style }) => {
  return (
    <motion.div 
      className="card chart-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px', ...style }}
    >
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {children}
      </div>
    </motion.div>
  );
};

export default ChartContainer;
