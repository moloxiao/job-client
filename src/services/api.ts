import apiClient from './apiClient';

// 业务逻辑API服务
const apiService = {
  // 用户认证
  auth: {
    // 用户登录
    login: async (email: string, password: string) => {
      try {
        const response = await apiClient.post('/api/v1/auth/login', { email, password });
        return response.data;
      } catch (error: any) {
        console.error('Login failed:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    
    // 用户登出
    logout: async () => {
      try {
        const response = await apiClient.post('/api/v1/auth/logout');
        return response.data;
      } catch (error) {
        console.error('Logout failed');
        throw error;
      }
    },
    
    // 获取当前用户信息
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
  
  // 工作相关
  jobs: {
    // 获取工作列表
    getAll: async (params?: any) => {
      try {
        const response = await apiClient.get('/api/v1/jobs', { params });
        
        // 根据实际API响应结构处理返回数据
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('Failed to fetch jobs');
        throw error;
      }
    },
    
    // 获取单个工作详情
    getById: async (id: number | string) => {
      try {
        const response = await apiClient.get(`/api/v1/jobs/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch job #${id}`);
        throw error;
      }
    },
    
    // 创建新工作
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
  
  // 可以添加更多业务模块，如用户管理、设置等
};

export default apiService;