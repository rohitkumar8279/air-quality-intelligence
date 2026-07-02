import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', // Pointing to the FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches the current environmental data (AQI, weather, health advisory)
 * from the FastAPI backend.
 * @returns {Promise<Object>} The API response data
 */
export const fetchCurrentData = async (city = "Delhi") => {
  try {
    const response = await api.get(`/current?city=${encodeURIComponent(city)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current data:', error);
    throw error;
  }
};

export default api;
