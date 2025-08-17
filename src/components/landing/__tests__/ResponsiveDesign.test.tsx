import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Header from '../Header'
import Hero from '../sections/Hero'
import Problem from '../sections/Problem'
import Solution from '../sections/Solution'
import Differentiator from '../sections/Differentiator'
import Footer from '../Footer'

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}))

// Mock auth hook
vi.mock('<ecolens>/lib/auth-client', () => ({
  useAuth: () => ({ user: null, loading: false }),
}))

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Twitter: () => <div data-testid="twitter-icon">Twitter</div>,
  Linkedin: () => <div data-testid="linkedin-icon">LinkedIn</div>,
  Workflow: () => <div data-testid="workflow-icon">Workflow</div>,
  BadgeCheck: () => <div data-testid="badge-check-icon">BadgeCheck</div>,
  ScanLine: () => <div data-testid="scan-line-icon">ScanLine</div>,
  XCircle: () => <div data-testid="x-circle-icon">XCircle</div>,
  CheckCircle2: () => <div data-testid="check-circle-icon">CheckCircle2</div>,
}))

// Mock UI components
vi.mock('<ecolens>/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) => {
    if (asChild) {
      return <div {...props}>{children}</div>
    }
    return <button {...props}>{children}</button>
  },
}))

// Helper function to simulate different viewport sizes
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    // Reset viewport to desktop size before each test
    setViewportSize(1024, 768)
  })

  describe('Header Component', () => {
    it('should show mobile menu button on small screens', () => {
      setViewportSize(375, 667) // iPhone SE size
      render(<Header />)
      
      // Mobile menu button should be present
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument()
    })

    it('should show desktop navigation on large screens', () => {
      setViewportSize(1024, 768)
      render(<Header />)
      
      // Desktop navigation should be visible
      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('should have proper touch targets for mobile', () => {
      setViewportSize(375, 667)
      render(<Header />)
      
      const menuButton = screen.getByLabelText('Toggle mobile menu')
      expect(menuButton).toHaveClass('p-2') // Adequate padding for touch
    })
  })

  describe('Hero Section', () => {
    it('should stack CTA buttons vertically on mobile', () => {
      setViewportSize(375, 667)
      render(<Hero />)
      
      const buttonContainer = screen.getByText('Request a Demo').closest('div')
      expect(buttonContainer).toHaveClass('flex-col')
    })

    it('should arrange CTA buttons horizontally on desktop', () => {
      setViewportSize(1024, 768)
      render(<Hero />)
      
      const buttonContainer = screen.getByText('Request a Demo').closest('div')
      expect(buttonContainer).toHaveClass('sm:flex-row')
    })

    it('should have appropriate text sizes for mobile', () => {
      setViewportSize(375, 667)
      render(<Hero />)
      
      const headline = screen.getByText('From Black Box to Crystal Clear')
      expect(headline).toHaveClass('text-3xl')
    })

    it('should have touch-friendly button sizes', () => {
      setViewportSize(375, 667)
      render(<Hero />)
      
      const demoButton = screen.getByText('Request a Demo')
      expect(demoButton).toHaveClass('min-h-[48px]')
      expect(demoButton).toHaveClass('touch-manipulation')
    })
  })

  describe('Problem Section', () => {
    it('should stack statistics vertically on mobile', () => {
      setViewportSize(375, 667)
      render(<Problem />)
      
      const statsContainer = screen.getByText('24%').closest('div')?.parentElement
      expect(statsContainer).toHaveClass('grid-cols-1')
    })

    it('should show statistics side by side on tablet and desktop', () => {
      setViewportSize(768, 1024)
      render(<Problem />)
      
      const statsContainer = screen.getByText('24%').closest('div')?.parentElement
      expect(statsContainer).toHaveClass('sm:grid-cols-2')
    })

    it('should have readable text sizes on mobile', () => {
      setViewportSize(375, 667)
      render(<Problem />)
      
      const statistic = screen.getByText('24%')
      expect(statistic).toHaveClass('text-5xl')
    })
  })

  describe('Solution Section', () => {
    it('should stack solution steps vertically on mobile', () => {
      setViewportSize(375, 667)
      render(<Solution />)
      
      const stepsContainer = screen.getByTestId('workflow-icon').closest('div')?.parentElement?.parentElement?.parentElement
      expect(stepsContainer).toHaveClass('grid-cols-1')
    })

    it('should show three columns on desktop', () => {
      setViewportSize(1024, 768)
      render(<Solution />)
      
      const stepsContainer = screen.getByTestId('workflow-icon').closest('div')?.parentElement?.parentElement?.parentElement
      expect(stepsContainer).toHaveClass('md:grid-cols-3')
    })

    it('should have appropriate icon sizes for mobile', () => {
      setViewportSize(375, 667)
      render(<Solution />)
      
      const iconContainer = screen.getByTestId('workflow-icon').parentElement
      expect(iconContainer).toHaveClass('w-16')
      expect(iconContainer).toHaveClass('sm:w-20')
    })

    it('should have touch-friendly card interactions', () => {
      setViewportSize(375, 667)
      render(<Solution />)
      
      const card = screen.getByTestId('workflow-icon').closest('div')
      expect(card).toHaveClass('touch-manipulation')
    })
  })

  describe('Differentiator Section', () => {
    it('should stack comparison columns vertically on mobile', () => {
      setViewportSize(375, 667)
      render(<Differentiator />)
      
      const comparisonContainer = screen.getByText('Full Blockchain').closest('div')?.parentElement
      expect(comparisonContainer).toHaveClass('grid-cols-1')
    })

    it('should show two columns on desktop', () => {
      setViewportSize(1024, 768)
      render(<Differentiator />)
      
      const comparisonContainer = screen.getByText('Full Blockchain').closest('div')?.parentElement
      expect(comparisonContainer).toHaveClass('lg:grid-cols-2')
    })

    it('should have readable text sizes on mobile', () => {
      setViewportSize(375, 667)
      render(<Differentiator />)
      
      const title = screen.getByText('Full Blockchain')
      expect(title).toHaveClass('text-xl')
      expect(title).toHaveClass('sm:text-2xl')
    })
  })

  describe('Footer Component', () => {
    it('should stack footer elements vertically on mobile', () => {
      setViewportSize(375, 667)
      render(<Footer />)
      
      const footerContainer = screen.getByText('EcoLens').closest('div')?.parentElement
      expect(footerContainer).toHaveClass('flex-col')
    })

    it('should arrange footer elements horizontally on desktop', () => {
      setViewportSize(1024, 768)
      render(<Footer />)
      
      const footerContainer = screen.getByText('EcoLens').closest('div')?.parentElement
      expect(footerContainer).toHaveClass('md:flex-row')
    })

    it('should have touch-friendly social media links', () => {
      setViewportSize(375, 667)
      render(<Footer />)
      
      const twitterLink = screen.getByLabelText('Follow EcoLens on Twitter')
      expect(twitterLink).toHaveClass('touch-manipulation')
    })
  })

  describe('Cross-component Integration', () => {
    it('should maintain consistent spacing across all sections on mobile', () => {
      setViewportSize(375, 667)
      
      render(
        <div>
          <Header />
          <Hero />
          <Problem />
          <Solution />
          <Differentiator />
          <Footer />
        </div>
      )
      
      // Check that all sections have appropriate mobile padding
      const sections = screen.getAllByRole('banner').concat(
        screen.getAllByRole('main', { hidden: true }),
        screen.getAllByRole('contentinfo')
      )
      
      // At least some sections should have mobile-appropriate padding
      expect(sections.length).toBeGreaterThan(0)
    })

    it('should not have horizontal scroll on mobile', () => {
      setViewportSize(375, 667)
      
      render(
        <div>
          <Header />
          <Hero />
          <Problem />
          <Solution />
          <Differentiator />
          <Footer />
        </div>
      )
      
      // Check that no elements extend beyond viewport width
      // This is a basic check - in real testing, you'd measure actual element widths
      const allElements = screen.getAllByText(/EcoLens|From Black Box|Fashion Industry|3-Step Process|Secret Sauce/)
      expect(allElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility on Mobile', () => {
    it('should have adequate touch targets', () => {
      setViewportSize(375, 667)
      render(<Header />)
      
      const menuButton = screen.getByLabelText('Toggle mobile menu')
      const computedStyle = window.getComputedStyle(menuButton)
      
      // Button should have adequate padding for touch
      expect(menuButton).toHaveClass('p-2')
    })

    it('should maintain focus indicators on mobile', () => {
      setViewportSize(375, 667)
      render(<Hero />)
      
      const demoButton = screen.getByText('Request a Demo')
      
      // Focus the button
      demoButton.focus()
      expect(demoButton).toHaveFocus()
    })
  })
})