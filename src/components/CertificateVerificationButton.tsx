'use client'

import React, { useTransition } from 'react'
// Update the path below to the correct location of your Button component
import { Button } from './ui/button'
import { Loader2, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
// Update the path below to the correct location of your actions file
import { verifyCertificate } from '../app/actions'
// Or, if the actions file is in 'src/actions', use:
// import { verifyCertificate } from '@/actions'

/**
 * Interface for certificate data structure
 */
interface Certificate {
  id: string
  [key: string]: any // Allow additional certificate properties
}

/**
 * Props interface for CertificateVerificationButton component
 */
interface CertificateVerificationButtonProps {
  /** Certificate object containing id and data to be verified */
  certificate: Certificate
  /** Optional className for custom styling */
  className?: string
  /** Optional callback for successful verification */
  onVerificationSuccess?: (hash: string) => void
  /** Optional callback for verification failure */
  onVerificationError?: (error: string) => void
  /** Custom button text (defaults to "Verify Certificate") */
  buttonText?: string
  /** Button variant from Shadcn UI */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** Button size from Shadcn UI */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * CertificateVerificationButton Component
 * 
 * A client-side component that handles certificate verification through
 * the server action. Features loading states, error handling, and success
 * notifications with a polished UI using Shadcn/ui components.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export function CertificateVerificationButton({
  certificate,
  className = '',
  onVerificationSuccess,
  onVerificationError,
  buttonText = 'Verify Certificate',
  variant = 'default',
  size = 'default'
}: CertificateVerificationButtonProps) {
  // Use React's useTransition hook for optimistic UI updates
  const [isPending, startTransition] = useTransition()

  /**
   * Handles the certificate verification process
   * Manages the entire flow from button click to completion
   */
  const handleVerification = async () => {
    // Validate certificate data before processing
    if (!certificate?.id) {
      toast.error('Invalid certificate: Missing certificate ID')
      onVerificationError?.('Invalid certificate ID')
      return
    }

    // Extract certificate data (exclude id from the data payload)
    const { id, ...certificateData } = certificate
    
    // Validate that there's actual data to verify
    if (Object.keys(certificateData).length === 0) {
      toast.error('Invalid certificate: No data to verify')
      onVerificationError?.('No certificate data found')
      return
    }

    // Start the verification process with optimistic UI
    startTransition(async () => {
      try {
        // Show loading toast for user feedback
        const loadingToast = toast.loading('Verifying certificate...', {
          description: 'Creating secure hash and recording verification'
        })

        // Call the server action
        const result = await verifyCertificate(id, certificateData)

        // Dismiss loading toast
        toast.dismiss(loadingToast)

        if (result.success) {
          // Success notification with detailed information
          toast.success('Certificate verified successfully!', {
            description: `Hash: ${result.hash.substring(0, 16)}...`,
            duration: 5000,
            action: {
              label: 'Copy Hash',
              onClick: () => {
                navigator.clipboard.writeText(result.hash)
                toast.success('Hash copied to clipboard')
              }
            }
          })

          // Call success callback if provided
          onVerificationSuccess?.(result.hash)
        } else {
          // Error notification with specific error message
          toast.error('Verification failed', {
            description: result.error,
            duration: 7000
          })

          // Call error callback if provided
          onVerificationError?.(result.error)
        }
      } catch (error) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'

        toast.error('Verification failed', {
          description: errorMessage,
          duration: 7000
        })

        onVerificationError?.(errorMessage)
      }
    })
  }

  return (
    <Button
      onClick={handleVerification}
      disabled={isPending}
      variant={variant}
      size={size}
      className={`relative transition-all duration-200 ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  )
}