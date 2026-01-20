import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only require password in production AND when SITE_PASSWORD is set
  if (process.env.NODE_ENV !== 'production' || !process.env.SITE_PASSWORD) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // Allow access to:
  // - API routes (webhooks, Pipedream, etc.)
  // - Next.js internals
  // - Static assets
  // - Memorial pages (live QR code destinations)
  // - QR redirect routes
  // - Password check page
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/memorial/') ||
    pathname.startsWith('/qr/') ||
    pathname.startsWith('/materials') ||
    pathname === '/password-check'
  ) {
    return NextResponse.next();
  }

  // Check for password cookie
  const password = request.cookies.get('site-password')?.value;
  const correctPassword = process.env.SITE_PASSWORD;

  // If password is correct, allow access
  if (password === correctPassword) {
    return NextResponse.next();
  }

  // Redirect to password page
  const url = request.nextUrl.clone();
  url.pathname = '/password-check';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
