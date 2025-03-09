import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance for communication between Next.js frontend and Next.js API routes
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding token to request headers');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - unified error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized error
    if (error.response && error.response.status === 401) {
      // Logic for redirecting to login page or automatically refreshing token can be added here
      console.error('Authentication error: Unauthorized');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;