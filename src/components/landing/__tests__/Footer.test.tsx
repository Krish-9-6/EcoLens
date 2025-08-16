import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Footer from '../Footer'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Footer Component', () => {
  beforeEach(() => {
    // Mock the current year to ensure consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the Footer component', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('displays the EcoLens branding', () => {
    render(<Footer />)
    
    const brandLink = screen.getByRole('link', { name: 'EcoLens' })
    expect(brandLink).toBeInTheDocument()
    expect(brandLink).toHaveAttribute('href', '/')
    
    const tagline = screen.getByText('The trust engine for the new era of fashion')
    expect(tagline).toBeInTheDocument()
  })

  it('displays the copyright notice with current year', () => {
    render(<Footer />)
    
    const copyright = screen.getByText('© 2024 EcoLens. All rights reserved.')
    expect(copyright).toBeInTheDocument()
  })

  it('displays social media links with proper attributes', () => {
    render(<Footer />)
    
    // Twitter link
    const twitterLink = screen.getByRole('link', { name: /follow ecolens on twitter/i })
    expect(twitterLink).toBeInTheDocument()
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/ecolens')
    expect(twitterLink).toHaveAttribute('target', '_blank')
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
    
    // LinkedIn link
    const linkedinLink = screen.getByRole('link', { name: /follow ecolens on linkedin/i })
    expect(linkedinLink).toBeInTheDocument()
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/ecolens')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('has proper accessibility attributes', () => {
    render(<Footer />)
    
    // Check for aria-labels on social media links
    const twitterLink = screen.getByLabelText('Follow EcoLens on Twitter')
    const linkedinLink = screen.getByLabelText('Follow EcoLens on LinkedIn')
    
    expect(twitterLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
  })

  it('applies correct CSS classes for styling', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('bg-slate-900', 'border-t', 'border-slate-800')
  })

  it('has responsive layout classes', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    // Check for responsive flex classes
    const container = footer.querySelector('.flex')
    expect(container).toBeInTheDocument()
  })

  it('renders social media icons', () => {
    render(<Footer />)
    
    // Check that Lucide icons are rendered (they should have SVG elements)
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('aria-label')?.includes('Follow EcoLens')
    )
    
    expect(socialLinks).toHaveLength(2)
    
    // Each social link should contain an SVG (Lucide icon)
    socialLinks.forEach(link => {
      const svg = link.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  it('handles hover states with proper CSS classes', () => {
    render(<Footer />)
    
    const brandLink = screen.getByRole('link', { name: 'EcoLens' })
    expect(brandLink).toHaveClass('hover:text-slate-300')
    
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('aria-label')?.includes('Follow EcoLens')
    )
    
    socialLinks.forEach(link => {
      expect(link).toHaveClass('hover:text-white', 'hover:bg-slate-800')
    })
  })

  it('maintains proper spacing and layout structure', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    // Check for proper container structure
    const maxWidthContainer = footer.querySelector('.max-w-7xl')
    expect(maxWidthContainer).toBeInTheDocument()
    
    // Check for proper padding
    const paddingContainer = footer.querySelector('[class*="py-8"]')
    expect(paddingContainer).toBeInTheDocument()
  })
})