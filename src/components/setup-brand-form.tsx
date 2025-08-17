'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createBrandAndLinkToProfile } from '../app/actions'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ArrowRight } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg px-6 py-3 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,133,0.3)] hover:shadow-[0_0_30px_rgba(0,255,133,0.5)]" 
      disabled={pending}
    >
      {pending ? (
        'Creating Brand...'
      ) : (
        <>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}

export function SetupBrandForm() {
  const router = useRouter()
  const initialState = { message: '', errors: undefined, success: false }
  const [state, dispatch] = useActionState(createBrandAndLinkToProfile, initialState)

  useEffect(() => {
    if (state.success) {
      // Redirect to dashboard/products on success
      router.push('/dashboard/products')
    }
  }, [state.success, router])

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <Label htmlFor="brandName" className="text-sm font-medium text-slate-300">
          Brand Name
        </Label>
        <div className="mt-1 relative">
          <Input
            id="brandName"
            name="brandName"
            type="text"
            placeholder="e.g., Acme Apparel Co."
            required
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
            aria-describedby="brandName-error"
          />
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        {state.errors?.brandName && (
          <p id="brandName-error" className="mt-1 text-xs text-red-400">
            {state.errors.brandName[0]}
          </p>
        )}
      </div>
      
      {state.message && !state.errors && (
        <p className="mt-2 text-sm text-red-400">
          {state.message}
        </p>
      )}
      
      <SubmitButton />
    </form>
  )
}
