import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  } 

  return (
    <div>
      <p>Hello {user.email}</p>
      <form action="/auth/signout" method="post">
        <button type="submit">
          Sign out
        </button>
      </form>
    </div>
  )
}