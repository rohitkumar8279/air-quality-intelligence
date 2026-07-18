import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

const defaultSettings = {
  name: 'Admin User',
  email: 'admin@airquality.ai',
  theme: 'Dark',
  notifications: true,
  predictiveAlerts: true,
  weatherAlerts: true,
  defaultCity: 'Delhi',
  defaultZoom: 11,
  language: 'English',
  units: 'Celsius',
  windUnit: 'km/h'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const loaded = localStorage.getItem('app_settings');
    if (loaded) {
      try {
        return { ...defaultSettings, ...JSON.parse(loaded) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('app_settings', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (settings.theme === 'Dark') {
      root.removeAttribute('data-theme');
    } else if (settings.theme === 'Light') {
      root.setAttribute('data-theme', 'light');
    } else {
      // System Default
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }
    }
  }, [settings.theme]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
