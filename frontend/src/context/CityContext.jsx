import React, { createContext, useState, useEffect } from 'react';
import { fetchCities } from '../services/api';

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  // Try to load from localStorage first, default to app_settings defaultCity, then Delhi
  const [city, setCity] = useState(() => {
    const selected = localStorage.getItem('selectedCity');
    if (selected) return selected;
    const settings = localStorage.getItem('app_settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        if (parsed.defaultCity) return parsed.defaultCity;
      } catch (e) {}
    }
    return 'Delhi';
  });

  const [availableCities, setAvailableCities] = useState(["Delhi", "Mumbai", "Bengaluru", "Chennai"]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        // Check sessionStorage first — avoid re-fetching on every mount
        const cached = sessionStorage.getItem('availableCities');
        if (cached) {
          const cities = JSON.parse(cached);
          setAvailableCities(cities);
          if (!cities.includes(city)) setCity(cities[0]);
          return;
        }

        const cities = await fetchCities();
        if (cities && cities.length > 0) {
          setAvailableCities(cities);
          sessionStorage.setItem('availableCities', JSON.stringify(cities));
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
