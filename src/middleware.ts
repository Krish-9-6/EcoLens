import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // This will refresh the session cookie if it's expired.
  const { response, data: { user } } = await updateSession(request)

  const { pathname } = request.nextUrl

  // Protect dashboard and dpp routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/dpp')) {
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check for brand_id in user's profile
    if (user && !user.app_metadata?.brand_id) {
      if (pathname !== '/auth/setup-brand') {
        const redirectUrl = new URL('/auth/setup-brand', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
}