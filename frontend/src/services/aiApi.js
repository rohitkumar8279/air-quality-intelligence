import axios from 'axios';
import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getAIInsights = async (city = 'Delhi') => {
  const response = await api.get(`/insights?city=${encodeURIComponent(city)}`);
  return response.data;
};

export const getPredictionExplanation = async (city = 'Delhi') => {
  const response = await api.get(`/prediction/explanation?city=${encodeURIComponent(city)}`);
  return response.data;
};

export const getDailySummary = async (city = 'Delhi') => {
  const response = await api.get(`/daily-summary?city=${encodeURIComponent(city)}`);
  return response.data;
};

export const getHealthAdvice = async (city = 'Delhi') => {
  const response = await api.get(`/health-advice?city=${encodeURIComponent(city)}`);
  return response.data;
};

export const getPollutionAnalysis = async (city = 'Delhi') => {
  const response = await api.get(`/pollution-analysis?city=${encodeURIComponent(city)}`);
  return response.data;
};

export const getWeatherImpact = async (city = 'Delhi') => {
  const response = await api.get(`/weather-impact?city=${encodeURIComponent(city)}`);
  return response.data;
};

export const getFeatureImportance = async (city = 'Delhi') => {
  const response = await api.get(`/feature-importance?city=${encodeURIComponent(city)}`);
  return response.data;
};

export const getModelInfo = async () => {
  const response = await axios.get(`${API_BASE_URL}/model-info`);
  return response.data;
};
