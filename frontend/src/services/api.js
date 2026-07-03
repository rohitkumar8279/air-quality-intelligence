import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', // Pointing to the FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds initial timeout before retry
});

// Add Authorization header to all requests if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for automatic retries (handling Render cold starts)
api.interceptors.response.use(
  (response) => {
    // If a request succeeds after retries, notify the UI
    if (response.config && response.config._retryCount > 0) {
      window.dispatchEvent(new Event('server-awake'));
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // If no config or if we've already retried 4 times (up to ~60s total wait)
    if (!config || (config._retryCount && config._retryCount >= 4)) {
      if (config && config._retryCount >= 4) {
        window.dispatchEvent(new Event('server-awake')); // Hide toast on ultimate failure
      }
      return Promise.reject(error);
    }

    // Check if error is timeout or network/5xx error (Render startup)
    const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500 && error.response.status <= 599;

    if (isTimeout || isNetworkError || isServerError) {
      config._retryCount = config._retryCount || 0;
      config._retryCount += 1;
      
      // Dispatch event to show "Waking up server" toast
      if (config._retryCount === 1) {
        window.dispatchEvent(new Event('server-waking-up'));
      }
      
      // Backoff: 2s, 4s, 8s, 16s...
      const backoffTime = Math.pow(2, config._retryCount) * 1000;
      
      // Increase timeout for subsequent retries to give it more time to respond
      config.timeout = 30000; 
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return api(config);
    }

    return Promise.reject(error);
  }
);

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
