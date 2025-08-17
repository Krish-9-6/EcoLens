import { createClient } from '<ecolens>/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has a brand to determine redirect
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('brand_id')
            .eq('id', user.id)
            .single()

          if (profile?.brand_id) {
                // User has a brand, redirect to dashboard/products or next param
    const redirectUrl = next || '/dashboard/products'
            return NextResponse.redirect(`${origin}${redirectUrl}`)
          } else {
            // User needs setup-brand
            return NextResponse.redirect(`${origin}/auth/setup-brand`)
          }
        }
      } catch (error) {
        console.error('Error checking user profile in callback:', error)
        // Fallback to setup-brand
        return NextResponse.redirect(`${origin}/auth/setup-brand`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}