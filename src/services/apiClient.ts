import axios from 'axios';
import Cookies from 'js-cookie';

// 创建axios实例，用于Next.js前端与Next.js API路由的通信
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
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

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 可以在这里进行重定向到登录页面或自动刷新token的逻辑
      console.error('Authentication error: Unauthorized');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;