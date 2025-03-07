import axios from 'axios';
import Cookies from 'js-cookie';

// Use relative path to access API via Next.js proxy (127.0.0.1:800)
// Create an axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add authentication token
api.interceptors.request.use(
  (config) => {
    // Attempt to retrieve the token from cookies
    let token = Cookies.get('token');
    
    if (token && config.headers) {
      // Ensure the Authorization header is correctly formatted
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Debugging info
      console.log('Adding token to request headers');
    } else {
      console.log('No token found in cookies or localStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // User login
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
  },
  
  // Fetch job list
  getJobs: async () => {
    try {
      console.log('Calling API: /api/v1/jobs');
      
      // Retrieve the current token for debugging purposes
      const token = Cookies.get('token');
      console.log('Token used for request:', token ? `${token.substring(0, 10)}...` : 'No token');
      
      const response = await api.get('/api/v1/jobs');
      console.log('API Response:', response);
      
      // Adjust according to the actual response structure of the Laravel API
      // Some APIs return {data: [...]} while others return an array directly
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('API error details:', error.response || error);
      
      // If an unauthorized error (401) occurs, throw a specific error for handling in components
      if (error.response && error.response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      throw error;
    }
  },
};

export default apiService;
