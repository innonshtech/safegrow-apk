import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// We use `jose` for edge middleware JWT verification because jsonwebtoken is Node-only
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === '/login' || path === '/forgot-password';

  const token = request.cookies.get('admin_token')?.value || '';

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');
      await jwtVerify(token, secret);
    } catch (err) {
      // Invalid token
      return NextResponse.redirect(new URL('/login?error=session_expired', request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/employees/:path*',
    '/alerts/:path*',
    '/settings/:path*',
  ],
};
