import { NextResponse } from 'next/server';
import { serverApiHelpers } from '@/lib/serverApi';

export async function POST(request: Request) {
  try {
    // 获取请求数据
    const body = await request.json();
    
    // 使用通用的转发工具函数
    const data = await serverApiHelpers.forwardRequest('post', 'v1/auth/login', body);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Login API error:', error.response?.data || error.message);
    
    // 返回适当的错误响应
    return NextResponse.json(
      { message: error.response?.data?.message || 'Authentication failed' },
      { status: error.response?.status || 500 }
    );
  }
}