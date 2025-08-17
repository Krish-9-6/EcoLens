import { Metadata } from 'next'
import AuthForm from '../AuthForm'

export const metadata: Metadata = {
  title: 'Sign In - Veritas Brand Dashboard',
  description: 'Sign in to your brand dashboard',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your brand dashboard
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}