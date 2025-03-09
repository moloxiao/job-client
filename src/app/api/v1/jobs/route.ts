import { NextResponse } from 'next/server';
import { serverApiHelpers } from '@/lib/serverApi';

export async function GET(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Prepare request headers
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Handle query parameters
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    
    // Convert URL query parameters to object
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    // Use serverApiHelpers to forward the request, passing query parameters and request headers
    const data = await serverApiHelpers.forwardRequest('get', 'v1/jobs', null, headers, params);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Jobs API error:', error.response?.data || error.message);
    
    // Return appropriate error response
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to fetch jobs';
    
    // For 401 unauthorized errors, return specific error message
    if (status === 401) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }
    
    return NextResponse.json({ message }, { status });
  }
}