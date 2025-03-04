import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  
  // 受保护的路由 - 需要身份验证
  const protectedRoutes = ['/dashboard'];
  
  // 身份验证路由 - 已登录用户不应访问
  const authRoutes = ['/login'];
  
  // 检查受保护的路由
  if (protectedRoutes.includes(path) && !token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // 检查已经登录的用户是否尝试访问登录页
  if (authRoutes.includes(path) && token) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// 配置中间件匹配的路由
export const config = {
  matcher: ['/dashboard', '/login'],
};