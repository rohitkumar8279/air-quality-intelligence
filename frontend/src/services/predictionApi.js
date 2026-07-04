import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getPrediction = async (city = "Delhi") => {
  try {
    const response = await axios.get(`${API_URL}/predict?city=${encodeURIComponent(city)}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(`Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received (network error)
      throw new Error('Network error: Unable to reach the prediction service.');
    } else {
      throw new Error('An unexpected error occurred while fetching prediction.');
    }
  }
};
