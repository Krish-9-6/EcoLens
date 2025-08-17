'use client'

import { useSessionStore } from '<ecolens>/stores/sessionStore'
import { createClient } from '<ecolens>/lib/supabase/client'
import { useEffect } from 'react'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useSessionStore()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser])

  return <>{children}</>
}