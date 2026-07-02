import React from 'react';
import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import AlertList from '../components/alerts/AlertList';

const Alerts = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '2rem', maxWidth: '1000px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BellRing color="var(--accent-yellow)" />
          Notification Center
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          Manage your system alerts, warnings, and AI predictions.
        </p>
      </div>

      <AlertList />

    </motion.div>
  );
};

export default Alerts;
