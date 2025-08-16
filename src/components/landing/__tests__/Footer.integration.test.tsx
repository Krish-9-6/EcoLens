import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from '../Footer'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Footer Integration Tests', () => {
  it('integrates well with the existing design system', () => {
    render(
      <div className="min-h-screen bg-slate-900">
        <main className="flex-1">
          <div className="h-96 bg-slate-800">
            {/* Mock main content */}
            <h1 className="text-white p-8">Main Content</h1>
          </div>
        </main>
        <Footer />
      </div>
    )

    // Verify Footer renders within the layout
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()

    // Verify it has the correct dark theme styling
    expect(footer).toHaveClass('bg-slate-900', 'border-t', 'border-slate-800')

    // Verify branding is visible
    const brandLink = screen.getByRole('link', { name: 'EcoLens' })
    expect(brandLink).toBeInTheDocument()
    expect(brandLink).toHaveClass('text-white')

    // Verify social links are present
    const twitterLink = screen.getByLabelText('Follow EcoLens on Twitter')
    const linkedinLink = screen.getByLabelText('Follow EcoLens on LinkedIn')
    expect(twitterLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
  })

  it('maintains proper spacing and layout in a full page context', () => {
    render(
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-900 h-16">
          <div className="text-white p-4">Header</div>
        </header>
        <main className="flex-1 bg-slate-800">
          <div className="p-8 text-white">Main Content Area</div>
        </main>
        <Footer />
      </div>
    )

    const footer = screen.getByRole('contentinfo')
    
    // Verify the footer has proper container structure
    const container = footer.querySelector('.max-w-7xl')
    expect(container).toBeInTheDocument()

    // Verify responsive padding is applied
    const paddingContainer = footer.querySelector('[class*="px-4"][class*="py-8"]')
    expect(paddingContainer).toBeInTheDocument()

    // Verify the flex layout works properly
    const flexContainer = footer.querySelector('.flex.flex-col.md\\:flex-row')
    expect(flexContainer).toBeInTheDocument()
  })

  it('works correctly with different viewport sizes', () => {
    // Test mobile layout
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    
    // Verify responsive classes are present
    const flexContainer = footer.querySelector('.flex-col.md\\:flex-row')
    expect(flexContainer).toBeInTheDocument()

    // Verify spacing classes for mobile
    const spacingContainer = footer.querySelector('.space-y-4.md\\:space-y-0')
    expect(spacingContainer).toBeInTheDocument()
  })

  it('exports correctly and can be imported', () => {
    // This test verifies that the component can be imported and rendered
    // without any module resolution issues
    expect(Footer).toBeDefined()
    expect(typeof Footer).toBe('function')

    const { container } = render(<Footer />)
    expect(container.firstChild).toBeInTheDocument()
  })
})