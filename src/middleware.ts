import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // CSP header for enhanced security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://www.google.com",
    "frame-src https://www.google.com",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Log suspicious activity
    if (request.method !== 'GET' && request.method !== 'POST') {
      console.warn(`Suspicious HTTP method ${request.method} from ${ip} to ${request.nextUrl.pathname}`);
    }

    // Track API performance
    const duration = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${duration}ms`);
    
    // Async tracking (don't block response)
    if (duration > 500) { // Only track slower requests to avoid overwhelming the system
      queueMicrotask(async () => {
        try {
          const { monitoring } = await import('@/lib/monitoring');
          await monitoring.trackAPICall(request, response, duration);
        } catch (error) {
          console.error('Failed to track API call:', error);
        }
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
