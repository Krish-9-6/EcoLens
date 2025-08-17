import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // This will refresh the session cookie if it's expired.
  const { response, data: { user } } = await updateSession(request)

  const { pathname } = request.nextUrl

  // If user is authenticated, check their onboarding status
  if (user) {
    try {
      // Create a single Supabase client for this request
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        } as any
      )

      // Check user's profile and brand status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile in middleware:', profileError)
      }

      // If user has no brand_id, they need setup-brand
      if (!profile?.brand_id) {
        // Redirect to setup-brand if they're not already there
        if (pathname !== '/auth/setup-brand') {
          return NextResponse.redirect(new URL('/auth/setup-brand', request.url))
        }
      } else {
                 // User has a brand, redirect to dashboard/products if they're on setup-brand
         if (pathname === '/auth/setup-brand') {
           return NextResponse.redirect(new URL('/dashboard/products', request.url))
         }
      }

      // Redirect authenticated users away from auth pages
      if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
        const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard/products'
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }

    } catch (error) {
      console.error('Error in middleware:', error)
      // If there's an error, redirect to onboarding as a fallback
      if (pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // Protect dashboard and dpp routes for unauthenticated users
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/dpp'))) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
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