'use client'

import dynamic from 'next/dynamic'
import type { SupplierWithCertificates } from '<ecolens>/lib/types'

const CertificateGallery = dynamic(
  () => import('./CertificateGallery').then((mod) => mod.CertificateGallery),
  { 
    loading: () => <p>Loading certificates...</p>,
    ssr: false 
  }
)

export { CertificateGallery }
export default CertificateGallery
