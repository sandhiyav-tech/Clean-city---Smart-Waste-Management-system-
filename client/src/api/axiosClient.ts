import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle unauthenticated redirect or refresh if necessary
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not already on auth pages, caller handles it via auth context
    return Promise.reject(error);
  }
);

export default axiosClient;

