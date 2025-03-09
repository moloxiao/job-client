"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';

// Define types
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

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verify token and fetch user info
  useEffect(() => {
    const checkUserAuthentication = async () => {
      // First, check the cookie
      let token = Cookies.get('token');
      let email = Cookies.get('user_email');
      
      if (token) {
        console.log('Token found during authentication check');
        try {
          // 这里可以添加验证token的API调用
          // 例如: const userData = await apiService.auth.getCurrentUser();
          
          // 简化起见，我们只检查token是否存在
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

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 使用新的api服务进行登录
      const response = await apiService.auth.login(email, password);
      
      // Debug log to check response structure
      console.log('Login response:', response);
      
      // Retrieve token (may need to adjust based on API response structure)
      let token;
      if (response.token) {
        token = response.token;
      } else if (response.data && response.data.token) {
        token = response.data.token;
      } else if (response.access_token) {
        token = response.access_token;
      } else {
        console.error('Token not found in response', response);
        setError('Login successful but no access token found. Please contact the administrator.');
        setLoading(false);
        return;
      }
      
      // Ensure we have a valid token
      if (!token) {
        console.error('Token is empty or invalid');
        setError('Invalid token received. Please contact the administrator.');
        setLoading(false);
        return;
      }
      
      console.log('Token before setting cookie:', token);
      
      // Explicitly set cookie options
      const cookieOptions = { 
        expires: 1, // Expires in 1 day
        path: '/',  // Available throughout the site
        secure: window.location.protocol === 'https:', // Secure flag for HTTPS connections
        sameSite: 'strict' as const // Prevents CSRF attacks
      };
      
      // Remove any existing token
      Cookies.remove('token');
      
      // Set new token
      Cookies.set('token', token, cookieOptions);
      Cookies.set('user_email', email, cookieOptions);
      
      // Immediately verify if the token is saved
      const savedToken = Cookies.get('token');
      console.log('Token immediately after setting:', savedToken ? 'Token saved successfully' : 'Failed to save token');
      
      if (!savedToken) {
        console.error('Token could not be saved to cookies');
        setError('Failed to store authentication token in the browser. Please check your browser settings.');
        setLoading(false);
        return;
      }
      
      setUser({ email });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // TODO : call service side logout api
    // apiService.auth.logout();
    
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

// Custom hook to use authentication context in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};