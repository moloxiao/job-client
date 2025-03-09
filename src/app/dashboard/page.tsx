'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiService from '@/services/api';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';

interface Job {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 如果未登录且已完成认证检查，重定向到登录页面
    if (!user && !authLoading) {
      router.push('/login');
      return;
    }

    // 如果已登录，获取任务列表
    if (user) {
      fetchJobs();
    }
  }, [user, authLoading, router]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    // 检查 token 是否存在
    const token = Cookies.get('token');
    console.log('Current token in cookie:', token ? `${token.substring(0, 10)}...` : 'No token');
    
    try {
      console.log('Fetching jobs...');
      // 使用新的架构中的API服务获取工作列表
      const data = await apiService.jobs.getAll();
      console.log('Jobs data received:', data);
      setJobs(data);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      
      if (err.message === 'UNAUTHORIZED') {
        console.log('Unauthorized, redirecting to login');
        router.push('/login');
      } else {
        // 展示更详细的错误信息
        const errorMessage = err.response?.data?.message || err.message;
        setError(`获取任务列表时出错：${errorMessage} (状态码: ${err.response?.status || '未知'})`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 显示加载状态
  if (authLoading || loading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // 确保用户已登录
  if (!user) {
    return null; // 这里不需要显示任何内容，因为我们已经重定向到登录页面
  }

  return (
    <div>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">任务列表</h1>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {jobs.length > 0 ? (
              <div className="mt-6">
                <ul className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <li key={job.id} className="py-4">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {job.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {job.id}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 text-center text-gray-500">
                没有找到任务。
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={fetchJobs}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                刷新
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}