"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// 定义类型
interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 我们将使用相对路径，通过Next.js代理访问API（127.0.0.1:800）

// 提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 验证令牌并获取用户信息
  useEffect(() => {
    const checkUserAuthentication = async () => {
      // 先检查 Cookie
      let token = Cookies.get('token');
      let email = Cookies.get('user_email');
      
      if (token) {
        console.log('Token found during authentication check');
        try {
          // 这里可以添加一个验证令牌的API调用，如果您的Laravel API提供了这样的端点
          // 例如: const response = await axios.get(`/api/v1/auth/user`, {...})
          
          // 简化起见，我们这里只检查令牌是否存在
          setUser({ email: email || '' });
        } catch (error) {
          console.error('Error verifying token:', error);
          Cookies.remove('token');
          Cookies.remove('user_email');
          setUser(null);
        }
      } else {
        console.log('No token found during authentication check');
      }
      
      setLoading(false);
    };

    checkUserAuthentication();
  }, []);

  // 登录函数
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/v1/auth/login`, {
        email,
        password
      });
      
      // 调试日志，查看响应结构
      console.log('Login response:', response.data);
      
      // 获取 token (根据 Laravel API 的实际响应结构可能需要调整)
      let token;
      if (response.data.token) {
        token = response.data.token;
      } else if (response.data.data && response.data.data.token) {
        token = response.data.data.token;
      } else if (response.data.access_token) {
        token = response.data.access_token;
      } else {
        console.error('Token not found in response', response.data);
        setError('登录成功但未找到访问令牌，请联系管理员');
        setLoading(false);
        return;
      }
      
      // 确保我们有一个有效的令牌
      if (!token) {
        console.error('Token is empty or invalid');
        setError('获取的令牌无效，请联系管理员');
        setLoading(false);
        return;
      }
      
      console.log('Token before setting cookie:', token);
      
      // 明确设置 cookie 选项
      const cookieOptions = { 
        expires: 1, // 1天后过期
        path: '/',  // 整个站点可用
        secure: window.location.protocol === 'https:', // 在HTTPS连接上设置secure
        sameSite: 'strict' as const // 防止CSRF攻击
      };
      
      // 清除任何可能存在的旧令牌
      Cookies.remove('token');
      
      // 设置新令牌
      Cookies.set('token', token, cookieOptions);
      Cookies.set('user_email', email, cookieOptions);
      
      // 立即验证令牌是否已设置
      const savedToken = Cookies.get('token');
      console.log('Token immediately after setting:', savedToken ? 'Token saved successfully' : 'Failed to save token');
      
      if (!savedToken) {
        console.error('Token could not be saved to cookies');
        setError('无法保存身份验证令牌到浏览器，请检查浏览器设置');
        setLoading(false);
        return;
      }
      
      setUser({ email });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || '登录失败，请检查您的凭据');
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user_email');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子以在组件中使用
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};