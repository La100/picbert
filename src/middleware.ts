import { NextResponse, type NextRequest } from 'next/server'

const API_PREFIXES = ['/api', '/auth']

export function middleware(request: NextRequest) {
  const isApiRequest = API_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  )

  if (isApiRequest) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      {
        status: 503,
        headers: { 'Retry-After': '86400' },
      }
    )
  }

  const landingPageUrl = request.nextUrl.clone()
  landingPageUrl.pathname = '/'
  landingPageUrl.search = '?service=paused'

  return NextResponse.redirect(landingPageUrl)
}

export const config = {
  matcher: [
    '/api/:path*',
    '/auth/:path*',
    '/login',
    '/reset-password',
    '/dashboard/:path*',
    '/image-generation/:path*',
    '/video-generation/:path*',
    '/video-library/:path*',
    '/gallery/:path*',
    '/billing/:path*',
    '/account-settings/:path*',
    '/requests-history/:path*',
  ],
}
