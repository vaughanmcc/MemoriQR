import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const isPreview = process.env.VERCEL_ENV === 'preview'

  if (isPreview && host.endsWith('.vercel.app')) {
    const url = request.nextUrl.clone()
    url.hostname = 'dev.memoriqr.co.nz'
    url.protocol = 'https'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
