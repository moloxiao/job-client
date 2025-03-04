'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CookieDebug: React.FC = () => {
  const [cookieStatus, setCookieStatus] = useState<{[key: string]: string}>({});
  const [localStorageStatus, setLocalStorageStatus] = useState<{[key: string]: string}>({});
  const [testResult, setTestResult] = useState<string>('未测试');

  useEffect(() => {
    checkStorageStatus();
  }, []);

  const checkStorageStatus = () => {
    // 检查现有 cookie
    const cookieValues: {[key: string]: string} = {};
    cookieValues['token'] = Cookies.get('token') || '未设置';
    cookieValues['user_email'] = Cookies.get('user_email') || '未设置';
    setCookieStatus(cookieValues);

    // 检查本地存储
    const lsValues: {[key: string]: string} = {};
    try {
      lsValues['backup_token'] = localStorage.getItem('backup_token') || '未设置';
      lsValues['backup_email'] = localStorage.getItem('backup_email') || '未设置';
    } catch (e) {
      lsValues['error'] = '无法访问本地存储';
    }
    setLocalStorageStatus(lsValues);
  };

  const testCookieSetup = () => {
    try {
      // 尝试设置测试 cookie
      Cookies.set('test_cookie', 'test_value', { expires: 1 });
      
      // 检查是否设置成功
      const testCookie = Cookies.get('test_cookie');
      
      if (testCookie === 'test_value') {
        setTestResult('Cookie 测试成功 ✅ - 浏览器可以设置和读取 cookie');
      } else {
        setTestResult('Cookie 测试失败 ❌ - 无法读取刚刚设置的 cookie');
      }
      
      // 清理测试 cookie
      Cookies.remove('test_cookie');
    } catch (e) {
      setTestResult(`Cookie 测试错误 ❌ - ${e instanceof Error ? e.message : '未知错误'}`);
    }
    
    // 刷新状态
    checkStorageStatus();
  };

  return (
    <div className="p-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <h2 className="text-lg font-semibold text-yellow-800 mb-2">Cookie 和存储调试</h2>
      
      <div className="flex gap-4 mb-4">
        <button 
          onClick={checkStorageStatus} 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          刷新状态
        </button>
        <button 
          onClick={testCookieSetup} 
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          测试 Cookie
        </button>
      </div>

      <div className="text-sm">
        <p className="font-medium">测试结果: <span className={testResult.includes('成功') ? 'text-green-600' : 'text-red-600'}>{testResult}</span></p>
        
        <div className="mt-2">
          <p className="font-medium mb-1">Cookie 状态:</p>
          {Object.entries(cookieStatus).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="font-medium">{key}:</span> 
              <span className={value === '未设置' ? 'text-red-500' : 'text-green-600'}>
                {value === '未设置' ? value : value.length > 20 ? `${value.substring(0, 20)}...` : value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2">
          <p className="font-medium mb-1">localStorage 状态:</p>
          {Object.entries(localStorageStatus).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="font-medium">{key}:</span> 
              <span className={value === '未设置' || key === 'error' ? 'text-red-500' : 'text-green-600'}>
                {value === '未设置' ? value : value.length > 20 ? `${value.substring(0, 20)}...` : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CookieDebug;