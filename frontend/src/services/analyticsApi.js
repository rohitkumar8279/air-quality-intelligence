import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

/**
 * Fetch current AQI data
 */
export const getCurrentData = async (city = "Delhi") => {
  try {
    const response = await api.get(`/current?city=${encodeURIComponent(city)}`);
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
  try {
    let url = `/history?skip=${skip}&limit=${limit}&city=${encodeURIComponent(city)}`;
    if (start_date && end_date) {
      url += `&start_date=${start_date}&end_date=${end_date}`;
    }

    const response = await api.get(url);
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
