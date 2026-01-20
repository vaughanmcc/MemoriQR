import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname
  const isPreview = process.env.VERCEL_ENV === 'preview'

  // Preview environment: redirect .vercel.app to dev.memoriqr.co.nz
  if (isPreview && host.endsWith('.vercel.app')) {
    const url = request.nextUrl.clone()
    url.hostname = 'dev.memoriqr.co.nz'
    url.protocol = 'https'
    return NextResponse.redirect(url)
  }

  // Admin area protection (always active when ADMIN_PASSWORD is set)
  if (process.env.ADMIN_PASSWORD && pathname.startsWith('/admin')) {
    // Allow admin login page and API
    if (pathname === '/admin' || pathname.startsWith('/api/admin')) {
      return NextResponse.next()
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== process.env.ADMIN_PASSWORD) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  // Password protection: only in production when SITE_PASSWORD is set
  if (process.env.NODE_ENV === 'production' && process.env.SITE_PASSWORD) {
    // Allow access to:
    // - API routes (webhooks, Pipedream, etc.)
    // - Next.js internals
    // - Static assets
    // - Memorial pages (live QR code destinations)
    // - QR redirect routes
    // - Password check page
    // - Admin pages (handled above)
    // - Partner application page
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/memorial/') ||
      pathname.startsWith('/qr/') ||
      pathname.startsWith('/materials') ||
      pathname.startsWith('/admin') ||
      pathname === '/password-check' ||
      pathname === '/partner/apply'
    ) {
      return NextResponse.next()
    }

    // Check for password cookie
    const password = request.cookies.get('site-password')?.value
    const correctPassword = process.env.SITE_PASSWORD

    // If password is correct, allow access
    if (password === correctPassword) {
      return NextResponse.next()
    }

    // Redirect to password page
    const url = request.nextUrl.clone()
    url.pathname = '/password-check'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
