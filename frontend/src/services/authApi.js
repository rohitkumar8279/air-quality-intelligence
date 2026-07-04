import axios from 'axios';
import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getUserPreferences = async () => {
  const response = await api.get('/users/preferences');
  return response.data;
};

export const getFavoriteCities = async () => {
  const response = await api.get('/users/favorites');
  return response.data;
};

export const addFavoriteCity = async (city_name) => {
  const response = await api.post(`/users/favorites?city_name=${city_name}`);
  return response.data;
};

export const removeFavoriteCity = async (city_name) => {
  const response = await api.delete(`/users/favorites/${encodeURIComponent(city_name)}`);
  return response.data;
};

export default api;
