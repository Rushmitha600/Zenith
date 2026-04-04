import axios from 'axios';
import { API_URL } from '../config/api.js';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH APIs ============
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);

// ============ POLICY APIs ============
export const getMyPolicies = () => api.get('/policies/my-policies');
export const createPolicy = (data) => api.post('/policies/create', data);

// ============ CLAIM APIs ============
export const getMyClaims = () => api.get('/claims/my-claims');
export const submitClaim = (data) => api.post('/claims/submit', data);
export const autoClaim = (weatherData, policyId) => api.post('/claims/auto-claim', { weatherData, policyId });

// ============ TRACKING APIs ============
export const getWeatherData = (location) => api.get(`/tracking/weather?lat=${location.lat}&lng=${location.lng}`);
export const getWeatherByCity = (city) => api.get(`/tracking/weather?city=${city}`);
export const getUserLocations = () => api.get('/tracking/my-locations');
export const updateUserLocation = (location) => api.post('/tracking/update-location', location);

export default api;