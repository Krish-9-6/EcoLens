'use client'

import { useActionState } from 'react' // Changed from 'react-dom' and renamed
import { setupBrand } from '<ecolens>/app/actions'
import { Button } from '<ecolens>/components/ui/button'
import { Input } from '<ecolens>/components/ui/input'
import { Label } from '<ecolens>/components/ui/label'

export default function SetupBrandPage() {
  // Renamed useFormState to useActionState
  const [state, formAction] = useActionState(setupBrand, { message: null })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a brand to associate with your account.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          <form action={formAction} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Brand Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your Company Name"
                className="mt-1 text-black"
                aria-describedby="name-error"
              />
              {state?.errors?.name && (
                <p id="name-error" className="mt-2 text-sm text-red-600">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {state?.message && !state.errors && (
                <p className="mt-2 text-sm text-red-600">
                  {state.message}
                </p>
              )}

            <div>
              <Button type="submit" className="w-full">
                Create Brand and Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}