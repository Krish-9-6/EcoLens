'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '<ecolens>/components/ui/button'
import { Input } from '<ecolens>/components/ui/input'
import { Label } from '<ecolens>/components/ui/label'
import { Alert, AlertDescription } from '<ecolens>/components/ui/alert'
import { signUpWithEmail } from '<ecolens>/lib/auth-client'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()

  const testSupabaseConnection = async () => {
    try {
          const { createClient } = await import('<ecolens>/lib/supabase/client')
    const supabase = createClient()
      
      console.log('Testing Supabase connection...')
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
      
      const { data, error } = await supabase.auth.getSession()
      console.log('Session test:', { data, error })
      
      setDebugInfo(`Connection test: ${error ? 'Failed' : 'Success'} - ${error?.message || 'No error'}`)
    } catch (err) {
      console.error('Connection test error:', err)
      setDebugInfo(`Connection test error: ${err}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('Starting signup process...')
      const data = await signUpWithEmail(email, password)
      console.log('Signup response:', data)
      
      if (data.user) {
        console.log('User created successfully:', data.user.id)
        setDebugInfo(`User created with ID: ${data.user.id}`)
        // SUCCESS: User is created and logged in automatically
        // Redirect to dashboard - middleware will handle brand setup redirect if needed
        router.push('/dashboard')
      } else {
        console.log('No user in response data')
        setError('User creation failed - no user data returned')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Enhanced Background Pattern - Fashion-Tech Noir theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
      
      {/* Animated geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-emerald-400/30 rounded-full" />
        <div className="absolute top-40 right-32 w-24 h-24 border border-emerald-400/30 rotate-45" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border border-emerald-400/30 rounded-full" />
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-emerald-400/30 rotate-12" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8 px-4">
        <div>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Create your account
          </h2>
          <p className="text-center text-lg text-slate-300">
            Start managing your fashion supply chain transparency
          </p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-elegant-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {debugInfo && (
              <Alert>
                <AlertDescription className="text-xs">{debugInfo}</AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email address
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Create a password"
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button 
                type="button" 
                variant="outline"
                onClick={testSupabaseConnection}
                className="text-xs"
              >
                Test Connection
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-300">
                Already have an account?{' '}
                <a 
                  href="/auth/login" 
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
