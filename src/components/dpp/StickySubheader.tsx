import { twMerge } from "tailwind-merge"
import clsx from "clsx"

export type StickySubheaderProps = {
  className?: string
}

/**
 * Sticky, unobtrusive subheader that exposes anchors to key sections of the DPP page.
 */
export function StickySubheader({ className }: StickySubheaderProps) {
  const linkBase =
    "px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"

  return (
    <nav
      aria-label="Page sections"
      className={twMerge(
        clsx(
          "sticky top-0 z-30 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200",
          "shadow-sm",
          className
        )
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <ul className="flex items-center gap-2 overflow-x-auto py-2">
            <li><a className={linkBase} href="#product">Product</a></li>
            <li><a className={linkBase} href="#summary">Summary</a></li>
            <li><a className={linkBase} href="#journey">Journey</a></li>
            <li><a className={linkBase} href="#map">Map</a></li>
            <li><a className={linkBase} href="#certificates">Certificates</a></li>
            <li><a className={linkBase} href="#qr">QR</a></li>
          </ul>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}

export default StickySubheader