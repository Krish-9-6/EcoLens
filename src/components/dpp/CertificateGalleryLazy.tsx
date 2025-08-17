'use client'

import dynamic from 'next/dynamic'

const CertificateGallery = dynamic(
  () => import('./CertificateGallery').then((mod) => mod.CertificateGallery),
  { 
    loading: () => <p>Loading certificates...</p>,
    ssr: false 
  }
)

export { CertificateGallery }
export default CertificateGallery
