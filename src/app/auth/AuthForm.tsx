'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '<ecolens>/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthForm() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Check if user has a brand
          const { data: profile } = await supabase
            .from('profiles')
            .select('brand_id')
            .eq('id', session.user.id)
            .single()

          if (profile?.brand_id) {
            // User has a brand, redirect to dashboard
            router.push('/dashboard')
          } else {
            // User needs setup-brand, redirect to setup-brand
            router.push('/auth/setup-brand')
          }
        } catch (error) {
          console.error('Error checking user profile:', error)
          // Fallback to setup-brand
          router.push('/auth/setup-brand')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: '#10b981',
              brandAccent: '#059669',
              brandButtonText: 'white',
              defaultButtonBackground: '#374151',
              defaultButtonBackgroundHover: '#4b5563',
              defaultButtonText: 'white',
              dividerBackground: '#374151',
              inputBackground: '#1f2937',
              inputBorder: '#4b5563',
              inputBorderHover: '#6b7280',
              inputBorderFocus: '#10b981',
              inputText: 'white',
              inputLabelText: '#d1d5db',
              inputPlaceholder: '#9ca3af',
              messageText: '#d1d5db',
              messageTextDanger: '#fca5a5',
              anchorTextColor: '#10b981',
              anchorTextHoverColor: '#34d399',
            },
          },
        },
      }}
      theme="dark"
      showLinks
      providers={['google', 'github']}
      redirectTo={`${location.origin}/auth/callback`}
    />
  )
}