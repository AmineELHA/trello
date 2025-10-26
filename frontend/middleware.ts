import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/boards'];
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is a protected route (including nested routes like /boards/[id])
  const isProtectedRoute = pathname.startsWith('/boards');
  
  // Check if the path is an auth route
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;

  // Check for authentication if accessing protected route
  if (isProtectedRoute && !token) {
    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Check if user is trying to access auth route while authenticated
  if (isAuthRoute && token) {
    // Redirect to boards if already authenticated
    return NextResponse.redirect(new URL('/boards', request.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};