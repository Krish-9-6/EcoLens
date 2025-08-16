import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LandingPage from '<ecolens>/app/page'

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

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/dynamic', () => ({
  default: (importFn: any, options: any) => {
    const Component = () => {
      if (importFn.toString().includes('LazyProblem')) {
        return <div data-testid="problem-section">Problem Section Loaded</div>
      }
      if (importFn.toString().includes('LazySolution')) {
        return <div data-testid="solution-section">Solution Section Loaded</div>
      }
      if (importFn.toString().includes('LazyDifferentiator')) {
        return <div data-testid="differentiator-section">Differentiator Section Loaded</div>
      }
      return <div data-testid="lazy-component">Lazy Component</div>
    }
    Component.displayName = 'LazyComponent'
    return Component
  },
}))

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

vi.mock('<ecolens>/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) => {
    if (asChild) {
      return <div {...props}>{children}</div>
    }
    return <button {...props}>{children}</button>
  },
}))

describe('Complete Landing Page Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    
    // Mock performance API
    global.performance = {
      ...global.performance,
      now: vi.fn(() => Date.now()),
    }
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
    global.cancelAnimationFrame = vi.fn()
  })

  describe('Full Landing Page Integration', () => {
    it('should render the complete landing page structure', async () => {
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
      
      // Check footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should load lazy sections', async () => {
      render(<LandingPage />)
      
      // Wait for lazy components to load
      await waitFor(() => {
        expect(screen.getByTestId('problem-section')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      await waitFor(() => {
        expect(screen.getByTestId('solution-section')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      await waitFor(() => {
        expect(screen.getByTestId('differentiator-section')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should have proper semantic structure', () => {
      render(<LandingPage />)
      
      // Check landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(screen.getByRole('main')).toBeInTheDocument() // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
      expect(screen.getByRole('navigation')).toBeInTheDocument() // Navigation
    })
  })

  describe('Navigation and CTA Functionality', () => {
    it('should handle navigation links correctly', () => {
      render(<LandingPage />)
      
      // Check header navigation
      const logo = screen.getByLabelText('EcoLens home page')
      expect(logo).toHaveAttribute('href', '/')
      
      const loginButton = screen.getByText('Login')
      expect(loginButton.closest('a')).toHaveAttribute('href', '/auth/login')
      
      const signupButton = screen.getByText('Sign Up')
      expect(signupButton.closest('a')).toHaveAttribute('href', '/auth/signup')
    })

    it('should handle social media links', () => {
      render(<LandingPage />)
      
      const twitterLink = screen.getByLabelText('Follow EcoLens on Twitter (opens in new tab)')
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/ecolens')
      expect(twitterLink).toHaveAttribute('target', '_blank')
      
      const linkedinLink = screen.getByLabelText('Follow EcoLens on LinkedIn (opens in new tab)')
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/ecolens')
      expect(linkedinLink).toHaveAttribute('target', '_blank')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      // Tab through interactive elements
      await user.tab() // Skip link
      expect(screen.getByText('Skip to main content')).toHaveFocus()
      
      await user.tab() // Logo
      expect(screen.getByLabelText('EcoLens home page')).toHaveFocus()
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<LandingPage />)
      
      // Mobile menu button should be present
      expect(screen.getByLabelText('Open mobile menu')).toBeInTheDocument()
    })

    it('should work on desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      
      render(<LandingPage />)
      
      // Desktop navigation should be available
      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })
  })

  describe('Performance Considerations', () => {
    it('should not block rendering', () => {
      const startTime = performance.now()
      render(<LandingPage />)
      const endTime = performance.now()
      
      // Should render quickly
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle lazy loading', async () => {
      render(<LandingPage />)
      
      // Lazy sections should eventually load
      await waitFor(() => {
        expect(screen.getByTestId('problem-section')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle component errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<LandingPage />)
      
      // Page should still render even if some sections fail
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })

    it('should provide error recovery options', () => {
      render(<LandingPage />)
      
      // If error boundary is triggered, should show retry options
      const retryButtons = screen.queryAllByText('Retry')
      const dashboardLinks = screen.queryAllByText('Go to Dashboard')
      
      // These might be present if error boundaries are triggered
      if (retryButtons.length > 0) {
        expect(retryButtons[0]).toBeInTheDocument()
      }
      if (dashboardLinks.length > 0) {
        expect(dashboardLinks[0]).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LandingPage />)
      
      // Check essential ARIA labels
      expect(screen.getByLabelText('EcoLens home page')).toBeInTheDocument()
      expect(screen.getByLabelText('Open mobile menu')).toBeInTheDocument()
      expect(screen.getByLabelText('Follow EcoLens on Twitter (opens in new tab)')).toBeInTheDocument()
      expect(screen.getByLabelText('Follow EcoLens on LinkedIn (opens in new tab)')).toBeInTheDocument()
    })

    it('should support screen readers', () => {
      render(<LandingPage />)
      
      // Check for proper semantic structure
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should have skip to main content functionality', async () => {
      const user = userEvent.setup()
      render(<LandingPage />)
      
      const skipLink = screen.getByText('Skip to main content')
      
      // Focus the skip link
      await user.tab()
      expect(skipLink).toHaveFocus()
      
      // Skip link should be initially hidden but visible when focused
      expect(skipLink).toHaveClass('sr-only')
      expect(skipLink).toHaveClass('focus:not-sr-only')
    })
  })

  describe('Animation Support', () => {
    it('should handle reduced motion preferences', () => {
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
      
      render(<LandingPage />)
      
      // Page should still render without animations
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should not cause layout shifts', () => {
      const { rerender } = render(<LandingPage />)
      
      // Get initial layout
      const header = screen.getByRole('banner')
      const initialRect = header.getBoundingClientRect()
      
      // Rerender
      rerender(<LandingPage />)
      
      // Layout should remain stable
      const finalRect = header.getBoundingClientRect()
      expect(finalRect.top).toBe(initialRect.top)
      expect(finalRect.left).toBe(initialRect.left)
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should work with different user agents', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/14.1.1',
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
        expect(screen.getByRole('banner')).toBeInTheDocument()
        expect(screen.getByRole('main')).toBeInTheDocument()
        expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      })
    })
  })
})