import React, { createContext, useState, useEffect } from 'react';

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  // Try to load from localStorage first, default to Delhi
  const [city, setCity] = useState(() => {
    return localStorage.getItem('selectedCity') || 'Delhi';
  });

  // Whenever city changes, persist it to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCity', city);
  }, [city]);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
};
