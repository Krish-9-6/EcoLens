import { SetupBrandForm } from '../../../components/setup-brand-form'
import { PageTransition } from '../../../components/ui/PageTransition'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SetupBrandPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single()
    if (profile?.brand_id) {
      redirect('/dashboard/products')
    }
  } catch (error) {
    console.error('Error checking profile in setup-brand page:', error)
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Enhanced Background Pattern - Fashion-Tech Noir theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
      
      {/* Animated geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-emerald-400/30 rounded-full" />
        <div className="absolute top-40 right-32 w-24 h-24 border border-emerald-400/30 rotate-45" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border border-emerald-400/30 rounded-full" />
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-emerald-400/30 rotate-12" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <PageTransition>
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Welcome to EcoLens
            </h1>
            <p className="text-lg text-slate-300">
              Let's get started by setting up your brand.
            </p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-elegant-lg">
            <SetupBrandForm />
          </div>
        </PageTransition>
      </div>
    </div>
  )
}
