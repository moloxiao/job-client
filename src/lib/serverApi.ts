import axios from 'axios';

// 创建axios实例，用于Next.js API路由与Laravel后端的通信
const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加响应拦截器
serverApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 服务器端日志记录
    console.error('Server API error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// 服务器端API工具函数
export const serverApiHelpers = {
  // 转发请求到Laravel API，保留原始请求头
  forwardRequest: async (
    method: string, 
    endpoint: string, 
    data: any = null, 
    headers: Record<string, string> = {},
    params: Record<string, string> = {}
  ) => {
    try {
      // 构建请求配置
      const config = {
        method,
        url: `/api/${endpoint}`, // 注意这里使用相对路径
        headers,
        ...(data && { data }),
        ...(Object.keys(params).length > 0 && { params }) // 添加查询参数
      };
      
      // 记录请求信息（开发环境调试用）
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ServerAPI] ${method.toUpperCase()} ${endpoint}`, {
          headers: Object.keys(headers),
          hasData: !!data,
          hasParams: Object.keys(params).length > 0,
          params
        });
      }
      
      // 发送请求
      const response = await serverApi(config);
      return response.data;
    } catch (error: any) {
      // 处理并传递错误
      console.error(`Failed to forward ${method} request to ${endpoint}`, error);
      throw error;
    }
  }
};

export default serverApi;