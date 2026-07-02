import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import SettingsPanel from '../components/settings/SettingsPanel';

const Settings = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon color="var(--text-secondary)" />
          Application Settings
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          Customize your dashboard preferences, theme, and notifications.
        </p>
      </div>

      <SettingsPanel />

    </motion.div>
  );
};

export default Settings;
