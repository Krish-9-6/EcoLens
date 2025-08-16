"use client"

import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import clsx from "clsx"
import { CheckCircle2, Copy, Info, X, ExternalLink } from "lucide-react"

export type CertificateCardProps = {
  id: string
  name: string
  type: string
  issuedDateISO: string
  verifiedAtISO?: string | null
  ledgerHash?: string
  supplierName: string
  supplierTier: 1 | 2 | 3
  className?: string
  onFilterBySupplier?: (supplierName: string) => void
}

export function CertificateCard({
  id,
  name,
  type,
  issuedDateISO,
  verifiedAtISO,
  ledgerHash,
  supplierName,
  supplierTier,
  className,
  onFilterBySupplier,
}: CertificateCardProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const isVerified = Boolean(verifiedAtISO)
  const issued = useMemo(() => {
    try { return new Date(issuedDateISO).toLocaleDateString() } catch { return issuedDateISO }
  }, [issuedDateISO])

  const truncatedHash = useMemo(() => {
    if (!ledgerHash) return "—"
    return ledgerHash.length > 14 ? `${ledgerHash.slice(0, 6)}…${ledgerHash.slice(-6)}` : ledgerHash
  }, [ledgerHash])

  const ribbon = isVerified ? "bg-gradient-to-b from-green-500 to-green-600" : "bg-gradient-to-b from-gray-400 to-gray-500"

  const handleCopy = async () => {
    if (!ledgerHash) return
    try {
      await navigator.clipboard.writeText(ledgerHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={twMerge(clsx(
      "group relative rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-200",
      "hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5",
      "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
      className
    ))}>
      {/* Left ribbon */}
      <span aria-hidden className={twMerge("absolute inset-y-0 left-0 w-1.5", ribbon)} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="flex-1 text-base font-semibold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors">
            {name}
          </h3>
          <time 
            className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md shrink-0" 
            dateTime={issuedDateISO}
          >
            {issued}
          </time>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
            {type}
          </span>
          <button
            type="button"
            onClick={() => onFilterBySupplier?.(supplierName)}
            className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 text-xs font-medium text-gray-700 transition-all"
            aria-label={`Filter by supplier ${supplierName}`}
            title={`Tier ${supplierTier}: ${supplierName}`}
          >
            <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5" />
            Tier {supplierTier}: {supplierName}
          </button>
          {isVerified && (
            <span 
              className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full text-xs font-medium" 
              title={`Verified on-chain at ${new Date(verifiedAtISO as string).toLocaleString()}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 font-mono flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span aria-label="Ledger hash" className="text-gray-700">{truncatedHash}</span>
            {ledgerHash && (
              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                onClick={handleCopy}
                aria-label="Copy full ledger hash"
                title={copied ? "Copied!" : "Copy hash"}
              >
                <Copy className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-lg px-3 py-2 hover:bg-blue-50 transition-all font-medium"
            aria-haspopup="dialog"
          >
            <Info className="h-3.5 w-3.5" /> View Details
          </button>
        </div>
      </div>

      {/* Enhanced modal */}
      {open && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby={`cert-${id}-title`} 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h4 id={`cert-${id}-title`} className="text-lg font-semibold text-gray-900">{name}</h4>
              <button 
                aria-label="Close" 
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors" 
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Supplier</p>
                  <p className="text-gray-600">Tier {supplierTier} — {supplierName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Type</p>
                  <p className="text-gray-600">{type}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Issued</p>
                  <p className="text-gray-600">
                    <time dateTime={issuedDateISO}>{issued}</time>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Status</p>
                  <p className="text-gray-600">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified at {new Date(verifiedAtISO as string).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">Unverified</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-2">Blockchain Ledger Hash</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="font-mono break-all text-xs text-gray-700 mb-2">
                    {ledgerHash ?? '—'}
                  </div>
                  {ledgerHash && (
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border bg-white hover:bg-gray-50 transition-colors"
                        onClick={handleCopy}
                      >
                        <Copy className="h-3 w-3" />
                        {copied ? 'Copied!' : 'Copy hash'}
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => window.open(`https://etherscan.io/tx/${ledgerHash}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on Etherscan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors font-medium" 
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificateCard
