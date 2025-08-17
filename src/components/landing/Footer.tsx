import Link from 'next/link'
import { Twitter, Linkedin, Globe } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border" role="contentinfo" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
          {/* Company Branding */}
          <div className="flex flex-col items-center md:items-start space-y-3 order-1 md:order-1">
            <Link 
              href="/" 
              className="flex items-center space-x-3 text-2xl sm:text-3xl font-heading font-bold text-foreground hover:text-primary transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg px-3 py-2 hover:scale-105"
              aria-label="EcoLens home page"
            >
              <Globe className="w-8 h-8 text-primary" />
              <span>EcoLens</span>
            </Link>
            <p className="text-sm sm:text-base text-muted-foreground text-center md:text-left max-w-xs">
              The trust engine for modern fashion, turning complex supply chains into clear, verifiable stories.
            </p>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center space-x-4 sm:space-x-6 order-2 md:order-3" role="group" aria-label="Social media links">
            <Link
              href="https://twitter.com/ecolens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary focus:text-primary transition-all duration-200 p-3 rounded-lg hover:bg-accent focus:bg-accent touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-110"
              aria-label="Follow EcoLens on Twitter (opens in new tab)"
            >
              <Twitter size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
            </Link>
            <Link
              href="https://linkedin.com/company/ecolens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary focus:text-primary transition-all duration-200 p-3 rounded-lg hover:bg-accent focus:bg-accent touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-110"
              aria-label="Follow EcoLens on LinkedIn (opens in new tab)"
            >
              <Linkedin size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
            </Link>
          </div>

          {/* Copyright Notice */}
          <div className="text-center order-3 md:order-2">
            <p className="text-sm sm:text-base text-muted-foreground">
              © {currentYear} EcoLens. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Building trust through transparency
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}