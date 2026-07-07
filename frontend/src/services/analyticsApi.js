import api from './api';

// ---------------------------------------------------------------------------
// Simple in-memory TTL cache — avoids redundant fetches within 5 minutes
// ---------------------------------------------------------------------------
const _cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const entry = _cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  return null;
};

const setCache = (key, data) => _cache.set(key, { data, ts: Date.now() });

/**
 * Fetch current AQI data
 */
export const getCurrentData = async (city = "Delhi") => {
  const cacheKey = `current:${city}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get(`/current?city=${encodeURIComponent(city)}`);
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current data for analytics:', error);
    throw error;
  }
};

/**
 * Fetch historical AQI data
 * @param {Object} params - Query parameters (start_date, end_date, skip, limit, city)
 */
export const getHistoryData = async ({ start_date, end_date, skip = 0, limit = 500, city = "Delhi" }) => {
  const cacheKey = `history:${city}:${limit}:${skip}:${start_date ?? ''}:${end_date ?? ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    let url = `/history?skip=${skip}&limit=${limit}&city=${encodeURIComponent(city)}`;
    if (start_date && end_date) {
      url += `&start_date=${start_date}&end_date=${end_date}`;
    }

    const response = await api.get(url);
    setCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data for analytics:', error);
    throw error;
  }
};

/**
 * Fetch predicted AQI data
 */
export const getPredictionData = async (city = "Delhi") => {
  try {
    const response = await api.get(`/predict?city=${encodeURIComponent(city)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction data for analytics:', error);
    throw error;
  }
};

/**
 * Fetch AQI rankings (best and worst areas)
 */
export const getRankings = async () => {
  try {
    const response = await api.get(`/rankings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AQI rankings:', error);
    throw error;
  }
};

/**
 * Fetch advanced live weather data directly from Open-Meteo
 */
export const getAdvancedWeather = async (city = "Delhi") => {
  try {
    const response = await api.get(`/weather/advanced?city=${encodeURIComponent(city)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching advanced weather data:', error);
    throw error;
  }
};
