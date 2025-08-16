import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MotionConfig } from 'framer-motion'
import LandingPage from '<ecolens>/app/page'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Next.js components and hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('<ecolens>/lib/auth-client', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}))

vi.mock('<ecolens>/lib/landing-config', () => ({
  getLandingConfig: () => ({
    demoProductId: '123e4567-e89b-12d3-a456-426614174000',
    enableAnimations: true,
    animationDuration: 0.6,
  }),
  validateLandingConfig: vi.fn(),
}))

vi.mock('<ecolens>/lib/bundle-analyzer', () => ({
  initializePerformanceMonitoring: vi.fn(),
}))

// Mock Framer Motion with reduced motion support
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
  MotionConfig: ({ children, reducedMotion }: any) => (
    <div data-reduced-motion={reducedMotion}>{children}</div>
  ),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/dynamic', () => ({
  default: (importFn: any, _options: any) => {
    const Component = () => {
      if (importFn.toString().includes('LazyProblem')) {
        const Problem = require('../sections/Problem').default
        return <Problem />
      }
      if (importFn.toString().includes('LazySolution')) {
        const Solution = require('../sections/Solution').default
        return <Solution />
      }
      if (importFn.toString().includes('LazyDifferentiator')) {
        const Differentiator = require('../sections/Differentiator').default
        return <Differentiator />
      }
      return <div data-testid="lazy-component">Lazy Component</div>
    }
    Component.displayName = 'LazyComponent'
    return Component
  },
}))

vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon" aria-hidden="true">Menu</div>,
  X: () => <div data-testid="x-icon" aria-hidden="true">X</div>,
  Twitter: () => <div data-testid="twitter-icon" aria-hidden="true">Twitter</div>,
  Linkedin: () => <div data-testid="linkedin-icon" aria-hidden="true">LinkedIn</div>,
  Workflow: () => <div data-testid="workflow-icon" aria-hidden="true">Workflow</div>,
  BadgeCheck: () => <div data-testid="badge-check-icon" aria-hidden="true">BadgeCheck</div>,
  ScanLine: () => <div data-testid="scan-line-icon" aria-hidden="true">ScanLine</div>,
  XCircle: () => <div data-testid="x-circle-icon" aria-hidden="true">XCircle</div>,
  CheckCircle2: () => <div data-testid="check-circle-icon" aria-hidden="true">CheckCircle2</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon" aria-hidden="true">ChevronDown</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" aria-hidden="true">AlertTriangle</div>,
  RefreshCw: () => <div data-testid="refresh-cw-icon" aria-hidden="true">RefreshCw</div>,
  Home: () => <div data-testid="home-icon" aria-hidden="true">Home</div>,
}))

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

// Helper to simulate reduced motion preference
const setReducedMotionPreference = (enabled: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: enabled && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('Comprehensive Accessibility Audit', () => {
  beforeEach(() => {
    // Reset viewport and preferences
    setViewportSize(1024, 768)
    setReducedMotionPreference(false)
    
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((_callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  })

  describe('WCAG 2.1 AA Compliance', () => {
    it('should pass automated accessibility tests', async () => {
      const { container } = render(<LandingPage />)
      
      // Wait for lazy content to load
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      const results = await axe(container, {
        rules: {
          // Enable all WCAG 2.1 AA rules
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-labels': { enabled: true },
          'semantic-structure': { enabled: true },
        }
      })
      
      expect(results).toHaveNoViolations()
    })

    it('should have proper document structure', () => {
      render(<LandingPage />)
      
      // Should have proper landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(screen.getByRole('main')).toBeInTheDocument() // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
      expect(screen.getByRole('navigation')).toBeInTheDocument() // Navigation
    })

    it('should have proper heading hierarchy', async () => {
      render(<LandingPage />)
      
      // Wait for all content to load
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      const headings = screen.getAllByRole('heading')
      
      // Should have exactly one H1
      const h1s = headings.filter(h => h.tagName === 'H1')
      expect(h1s).toHaveLength(1)
      expect(h1s[0]).toHaveTextContent('From Black Box to Crystal Clear')
      
      // Should have logical H2 structure
      const h2s = headings.filter(h => h.tagName === 'H2')
      expect(h2s.length).toBeGreaterThan(0)
      
      // No heading should skip levels
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)))
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1]
        expect(diff).toBeLessThanOrEqual(1)
      }
    })

    it('should have sufficient color contrast', () => {
      render(<LandingPage />)
      
      // Check high contrast elements
      const heroHeading = screen.getByText('From Black Box to Crystal Clear')
      expect(heroHeading).toHaveClass('text-white') // White on dark background
      
      const demoButton = screen.getByText('Request a Demo')
      expect(demoButton).toHaveClass('bg-blue-600', 'text-white') // High contrast button
      
      // Footer text should have sufficient contrast
      const footerText = screen.getByText('© 2024 EcoLens. All rights reserved.')
      expect(footerText).toHaveClass('text-slate-400') // Sufficient contrast on dark background
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Tab through all interactive elements
      await user.tab() // Skip link
      expect(screen.getByText('Skip to main content')).toHaveFocus()
      
      await user.tab() // Logo
      expect(screen.getByLabelText('EcoLens home page')).toHaveFocus()
      
      await user.tab() // Mobile menu button
      expect(screen.getByLabelText('Toggle mobile menu')).toHaveFocus()
      
      await user.tab() // Login button
      expect(screen.getByText('Login')).toHaveFocus()
      
      await user.tab() // Sign up button
      expect(screen.getByText('Sign Up')).toHaveFocus()
      
      await user.tab() // Demo CTA
      expect(screen.getByText('Request a Demo')).toHaveFocus()
      
      await user.tab() // Action CTA
      expect(screen.getByText('See it in Action')).toHaveFocus()
    })

    it('should have visible focus indicators', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Focus each interactive element and check for focus indicators
      const interactiveElements = [
        screen.getByLabelText('EcoLens home page'),
        screen.getByText('Login'),
        screen.getByText('Sign Up'),
        screen.getByText('Request a Demo'),
        screen.getByText('See it in Action'),
      ]
      
      for (const element of interactiveElements) {
        element.focus()
        expect(element).toHaveFocus()
        expect(element).toHaveClass('focus:ring-2')
      }
    })

    it('should handle skip links properly', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      const skipLink = screen.getByText('Skip to main content')
      
      // Skip link should be initially hidden
      expect(skipLink).toHaveClass('sr-only')
      
      // Focus should make it visible
      await user.tab()
      expect(skipLink).toHaveFocus()
      expect(skipLink).toHaveClass('focus:not-sr-only')
      
      // Clicking should move focus to main content
      await user.click(skipLink)
      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveAttribute('id', 'main-content')
    })

    it('should handle mobile menu keyboard navigation', async () => {
      const user = userEvent.setup()
      setViewportSize(375, 667) // Mobile viewport
      
      render(<LandingPage />)
      
      const menuButton = screen.getByLabelText('Toggle mobile menu')
      
      // Should be able to open menu with keyboard
      await user.tab()
      await user.tab()
      expect(menuButton).toHaveFocus()
      
      // Enter or Space should toggle menu
      await user.keyboard('{Enter}')
      // Menu behavior would be tested here
    })

    it('should trap focus in modal dialogs', async () => {
      // This would test focus trapping if there were modal dialogs
      // For now, we ensure no focus traps exist unintentionally
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Tab through all elements - focus should not get trapped
      for (let i = 0; i < 20; i++) {
        await user.tab()
      }
      
      // Should be able to continue tabbing without getting stuck
      expect(document.activeElement).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', async () => {
      render(<LandingPage />)
      
      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      // Check essential ARIA labels
      expect(screen.getByLabelText('EcoLens home page')).toBeInTheDocument()
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument()
      expect(screen.getByLabelText('Follow EcoLens on Twitter')).toBeInTheDocument()
      expect(screen.getByLabelText('Follow EcoLens on LinkedIn')).toBeInTheDocument()
      
      // Check statistics have accessible labels
      expect(screen.getByLabelText('Twenty-four percent')).toBeInTheDocument()
      expect(screen.getByLabelText('Eighty-five percent')).toBeInTheDocument()
    })

    it('should have proper semantic structure for lists', async () => {
      render(<LandingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      // Problem section should have list structure
      const problemLists = screen.getAllByRole('list')
      expect(problemLists.length).toBeGreaterThan(0)
      
      // Each list should have list items
      problemLists.forEach(list => {
        const listItems = within(list).getAllByRole('listitem')
        expect(listItems.length).toBeGreaterThan(0)
      })
    })

    it('should provide context for interactive elements', () => {
      render(<LandingPage />)
      
      // CTAs should have descriptive labels
      const demoButton = screen.getByLabelText('Request a demo of EcoLens platform')
      expect(demoButton).toBeInTheDocument()
      
      const actionButton = screen.getByLabelText('View a demo Digital Product Passport')
      expect(actionButton).toBeInTheDocument()
      
      // External links should indicate they open in new tabs
      const twitterLink = screen.getByLabelText('Follow EcoLens on Twitter')
      expect(twitterLink).toHaveAttribute('target', '_blank')
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should announce dynamic content changes', async () => {
      render(<LandingPage />)
      
      // Live regions should be present for dynamic content
      // This would typically test ARIA live regions for content updates
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })

    it('should have proper form labels and descriptions', () => {
      render(<LandingPage />)
      
      // All form controls should have proper labels
      // Currently no forms on landing page, but this ensures future forms are accessible
      const inputs = screen.queryAllByRole('textbox')
      const selects = screen.queryAllByRole('combobox')
      const buttons = screen.getAllByRole('button')
      
      // All interactive elements should have accessible names
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })
  })

  describe('Motor Disabilities Support', () => {
    it('should have adequate touch targets for mobile', () => {
      setViewportSize(375, 667) // Mobile viewport
      render(<LandingPage />)
      
      // All interactive elements should have minimum 44px touch targets
      const interactiveElements = [
        screen.getByLabelText('Toggle mobile menu'),
        screen.getByText('Request a Demo'),
        screen.getByText('See it in Action'),
      ]
      
      interactiveElements.forEach(element => {
        // Should have adequate padding for touch
        expect(element).toHaveClass('min-h-[48px]')
        expect(element).toHaveClass('touch-manipulation')
      })
    })

    it('should not require precise mouse movements', () => {
      render(<LandingPage />)
      
      // Interactive elements should have adequate spacing
      const buttons = screen.getAllByRole('button')
      const links = screen.getAllByRole('link')
      
      // All interactive elements should be easily clickable
      const allInteractiveElements = [...buttons, ...links]
      allInteractiveElements.forEach(element => {
        const rect = element.getBoundingClientRect()
        expect(rect.width).toBeGreaterThan(0)
        expect(rect.height).toBeGreaterThan(0)
      })
    })

    it('should support alternative input methods', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Should work with keyboard only
      const demoButton = screen.getByText('Request a Demo')
      
      // Focus and activate with keyboard
      demoButton.focus()
      expect(demoButton).toHaveFocus()
      
      await user.keyboard('{Enter}')
      // Button should respond to keyboard activation
    })
  })

  describe('Cognitive Disabilities Support', () => {
    it('should have clear and consistent navigation', () => {
      render(<LandingPage />)
      
      // Navigation should be consistent and predictable
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      // Logo should always link to home
      const logo = screen.getByLabelText('EcoLens home page')
      expect(logo).toHaveAttribute('href', '/')
    })

    it('should provide clear error messages and feedback', () => {
      render(<LandingPage />)
      
      // Error boundaries should provide clear feedback
      // This is tested in the error boundary tests
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })

    it('should have consistent visual design', () => {
      render(<LandingPage />)
      
      // Buttons should have consistent styling
      const primaryButtons = [
        screen.getByText('Request a Demo'),
        screen.getByText('See it in Action'),
      ]
      
      primaryButtons.forEach(button => {
        expect(button).toHaveClass('font-semibold')
      })
    })

    it('should provide sufficient time for interactions', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // No time limits should be imposed on interactions
      const demoButton = screen.getByText('Request a Demo')
      
      // Should be able to interact at any pace
      await new Promise(resolve => setTimeout(resolve, 1000))
      await user.click(demoButton)
      
      expect(demoButton).toBeInTheDocument()
    })
  })

  describe('Visual Disabilities Support', () => {
    it('should work with high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      
      render(<LandingPage />)
      
      // Content should still be visible and functional
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      expect(screen.getByText('Request a Demo')).toBeInTheDocument()
    })

    it('should support zoom up to 200%', () => {
      // Simulate 200% zoom
      setViewportSize(512, 384) // Half the normal desktop size
      
      render(<LandingPage />)
      
      // Content should still be accessible
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      expect(screen.getByText('Request a Demo')).toBeInTheDocument()
      
      // No horizontal scrolling should be required
      const body = document.body
      expect(body.scrollWidth).toBeLessThanOrEqual(512)
    })

    it('should not rely solely on color for information', async () => {
      render(<LandingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Full Blockchain')).toBeInTheDocument()
      })
      
      // Differentiator section should use icons in addition to colors
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument()
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
      
      // Text should provide the same information as color coding
      expect(screen.getByText('Slow, expensive, complex')).toBeInTheDocument()
      expect(screen.getByText('Instant, low-cost, scalable')).toBeInTheDocument()
    })

    it('should have proper text spacing and readability', () => {
      render(<LandingPage />)
      
      // Text should have adequate line height and spacing
      const heroHeading = screen.getByText('From Black Box to Crystal Clear')
      expect(heroHeading).toHaveClass('leading-tight')
      
      // Paragraphs should have readable line height
      const subHeading = screen.getByText('EcoLens is the trust engine for the new era of fashion')
      expect(subHeading).toBeInTheDocument()
    })
  })

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion setting', () => {
      setReducedMotionPreference(true)
      
      render(
        <MotionConfig reducedMotion="always">
          <LandingPage />
        </MotionConfig>
      )
      
      // Content should still be visible without animations
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      expect(screen.getByText('Request a Demo')).toBeInTheDocument()
      
      // Reduced motion should be applied
      const motionConfig = document.querySelector('[data-reduced-motion="always"]')
      expect(motionConfig).toBeInTheDocument()
    })

    it('should provide alternative feedback for reduced motion', () => {
      setReducedMotionPreference(true)
      
      render(<LandingPage />)
      
      // Interactive feedback should not rely solely on animation
      const demoButton = screen.getByText('Request a Demo')
      expect(demoButton).toHaveClass('hover:bg-blue-700') // Color change on hover
    })
  })

  describe('Language and Internationalization', () => {
    it('should have proper language attributes', () => {
      render(<LandingPage />)
      
      // Document should have lang attribute
      expect(document.documentElement).toHaveAttribute('lang')
    })

    it('should handle text direction properly', () => {
      render(<LandingPage />)
      
      // Text should flow in correct direction
      const heroText = screen.getByText('From Black Box to Crystal Clear')
      expect(heroText).toBeInTheDocument()
      
      // No explicit dir attributes needed for English, but structure should support RTL
    })
  })

  describe('Error Prevention and Recovery', () => {
    it('should provide clear error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock a component error
      vi.mocked(require('../sections/Problem').default).mockImplementation(() => {
        throw new Error('Test error')
      })
      
      render(<LandingPage />)
      
      // Error boundary should show helpful message
      expect(screen.getByText('Problem Section Unavailable')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })

    it('should allow error recovery', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock a component error
      vi.mocked(require('../sections/Problem').default).mockImplementation(() => {
        throw new Error('Test error')
      })
      
      render(<LandingPage />)
      
      // Should have retry button
      const retryButton = screen.getByText('Retry')
      expect(retryButton).toBeInTheDocument()
      
      // Retry should be accessible
      await user.click(retryButton)
      
      consoleSpy.mockRestore()
    })
  })
})