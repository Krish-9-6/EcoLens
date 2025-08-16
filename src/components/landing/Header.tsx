"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '<ecolens>/components/ui/button'
import { useAuth } from '<ecolens>/lib/auth-client'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside or on links
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <motion.header
      role="banner"
      aria-label="Site header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav role="navigation" aria-label="Main navigation" className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 z-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105"
            aria-label="EcoLens home page"
          >
            <div className={`text-2xl sm:text-3xl font-heading font-bold transition-colors duration-300 ${
              isScrolled ? 'text-black' : 'text-white'
            }`}>
              EcoLens
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </Link>

          {/* Desktop Navigation Buttons */}
          <div className="hidden sm:flex items-center space-x-3 md:space-x-4" role="group" aria-label="User account actions">
            {loading ? (
              // Loading state - show skeleton buttons
              <div className="flex items-center space-x-3 md:space-x-4" aria-live="polite" aria-label="Loading user authentication status">
                <div className="w-20 h-10 bg-muted rounded-lg animate-pulse" aria-hidden="true" />
                <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" aria-hidden="true" />
              </div>
            ) : user ? (
              // Authenticated state - show dashboard button
              <Button asChild variant="default" size="lg" className="font-heading font-semibold">
                <Link href="/dashboard" aria-label="Go to your dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              // Unauthenticated state - show login and signup buttons
              <div className="flex items-center space-x-3 md:space-x-4">
                <Button 
                  asChild 
                  variant="ghost" 
                  size="lg" 
                  className={`font-heading transition-colors duration-300 ${
                    isScrolled ? 'text-black hover:text-emerald-600 hover:bg-slate-100' : 'text-white hover:text-emerald-400 hover:bg-white/10'
                  }`}
                >
                  <Link href="/auth/login" aria-label="Login to your account">Login</Link>
                </Button>
                <Button asChild variant="default" size="lg" className="font-heading font-semibold">
                  <Link href="/auth/signup" aria-label="Create a new account">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden mobile-menu-container">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${
                isScrolled ? 'text-black hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-haspopup="true"
            >
              {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <motion.div
                id="mobile-menu"
                role="menu"
                aria-label="Mobile navigation menu"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-20 right-4 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-elegant-lg py-3 min-w-[220px]"
              >
                {loading ? (
                  // Loading state
                  <div className="px-4 py-2 space-y-3" aria-live="polite" aria-label="Loading user authentication status">
                    <div className="w-full h-10 bg-muted rounded-lg animate-pulse" aria-hidden="true" />
                    <div className="w-full h-10 bg-muted rounded-lg animate-pulse" aria-hidden="true" />
                  </div>
                ) : user ? (
                  // Authenticated state
                  <div className="px-4 py-2">
                    <Button 
                      asChild 
                      variant="default" 
                      size="lg" 
                      className="w-full justify-center font-heading font-semibold" 
                      onClick={closeMobileMenu}
                    >
                      <Link href="/dashboard" role="menuitem" aria-label="Go to your dashboard">Go to Dashboard</Link>
                    </Button>
                  </div>
                ) : (
                  // Unauthenticated state
                  <div className="px-4 py-2 space-y-3">
                    <Button 
                      asChild 
                      variant="nav" 
                      size="lg" 
                      className="w-full justify-center font-heading" 
                      onClick={closeMobileMenu}
                    >
                      <Link href="/auth/login" role="menuitem" aria-label="Login to your account">Login</Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="default" 
                      size="lg" 
                      className="w-full justify-center font-heading font-semibold" 
                      onClick={closeMobileMenu}
                    >
                      <Link href="/auth/signup" role="menuitem" aria-label="Create a new account">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </nav>
      </div>
    </motion.header>
  )
}