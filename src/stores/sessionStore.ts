import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface SessionState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))