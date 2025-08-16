import { Metadata } from 'next'

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
        
        {/* Login form will be implemented in task 6 */}
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-center text-gray-500">
            Login form will be implemented in the Product Creation Form Components task.
          </p>
        </div>
      </div>
    </div>
  )
}