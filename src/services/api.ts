import apiClient from './apiClient';

// Business logic API service
const apiService = {
  // User authentication
  auth: {
    // User login
    login: async (email: string, password: string) => {
      try {
        const response = await apiClient.post('/api/v1/auth/login', { email, password });
        return response.data;
      } catch (error: any) {
        console.error('Login failed:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    
    // User logout
    logout: async () => {
      try {
        const response = await apiClient.post('/api/v1/auth/logout');
        return response.data;
      } catch (error) {
        console.error('Logout failed');
        throw error;
      }
    },
    
    // Get current user information
    getCurrentUser: async () => {
      try {
        const response = await apiClient.get('/api/v1/auth/user');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch user info');
        throw error;
      }
    }
  },
  
  // Job related
  jobs: {
    // Get job list
    getAll: async (params?: any) => {
      try {
        const response = await apiClient.get('/api/v1/jobs', { params });
        
        // Process return data according to the actual API response structure
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to fetch jobs');
        throw error;
      }
    },
    
    // Get single job details
    getById: async (id: number | string) => {
      try {
        const response = await apiClient.get(`/api/v1/jobs/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch job #${id}`);
        throw error;
      }
    },
    
    // Create new job
    create: async (jobData: any) => {
      try {
        const response = await apiClient.post('/api/v1/jobs', jobData);
        return response.data;
      } catch (error) {
        console.error('Failed to create job');
        throw error;
      }
    }
  }
  
  // Can add more business modules, such as user management, settings, etc.
};

export default apiService;