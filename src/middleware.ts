import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  
  // Protected routes - Require authentication
  const protectedRoutes = ['/dashboard'];
  
  // Authentication routes - Should not be accessible to logged-in users
  const authRoutes = ['/login'];
  
  // Check protected routes
  if (protectedRoutes.includes(path) && !token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // Check if a logged-in user is trying to access the login page
  if (authRoutes.includes(path) && token) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure routes that the middleware should match
export const config = {
  matcher: ['/dashboard', '/login'],
};
