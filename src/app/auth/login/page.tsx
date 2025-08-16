'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
// We can remove Suspense and the extra component for this test to keep it simple.
// import { useSearchParams } from 'next/navigation'
// import { Suspense } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      }
    })
    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', padding: '20px' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['github']}
      />
    </div>
  )
}