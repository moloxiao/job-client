import axios from 'axios';
import Cookies from 'js-cookie';

// 使用相对路径，通过Next.js代理访问API（127.0.0.1:800）
// 创建axios实例
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  (config) => {
    // 尝试从 Cookie 获取令牌
    let token = Cookies.get('token');
    
    if (token && config.headers) {
      // 确保 Authorization 头格式正确
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // 调试信息
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

// API函数
export const apiService = {
  // 用户登录
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
  },
  
  // 获取任务列表
  getJobs: async () => {
    try {
      console.log('Calling API: /api/v1/jobs');
      
      // 获取当前 token 以便调试
      const token = Cookies.get('token');
      console.log('Token used for request:', token ? `${token.substring(0, 10)}...` : 'No token');
      
      const response = await api.get('/api/v1/jobs');
      console.log('API Response:', response);
      
      // 根据 Laravel API 的实际响应结构可能需要调整
      // 有些 API 返回 {data: [...]} 而有些直接返回数组
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('API error details:', error.response || error);
      
      // 如果是未授权错误(401)，抛出特定的错误以便在组件中处理
      if (error.response && error.response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      throw error;
    }
  },
};

export default apiService;