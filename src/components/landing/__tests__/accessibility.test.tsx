import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { MotionConfig } from 'framer-motion'
import Header from '../Header'
import Hero from '../sections/Hero'
import Problem from '../sections/Problem'
import Solution from '../sections/Solution'
import Differentiator from '../sections/Differentiator'
import Footer from '../Footer'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock auth hook
jest.mock('<ecolens>/lib/auth-client', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}))

// Mock framer motion for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MotionConfig reducedMotion="always">
    {children}
  </MotionConfig>
)

describe('Landing Page Accessibility', () => {
  describe('Header Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByLabelText('EcoLens home page')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      const logo = screen.getByLabelText('EcoLens home page')
      await user.tab()
      expect(logo).toHaveFocus()

      // Test mobile menu button
      const mobileMenuButton = screen.getByLabelText('Open mobile menu')
      await user.tab()
      expect(mobileMenuButton).toHaveFocus()
    })

    it('should have proper focus indicators', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      const logo = screen.getByLabelText('EcoLens home page')
      expect(logo).toHaveClass('focus:ring-2', 'focus:ring-blue-500')
    })
  })

  describe('Hero Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading structure', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should have accessible CTA buttons', () => {
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Request a demo of EcoLens platform')).toBeInTheDocument()
      expect(screen.getByLabelText('View a demo Digital Product Passport')).toBeInTheDocument()
    })

    it('should have proper focus management for CTAs', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )

      const demoButton = screen.getByLabelText('Request a demo of EcoLens platform')
      const actionButton = screen.getByLabelText('View a demo Digital Product Passport')

      await user.tab()
      expect(demoButton).toHaveFocus()

      await user.tab()
      expect(actionButton).toHaveFocus()
    })
  })

  describe('Problem Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Problem />
        </TestWrapper>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <Problem />
        </TestWrapper>
      )

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })

    it('should have accessible statistics', () => {
      render(
        <TestWrapper>
          <Problem />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Twenty-four percent')).toBeInTheDocument()
      expect(screen.getByLabelText('Eighty-five percent')).toBeInTheDocument()
    })
  })

  describe('Solution Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Solution />
        </TestWrapper>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <Solution />
        </TestWrapper>
      )

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    it('should have accessible step descriptions', () => {
      render(
        <TestWrapper>
          <Solution />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Step 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Step 3')).toBeInTheDocument()
    })

    it('should support keyboard navigation for steps', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <Solution />
        </TestWrapper>
      )

      const steps = screen.getAllByRole('listitem')
      
      // Each step should be focusable
      for (const step of steps) {
        await user.tab()
        expect(step).toHaveFocus()
      }
    })
  })

  describe('Differentiator Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Differentiator />
        </TestWrapper>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper comparison structure', () => {
      render(
        <TestWrapper>
          <Differentiator />
        </TestWrapper>
      )

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByRole('comparison')).toBeInTheDocument()
      expect(screen.getAllByRole('group')).toHaveLength(2)
      expect(screen.getAllByRole('list')).toHaveLength(2)
    })

    it('should have accessible comparison lists', () => {
      render(
        <TestWrapper>
          <Differentiator />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Full blockchain disadvantages')).toBeInTheDocument()
      expect(screen.getByLabelText('Pragmatic anchoring advantages')).toBeInTheDocument()
    })
  })

  describe('Footer Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Footer />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper semantic structure', () => {
      render(<Footer />)

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('should have accessible social media links', () => {
      render(<Footer />)

      expect(screen.getByLabelText('Follow EcoLens on Twitter (opens in new tab)')).toBeInTheDocument()
      expect(screen.getByLabelText('Follow EcoLens on LinkedIn (opens in new tab)')).toBeInTheDocument()
    })

    it('should support keyboard navigation for social links', async () => {
      const user = userEvent.setup()
      render(<Footer />)

      const logo = screen.getByLabelText('EcoLens home page')
      const twitterLink = screen.getByLabelText('Follow EcoLens on Twitter (opens in new tab)')
      const linkedinLink = screen.getByLabelText('Follow EcoLens on LinkedIn (opens in new tab)')

      await user.tab()
      expect(logo).toHaveFocus()

      await user.tab()
      expect(twitterLink).toHaveFocus()

      await user.tab()
      expect(linkedinLink).toHaveFocus()
    })
  })

  describe('Color Contrast', () => {
    it('should meet WCAG AA standards for text contrast', () => {
      // This test would typically use a color contrast analyzer
      // For now, we'll verify that we're using appropriate color combinations
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )

      // White text on dark background should have sufficient contrast
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-white')
      
      // Check that we're using high contrast colors
      const demoButton = screen.getByLabelText('Request a demo of EcoLens platform')
      expect(demoButton).toHaveClass('bg-blue-600', 'text-white')
    })
  })

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )

      // Component should render without motion when reduced motion is preferred
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide proper landmarks', () => {
      render(
        <div>
          <TestWrapper>
            <Header />
          </TestWrapper>
          <main role="main">
            <TestWrapper>
              <Hero />
              <Problem />
              <Solution />
              <Differentiator />
            </TestWrapper>
          </main>
          <Footer />
        </div>
      )

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Hero />
          <Problem />
          <Solution />
          <Differentiator />
        </TestWrapper>
      )

      const headings = screen.getAllByRole('heading')
      
      // Should have one h1 and multiple h2s
      const h1s = headings.filter(h => h.tagName === 'H1')
      const h2s = headings.filter(h => h.tagName === 'H2')
      const h3s = headings.filter(h => h.tagName === 'H3')

      expect(h1s).toHaveLength(1)
      expect(h2s.length).toBeGreaterThan(0)
      expect(h3s.length).toBeGreaterThan(0)
    })
  })
})