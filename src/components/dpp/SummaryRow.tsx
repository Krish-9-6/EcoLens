import { twMerge } from "tailwind-merge"
import clsx from "clsx"
import { CheckCircle2, Factory, Landmark, TimerReset } from "lucide-react"

export type SummaryRowProps = {
  className?: string
  totalSuppliers: number
  tiersPresent: (1 | 2 | 3)[]
  verifiedCount: number
  totalCertificates: number
  lastUpdatedISO?: string | null
}

export function SummaryRow({
  className,
  totalSuppliers,
  tiersPresent,
  verifiedCount,
  totalCertificates,
  lastUpdatedISO,
}: SummaryRowProps) {
  const stat = "flex items-center gap-3 bg-white rounded-lg border p-3"
  const label = "text-xs text-gray-500"
  const value = "text-sm font-semibold text-gray-900"

  const formattedUpdated = lastUpdatedISO
    ? new Date(lastUpdatedISO).toLocaleString()
    : "—"

  const tiersText = tiersPresent.length > 0 ? `Tiers ${tiersPresent.sort((a,b)=>a-b).join(", ")}` : "No tiers"

  return (
    <div id="summary" className={twMerge(clsx("grid grid-cols-2 md:grid-cols-4 gap-3", className))}>
      <div className={stat} aria-label="Total suppliers">
        <Factory className="h-4 w-4 text-gray-500" />
        <div>
          <div className={label}>Suppliers</div>
          <div className={value}>{totalSuppliers}</div>
        </div>
      </div>

      <div className={stat} aria-label="Tiers present">
        <Landmark className="h-4 w-4 text-gray-500" />
        <div>
          <div className={label}>Tiers</div>
          <div className={value}>{tiersText}</div>
        </div>
      </div>

      <div className={stat} aria-label="Verified certificates">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <div>
          <div className={label}>Verification</div>
          <div className={value}>{verifiedCount} / {totalCertificates} Verified</div>
        </div>
      </div>

      <div className={stat} aria-label="Last updated">
        <TimerReset className="h-4 w-4 text-gray-500" />
        <div>
          <div className={label}>Last Updated</div>
          <div className={value}>{formattedUpdated}</div>
        </div>
      </div>
    </div>
  )
}

export default SummaryRow
