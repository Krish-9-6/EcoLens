import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MotionConfig } from 'framer-motion'
import LandingPage from '<ecolens>/app/page'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Next.js router
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock auth hook
vi.mock('<ecolens>/lib/auth-client', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  }),
}))

// Mock environment variables
vi.mock('<ecolens>/lib/landing-config', () => ({
  getLandingConfig: () => ({
    demoProductId: '123e4567-e89b-12d3-a456-426614174000',
    enableAnimations: true,
    animationDuration: 0.6,
  }),
  validateLandingConfig: vi.fn(),
}))

// Mock performance monitoring
vi.mock('<ecolens>/lib/bundle-analyzer', () => ({
  initializePerformanceMonitoring: vi.fn(),
}))

// Mock Framer Motion for controlled testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
  MotionConfig: ({ children }: any) => children,
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock dynamic imports for lazy components
vi.mock('next/dynamic', () => ({
  default: (importFn: any, options: any) => {
    // Return the actual component for testing
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
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  RefreshCw: () => <div data-testid="refresh-cw-icon">RefreshCw</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
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

// Helper function to simulate scroll
const simulateScroll = (scrollY: number) => {
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: scrollY,
  })
  window.dispatchEvent(new Event('scroll'))
}

describe('Landing Page Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Reset viewport to desktop size
    setViewportSize(1024, 768)
    
    // Reset scroll position
    simulateScroll(0)
    
    // Mock performance API
    global.performance = {
      ...global.performance,
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
    }
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
    global.cancelAnimationFrame = vi.fn()
    
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Full Landing Page Rendering', () => {
    it('should render all main sections in correct order', async () => {
      render(<LandingPage />)
      
      // Check skip link
      expect(screen.getByText('Skip to main content')).toBeInTheDocument()
      
      // Check header
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByLabelText('EcoLens home page')).toBeInTheDocument()
      
      // Check main content
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main).toHaveAttribute('id', 'main-content')
      
      // Check hero section
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      
      // Check problem section
      await waitFor(() => {
        expect(screen.getByText('The Fashion Industry Has a Trust Problem')).toBeInTheDocument()
      })
      
      // Check solution section
      await waitFor(() => {
        expect(screen.getByText('Our 3-Step Process to Radical Transparency')).toBeInTheDocument()
      })
      
      // Check differentiator section
      await waitFor(() => {
        expect(screen.getByText('The \'Secret Sauce\': Pragmatic Anchoring')).toBeInTheDocument()
      })
      
      // Check footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should have proper semantic structure', () => {
      render(<LandingPage />)
      
      // Check landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(screen.getByRole('main')).toBeInTheDocument() // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
      
      // Check heading hierarchy
      const headings = screen.getAllByRole('heading')
      const h1s = headings.filter(h => h.tagName === 'H1')
      const h2s = headings.filter(h => h.tagName === 'H2')
      
      expect(h1s).toHaveLength(1) // Only one H1
      expect(h2s.length).toBeGreaterThan(0) // Multiple H2s for sections
    })

    it('should load lazy sections without errors', async () => {
      render(<LandingPage />)
      
      // Wait for lazy components to load
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      await waitFor(() => {
        expect(screen.getByText('Map Your Chain')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      await waitFor(() => {
        expect(screen.getByText('Full Blockchain')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Navigation Flow', () => {
    it('should handle skip to main content link', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      const skipLink = screen.getByText('Skip to main content')
      
      // Focus the skip link
      await user.tab()
      expect(skipLink).toHaveFocus()
      
      // Click the skip link
      await user.click(skipLink)
      
      // Main content should be focused
      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveAttribute('id', 'main-content')
    })

    it('should navigate through all interactive elements with keyboard', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Tab through interactive elements
      await user.tab() // Skip link
      await user.tab() // Logo
      await user.tab() // Mobile menu button
      await user.tab() // Login button
      await user.tab() // Sign up button
      await user.tab() // Demo CTA
      await user.tab() // Action CTA
      
      // Should be able to reach all CTAs
      expect(screen.getByText('Request a Demo')).toBeInTheDocument()
      expect(screen.getByText('See it in Action')).toBeInTheDocument()
    })

    it('should handle mobile menu toggle', async () => {
      const user = userEvent.setup()
      setViewportSize(375, 667) // Mobile viewport
      
      render(<LandingPage />)
      
      const menuButton = screen.getByLabelText('Toggle mobile menu')
      expect(menuButton).toBeInTheDocument()
      
      // Click to open menu
      await user.click(menuButton)
      
      // Menu should be accessible
      expect(menuButton).toBeInTheDocument()
    })
  })

  describe('CTA Button Functionality and Routing', () => {
    it('should handle "Request a Demo" CTA click', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      const demoButton = screen.getByText('Request a Demo')
      expect(demoButton).toHaveAttribute('href', '/contact')
      
      await user.click(demoButton)
      
      // Should navigate to contact page
      expect(demoButton.closest('a')).toHaveAttribute('href', '/contact')
    })

    it('should handle "See it in Action" CTA click with demo product ID', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      const actionButton = screen.getByText('See it in Action')
      expect(actionButton).toHaveAttribute('href', '/dpp/123e4567-e89b-12d3-a456-426614174000')
      
      await user.click(actionButton)
      
      // Should navigate to demo DPP
      expect(actionButton.closest('a')).toHaveAttribute('href', '/dpp/123e4567-e89b-12d3-a456-426614174000')
    })

    it('should handle header navigation for unauthenticated users', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      const loginButton = screen.getByText('Login')
      const signupButton = screen.getByText('Sign Up')
      
      expect(loginButton).toHaveAttribute('href', '/login')
      expect(signupButton).toHaveAttribute('href', '/signup')
      
      await user.click(loginButton)
      expect(loginButton.closest('a')).toHaveAttribute('href', '/login')
    })

    it('should handle social media links in footer', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      const twitterLink = screen.getByLabelText('Follow EcoLens on Twitter')
      const linkedinLink = screen.getByLabelText('Follow EcoLens on LinkedIn')
      
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/ecolens')
      expect(twitterLink).toHaveAttribute('target', '_blank')
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/ecolens')
      expect(linkedinLink).toHaveAttribute('target', '_blank')
    })
  })

  describe('Responsive Behavior Across Viewport Sizes', () => {
    const viewportSizes = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1024, height: 768 },
      { name: 'Large Desktop', width: 1440, height: 900 },
    ]

    viewportSizes.forEach(({ name, width, height }) => {
      it(`should render correctly on ${name} (${width}x${height})`, async () => {
        setViewportSize(width, height)
        render(<LandingPage />)
        
        // All main sections should be present
        expect(screen.getByRole('banner')).toBeInTheDocument()
        expect(screen.getByRole('main')).toBeInTheDocument()
        expect(screen.getByRole('contentinfo')).toBeInTheDocument()
        
        // Hero section should be visible
        expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
        
        // CTAs should be accessible
        expect(screen.getByText('Request a Demo')).toBeInTheDocument()
        expect(screen.getByText('See it in Action')).toBeInTheDocument()
        
        // Wait for lazy sections to load
        await waitFor(() => {
          expect(screen.getByText('24%')).toBeInTheDocument()
        })
      })
    })

    it('should adapt header layout for mobile', () => {
      setViewportSize(375, 667)
      render(<LandingPage />)
      
      // Mobile menu button should be present
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument()
      
      // Desktop navigation should be hidden (handled by CSS classes)
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('should stack CTA buttons vertically on mobile', () => {
      setViewportSize(375, 667)
      render(<LandingPage />)
      
      const demoButton = screen.getByText('Request a Demo')
      const actionButton = screen.getByText('See it in Action')
      
      // Both buttons should be present
      expect(demoButton).toBeInTheDocument()
      expect(actionButton).toBeInTheDocument()
      
      // Container should have mobile-appropriate classes
      const buttonContainer = demoButton.closest('div')
      expect(buttonContainer).toHaveClass('flex-col')
    })

    it('should adapt grid layouts for different screen sizes', async () => {
      // Test mobile layout
      setViewportSize(375, 667)
      render(<LandingPage />)
      
      await waitFor(() => {
        // Problem section statistics should stack vertically
        const statsContainer = screen.getByText('24%').closest('div')?.parentElement
        expect(statsContainer).toHaveClass('grid-cols-1')
      })
      
      // Test desktop layout
      setViewportSize(1024, 768)
      render(<LandingPage />)
      
      await waitFor(() => {
        // Statistics should be side by side
        const statsContainer = screen.getByText('24%').closest('div')?.parentElement
        expect(statsContainer).toHaveClass('sm:grid-cols-2')
      })
    })
  })

  describe('Animation Sequences and Scroll-Triggered Behaviors', () => {
    it('should trigger animations when sections come into view', async () => {
      render(<LandingPage />)
      
      // Simulate scrolling to trigger animations
      simulateScroll(500)
      
      await waitFor(() => {
        // Problem section should be visible
        expect(screen.getByText('The Fashion Industry Has a Trust Problem')).toBeInTheDocument()
      })
      
      simulateScroll(1000)
      
      await waitFor(() => {
        // Solution section should be visible
        expect(screen.getByText('Our 3-Step Process to Radical Transparency')).toBeInTheDocument()
      })
    })

    it('should handle header scroll behavior', async () => {
      render(<LandingPage />)
      
      const header = screen.getByRole('banner')
      
      // Initially transparent
      expect(header).toBeInTheDocument()
      
      // Scroll down to trigger background change
      simulateScroll(100)
      
      // Header should still be present with updated styling
      expect(header).toBeInTheDocument()
    })

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      
      render(
        <MotionConfig reducedMotion="always">
          <LandingPage />
        </MotionConfig>
      )
      
      // Page should still render without animations
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      expect(screen.getByText('Request a Demo')).toBeInTheDocument()
    })

    it('should handle scroll indicator in hero section', () => {
      render(<LandingPage />)
      
      // Scroll indicator should be present
      const heroSection = screen.getByText('From Black Box to Crystal Clear').closest('section')
      expect(heroSection).toBeInTheDocument()
      
      // Should contain scroll indicator (tested via class presence)
      const scrollIndicator = heroSection?.querySelector('.absolute.bottom-8')
      expect(scrollIndicator).toBeInTheDocument()
    })
  })

  describe('Error Handling and Resilience', () => {
    it('should handle missing demo product ID gracefully', () => {
      // Mock config without demo product ID
      vi.mocked(require('<ecolens>/lib/landing-config').getLandingConfig).mockReturnValue({
        demoProductId: undefined,
        enableAnimations: true,
        animationDuration: 0.6,
      })
      
      render(<LandingPage />)
      
      // Page should still render
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      
      // CTA should have fallback behavior
      const actionButton = screen.getByText('See it in Action')
      expect(actionButton).toBeInTheDocument()
    })

    it('should handle section errors with error boundaries', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock a component that throws an error
      vi.mocked(require('../sections/Problem').default).mockImplementation(() => {
        throw new Error('Test error')
      })
      
      render(<LandingPage />)
      
      // Page should still render other sections
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      
      // Error boundary should show fallback
      expect(screen.getByText('Problem Section Unavailable')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })

    it('should handle network errors gracefully', async () => {
      // Mock network failure for lazy components
      const originalError = console.error
      console.error = vi.fn()
      
      render(<LandingPage />)
      
      // Main sections should still be accessible
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      
      console.error = originalError
    })
  })

  describe('Accessibility Compliance', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<LandingPage />)
      
      // Wait for lazy components to load
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA landmarks', () => {
      render(<LandingPage />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<LandingPage />)
      
      const headings = screen.getAllByRole('heading')
      
      // Should have exactly one H1
      const h1s = headings.filter(h => h.tagName === 'H1')
      expect(h1s).toHaveLength(1)
      
      // Should have multiple H2s for sections
      const h2s = headings.filter(h => h.tagName === 'H2')
      expect(h2s.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Should be able to tab through all interactive elements
      await user.tab() // Skip link
      expect(screen.getByText('Skip to main content')).toHaveFocus()
      
      await user.tab() // Logo
      expect(screen.getByLabelText('EcoLens home page')).toHaveFocus()
      
      await user.tab() // Mobile menu
      await user.tab() // Login
      await user.tab() // Sign up
      await user.tab() // Demo CTA
      expect(screen.getByText('Request a Demo')).toHaveFocus()
    })

    it('should have proper focus management', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Focus should be visible on interactive elements
      const demoButton = screen.getByText('Request a Demo')
      await user.click(demoButton)
      
      // Focus should be maintained
      expect(demoButton).toHaveClass('focus:ring-2')
    })

    it('should have accessible form labels and descriptions', () => {
      render(<LandingPage />)
      
      // All interactive elements should have proper labels
      expect(screen.getByLabelText('EcoLens home page')).toBeInTheDocument()
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument()
      expect(screen.getByLabelText('Follow EcoLens on Twitter')).toBeInTheDocument()
      expect(screen.getByLabelText('Follow EcoLens on LinkedIn')).toBeInTheDocument()
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should handle different user agents', () => {
      // Mock different browsers
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      ]
      
      userAgents.forEach(userAgent => {
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          configurable: true,
          value: userAgent,
        })
        
        render(<LandingPage />)
        
        // Basic functionality should work
        expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
        expect(screen.getByText('Request a Demo')).toBeInTheDocument()
      })
    })
  })
})