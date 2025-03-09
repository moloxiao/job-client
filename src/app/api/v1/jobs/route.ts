import { NextResponse } from 'next/server';
import { serverApiHelpers } from '@/lib/serverApi';

export async function GET(request: Request) {
  try {
    // 获取授权头
    const authHeader = request.headers.get('Authorization');
    
    // 准备请求头
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // 处理查询参数
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    
    // 将URL查询参数转换为对象
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    // 使用serverApiHelpers转发请求，传递查询参数和请求头
    const data = await serverApiHelpers.forwardRequest('get', 'v1/jobs', null, headers, params);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Jobs API error:', error.response?.data || error.message);
    
    // 返回适当的错误响应
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to fetch jobs';
    
    // 对于401未授权错误，返回特定的错误消息
    if (status === 401) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }
    
    return NextResponse.json({ message }, { status });
  }
}

