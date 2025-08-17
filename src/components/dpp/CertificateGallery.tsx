"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Filter, CheckCircle2, XCircle } from "lucide-react"
import type { SupplierWithCertificates } from "<ecolens>/lib/types"
import { CertificateCard } from "./CertificateCard"

interface CertificateGalleryProps {
  suppliers: SupplierWithCertificates[];
}

export function CertificateGallery({ suppliers }: CertificateGalleryProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [isClient, setIsClient] = useState(false)

  // Ensure consistent hydration by waiting for client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  const all = useMemo(() => suppliers.flatMap(s => s.certificates.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    issuedDateISO: c.issued_date,
    verifiedAtISO: c.verified_at ?? undefined,
    ledgerHash: c.ledger_entry?.data_hash,
    supplierName: s.name,
    supplierTier: s.tier as 1|2|3,
  }))), [suppliers])

  // Read filters from URL only on client side
  const filterVerified = isClient ? params.get('verified') : null
  const filterType = isClient ? (params.get('type') || '') : ''
  const filterSupplier = isClient ? (params.get('supplier') || '') : ''
  const sort = isClient ? (params.get('sort') || 'newest') : 'newest'

  const filtered = useMemo(() => {
    if (!isClient) return all // Return all certificates during SSR
    
    let out = all
    if (filterVerified === 'true') out = out.filter(c => !!c.verifiedAtISO)
    if (filterVerified === 'false') out = out.filter(c => !c.verifiedAtISO)
    if (filterType) out = out.filter(c => c.type.toLowerCase() === filterType.toLowerCase())
    if (filterSupplier) out = out.filter(c => c.supplierName.toLowerCase() === filterSupplier.toLowerCase())
    switch (sort) {
      case 'oldest':
        out = [...out].sort((a,b) => +new Date(a.issuedDateISO) - +new Date(b.issuedDateISO)); break
      case 'status':
        out = [...out].sort((a,b) => Number(!!b.verifiedAtISO) - Number(!!a.verifiedAtISO)); break
      default:
        out = [...out].sort((a,b) => +new Date(b.issuedDateISO) - +new Date(a.issuedDateISO));
    }
    return out
  }, [all, filterVerified, filterType, filterSupplier, sort, isClient])

  const updateParams = (next: Record<string,string | null>) => {
    if (!isClient) return
    const p = new URLSearchParams(params)
    Object.entries(next).forEach(([k,v]) => { if (v === null) p.delete(k); else p.set(k,v) })
    router.replace(`?${p.toString()}`)
  }

  const clearFilters = () => {
    updateParams({ verified: null, type: null, supplier: null, sort: 'newest' })
  }

  const uniqueTypes = Array.from(new Set(all.map(c => c.type))).sort()
  const uniqueSuppliers = Array.from(new Set(all.map(c => c.supplierName))).sort()
  const hasActiveFilters = isClient && (filterVerified || filterType || filterSupplier || sort !== 'newest')

  if (all.length === 0) {
    return (
      <section className="w-full" aria-labelledby="certificates-heading">
        <h2 id="certificates-heading" className="text-2xl font-bold mb-6 text-foreground">Certificates & Verifications</h2>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No certificates available for this product.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Certificates will appear here once they are added to the supply chain.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full" aria-labelledby="certificates-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="certificates-heading" className="text-2xl font-bold text-foreground">
          Certificates & Verifications
        </h2>
        {isClient && (
          <div className="text-sm text-muted-foreground">
            {filtered.length} of {all.length} certificates
          </div>
        )}
      </div>

      {/* Enhanced Filters - Only show on client side */}
      {isClient && (
        <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <XCircle className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Status</label>
              <select
                className="w-full h-9 rounded-lg border border-border px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={filterVerified ?? ''}
                onChange={(e) => updateParams({ verified: e.target.value || null })}
                aria-label="Filter by verification status"
              >
                <option value="">All statuses</option>
                <option value="true">Verified only</option>
                <option value="false">Unverified only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Type</label>
              <select
                className="w-full h-9 rounded-lg border border-border px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={filterType}
                onChange={(e) => updateParams({ type: e.target.value || null })}
                aria-label="Filter by certificate type"
              >
                <option value="">All types</option>
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Supplier</label>
              <select
                className="w-full h-9 rounded-lg border border-border px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={filterSupplier}
                onChange={(e) => updateParams({ supplier: e.target.value || null })}
                aria-label="Filter by supplier"
              >
                <option value="">All suppliers</option>
                {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Sort by</label>
              <select
                className="w-full h-9 rounded-lg border border-border px-3 text-sm bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                aria-label="Sort certificates"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="status">Verified first</option>
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {filterVerified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {filterVerified === 'true' ? 'Verified' : 'Unverified'}
                    <button
                      onClick={() => updateParams({ verified: null })}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filterType && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Type: {filterType}
                    <button
                      onClick={() => updateParams({ type: null })}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filterSupplier && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Supplier: {filterSupplier}
                    <button
                      onClick={() => updateParams({ supplier: null })}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Certificate list">
        {filtered.map(c => (
          <CertificateCard
            key={c.id}
            id={c.id}
            name={c.name}
            type={c.type}
            issuedDateISO={c.issuedDateISO}
            verifiedAtISO={c.verifiedAtISO}
            ledgerHash={c.ledgerHash}
            supplierName={c.supplierName}
            supplierTier={c.supplierTier}
            onFilterBySupplier={(sName) => updateParams({ supplier: sName })}
          />
        ))}
      </div>

      {/* Enhanced Empty State */}
      {isClient && filtered.length === 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Filter className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No certificates found</h3>
          <p className="text-muted-foreground mb-4">
            No certificates match the selected filters. Try adjusting your search criteria.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            Clear all filters
          </button>
        </div>
      )}
    </section>
  )
}