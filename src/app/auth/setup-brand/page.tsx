import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Setup Brand - Veritas Brand Dashboard',
  description: 'Complete your brand profile setup',
}

export default function SetupBrandPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Associate your account with a brand to continue
          </p>
        </div>
        
        {/* Brand setup form will be implemented later */}
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-center text-gray-500">
            Brand setup form will be implemented in a future task.
          </p>
        </div>
      </div>
    </div>
  )
}