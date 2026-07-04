import React, { createContext, useState, useEffect } from 'react';
import { fetchCities } from '../services/api';

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  // Try to load from localStorage first, default to Delhi
  const [city, setCity] = useState(() => {
    return localStorage.getItem('selectedCity') || 'Delhi';
  });

  const [availableCities, setAvailableCities] = useState(["Delhi", "Mumbai", "Bengaluru", "Chennai"]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await fetchCities();
        if (cities && cities.length > 0) {
          setAvailableCities(cities);
          // If the user's city isn't in the list, set it to the first available
          if (!cities.includes(city)) {
            setCity(cities[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic cities", err);
      }
    };
    loadCities();
  }, []);

  // Whenever city changes, persist it to localStorage
  useEffect(() => {
    if (city) {
      localStorage.setItem('selectedCity', city);
    }
  }, [city]);

  return (
    <CityContext.Provider value={{ city, setCity, availableCities }}>
      {children}
    </CityContext.Provider>
  );
};
