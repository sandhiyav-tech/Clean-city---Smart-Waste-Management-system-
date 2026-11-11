import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token from localStorage if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cleancity_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated redirect or refresh if necessary
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not already on auth pages, caller handles it via auth context
    return Promise.reject(error);
  }
);

export default axiosClient;

