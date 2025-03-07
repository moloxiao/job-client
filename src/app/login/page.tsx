"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

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

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// We will use a relative path and access the API via Next.js proxy (127.0.0.1:800)

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Validate token and retrieve user information
  useEffect(() => {
    const checkUserAuthentication = async () => {
      // First, check the cookie
      let token = Cookies.get('token');
      let email = Cookies.get('user_email');
      
      if (token) {
        console.log('Token found during authentication check');
        try {
          // Here, you can add an API call to validate the token if your Laravel API provides such an endpoint
          // Example: const response = await axios.get(`/api/v1/auth/user`, {...})
          
          // For simplicity, we only check if the token exists
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
      const response = await axios.post(`/api/v1/auth/login`, {
        email,
        password
      });
      
      // Debug log to check response structure
      console.log('Login response:', response.data);
      
      // Retrieve token (adjust according to the actual Laravel API response structure)
      let token;
      if (response.data.token) {
        token = response.data.token;
      } else if (response.data.data && response.data.data.token) {
        token = response.data.data.token;
      } else if (response.data.access_token) {
        token = response.data.access_token;
      } else {
        console.error('Token not found in response', response.data);
        setError('Login successful, but access token not found. Please contact the administrator.');
        setLoading(false);
        return;
      }
      
      // Ensure we have a valid token
      if (!token) {
        console.error('Token is empty or invalid');
        setError('Invalid access token received. Please contact the administrator.');
        setLoading(false);
        return;
      }
      
      console.log('Token before setting cookie:', token);
      
      // Explicitly set cookie options
      const cookieOptions = { 
        expires: 1, // Expires in 1 day
        path: '/',  // Available across the entire site
        secure: window.location.protocol === 'https:', // Set secure flag for HTTPS connections
        sameSite: 'strict' as const // Prevent CSRF attacks
      };
      
      // Remove any existing token
      Cookies.remove('token');
      
      // Set the new token
      Cookies.set('token', token, cookieOptions);
      Cookies.set('user_email', email, cookieOptions);
      
      // Immediately verify if the token is set
      const savedToken = Cookies.get('token');
      console.log('Token immediately after setting:', savedToken ? 'Token saved successfully' : 'Failed to save token');
      
      if (!savedToken) {
        console.error('Token could not be saved to cookies');
        setError('Failed to save authentication token in the browser. Please check your browser settings.');
        setLoading(false);
        return;
      }
      
      setUser({ email });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
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

// Custom hook to use in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
