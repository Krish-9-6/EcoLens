'use client'

import { twMerge } from "tailwind-merge"
import clsx from "clsx"
import type { SupplierWithCertificates } from "<ecolens>/lib/types"

export type JourneyStepProps = {
  index: number
  total: number
  supplier: SupplierWithCertificates
  onViewCertificates?: (supplierId: string) => void
  className?: string
}

export function JourneyStep({ index, total, supplier, onViewCertificates, className }: JourneyStepProps) {
  const stepNumber = index + 1
  const isLast = stepNumber === total
  const tierLabel = supplier.tier === 3 ? "Raw Materials" : supplier.tier === 2 ? "Manufacturing" : "Final Assembly"
  const certCount = supplier.certificates.length

  const colors = (
    supplier.tier === 3
      ? { dot: "bg-green-500 border-green-200", line: "bg-green-200" }
      : supplier.tier === 2
      ? { dot: "bg-orange-500 border-orange-200", line: "bg-orange-200" }
      : { dot: "bg-red-500 border-red-200", line: "bg-red-200" }
  )

  const dispatchHover = (enter: boolean) => {
    const ev = new CustomEvent('timeline-hover', { detail: { supplierId: supplier.id, enter } })
    window.dispatchEvent(ev)
  }

  return (
    <li
      id={`supplier-${supplier.id}`}
      className={twMerge(clsx("relative flex items-start gap-4 pb-8 last:pb-0 group", className))}
      onMouseEnter={() => dispatchHover(true)}
      onMouseLeave={() => dispatchHover(false)}
    >
      {/* Vertical line */}
      {!isLast && (
        <div
          className={twMerge(
            "absolute left-4 top-8 w-0.5 -translate-x-0.5",
            colors.line,
            "motion-safe:animate-[grow_800ms_ease-out_forwards] origin-top",
          )}
          style={{ height: "calc(100% - 2rem)" }}
          aria-hidden="true"
        />
      )}

      {/* Numbered dot */}
      <div className="relative flex-shrink-0">
        <div className={twMerge("w-8 h-8 rounded-full border-4 text-xs font-bold text-white grid place-items-center", colors.dot)}>
          {stepNumber}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {supplier.name}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-background text-foreground border-border">
            Tier {supplier.tier} • {tierLabel}
          </span>
          <button
            type="button"
            onClick={() => onViewCertificates?.(supplier.id)}
            className="ml-auto inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-muted text-foreground hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`View ${certCount} certificates for ${supplier.name}`}
          >
            {certCount} Cert{certCount === 1 ? "" : "s"}
          </button>
        </div>

        {/* Collapsible details using native details/summary for a11y */}
        <details className="rounded-lg border bg-card border-border">
          <summary className="list-none cursor-pointer select-none px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg">
            <span className="underline decoration-dotted">Details</span>
          </summary>
          <div className="px-3 py-3 text-sm text-muted-foreground border-t border-border">
            <p><span className="font-medium">Location:</span> {supplier.location}</p>
            {supplier.certificates.length > 0 && (
              <p className="mt-1"><span className="font-medium">Certificates:</span> {supplier.certificates.length}</p>
            )}
          </div>
        </details>
      </div>
    </li>
  )}

export default JourneyStep

/*
 * Keyframes for the vertical line grow animation.
 * Tailwind doesn't ship with this custom animation, but we can use a small inline declaration via CSS-in-JS style tag at app root if needed.
 * For now, we rely on a general class present in globals (optional enhancement).
 */
