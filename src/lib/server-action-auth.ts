import { createClient } from './supabase/server'
import { FormState } from './types'
import { User } from '@supabase/supabase-js'

type Action<T> = (
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User, // Changed from userId: string to user: User
  prevState: FormState,
  formData: T
) => Promise<FormState>

export const withFormAuth = <T>(action: Action<T>) => {
  return async (prevState: FormState, formData: T): Promise<FormState> => {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        message: 'Authentication required. Please sign in again.',
      }
    }

    // Pass the entire user object to the action
    return action(supabase, user, prevState, formData)
  }
}