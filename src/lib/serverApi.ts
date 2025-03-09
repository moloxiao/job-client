import axios from 'axios';

// Create axios instance for communication between Next.js API routes and Laravel backend
const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor
serverApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Server-side logging
    console.error('Server API error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Server-side API utility functions
export const serverApiHelpers = {
  // Forward request to Laravel API, preserving original request headers
  forwardRequest: async (
    method: string, 
    endpoint: string, 
    data: any = null, 
    headers: Record<string, string> = {},
    params: Record<string, string> = {}
  ) => {
    try {
      // Build request configuration
      const config = {
        method,
        url: `/api/${endpoint}`, // Note that we use a relative path here
        headers,
        ...(data && { data }),
        ...(Object.keys(params).length > 0 && { params }) // Add query parameters
      };
      
      // Log request information (for development environment debugging)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ServerAPI] ${method.toUpperCase()} ${endpoint}`, {
          headers: Object.keys(headers),
          hasData: !!data,
          hasParams: Object.keys(params).length > 0,
          params
        });
      }
      
      // Send request
      const response = await serverApi(config);
      return response.data;
    } catch (error: any) {
      // Handle and pass along error
      console.error(`Failed to forward ${method} request to ${endpoint}`, error);
      throw error;
    }
  }
};

export default serverApi;