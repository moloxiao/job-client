import { NextResponse } from 'next/server';
import { serverApiHelpers } from '@/lib/serverApi';

export async function POST(request: Request) {
  try {
    // Get request data
    const body = await request.json();
    
    // Use generic forwarding utility function
    const data = await serverApiHelpers.forwardRequest('post', 'v1/auth/login', body);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Login API error:', error.response?.data || error.message);
    
    // Return appropriate error response
    return NextResponse.json(
      { message: error.response?.data?.message || 'Authentication failed' },
      { status: error.response?.status || 500 }
    );
  }
}