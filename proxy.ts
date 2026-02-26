import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If accessing protected route without token, redirect to sign-in
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Verify token if present
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      // If authenticated user tries to access public auth pages, redirect to dashboard
      if (isPublicRoute && payload.userId) {
        const dashboardUrl = new URL(`/dashboard/${payload.storeId}`, request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      
      // Add user info to request headers for server components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-role', payload.role as string);
      requestHeaders.set('x-store-id', payload.storeId as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Invalid token, clear it and redirect to sign-in if on protected route
      const response = isProtectedRoute 
        ? NextResponse.redirect(new URL('/sign-in', request.url))
        : NextResponse.next();
      
      response.cookies.delete('token');
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
