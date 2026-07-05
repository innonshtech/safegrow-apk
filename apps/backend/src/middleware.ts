import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/v1/auth')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    // In a real Edge environment, we'd use `jose` to verify the JWT here.
    // For now, we allow the request through and let the specific route handler 
    // verify the token using `jsonwebtoken` since standard node libraries aren't fully Edge compatible.
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
