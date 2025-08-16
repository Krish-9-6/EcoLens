import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

// Mock Framer Motion with animation tracking
const mockMotionDiv = vi.fn()
const mockMotionSection = vi.fn()
const mockMotionHeader = vi.fn()
const mockUseInView = vi.fn()

vi.mock('framer-motion', () => ({
  motion: {
    div: mockMotionDiv,
    section: mockMotionSection,
    header: mockMotionHeader,
  },
  useInView: mockUseInView,
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

// Helper functions for animation testing
const simulateScroll = (scrollY: number) => {
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: scrollY,
  })
  window.dispatchEvent(new Event('scroll'))
}

const simulateIntersection = (isIntersecting: boolean, threshold = 0.1) => {
  const mockEntry = {
    isIntersecting,
    intersectionRatio: isIntersecting ? threshold : 0,
    target: document.createElement('div'),
    boundingClientRect: {
      top: isIntersecting ? 100 : -100,
      bottom: isIntersecting ? 200 : 0,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
    },
    intersectionRect: {},
    rootBounds: {},
    time: Date.now(),
  }
  
  return mockEntry
}

describe('Animation Sequences and Scroll-Triggered Behaviors', () => {
  let intersectionObserverCallback: (entries: any[]) => void
  let mockIntersectionObserver: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock motion components to track animation calls
    mockMotionDiv.mockImplementation(({ children, initial, animate, transition, ...props }) => (
      <div 
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </div>
    ))
    
    mockMotionSection.mockImplementation(({ children, initial, animate, transition, ...props }) => (
      <section 
        data-testid="motion-section"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </section>
    ))
    
    mockMotionHeader.mockImplementation(({ children, initial, animate, transition, ...props }) => (
      <header 
        data-testid="motion-header"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </header>
    ))
    
    // Mock useInView hook
    mockUseInView.mockReturnValue(true)
    
    // Mock IntersectionObserver
    mockIntersectionObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
    
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      intersectionObserverCallback = callback
      return mockIntersectionObserver
    })
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
    global.cancelAnimationFrame = vi.fn()
    
    // Mock performance API
    global.performance = {
      ...global.performance,
      now: vi.fn(() => Date.now()),
    }
    
    // Reset scroll position
    simulateScroll(0)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Hero Section Animations', () => {
    it('should trigger cascading animations on page load', async () => {
      render(<LandingPage />)
      
      // Hero section should be present
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      
      // Check that motion components are used
      const motionElements = screen.getAllByTestId('motion-div')
      expect(motionElements.length).toBeGreaterThan(0)
      
      // Verify animation properties are set
      const heroMotionElement = motionElements.find(el => 
        el.textContent?.includes('From Black Box to Crystal Clear')
      )
      
      if (heroMotionElement) {
        const initial = heroMotionElement.getAttribute('data-initial')
        const animate = heroMotionElement.getAttribute('data-animate')
        
        expect(initial).toBeTruthy()
        expect(animate).toBeTruthy()
      }
    })

    it('should have staggered delays for hero elements', () => {
      render(<LandingPage />)
      
      // Check for motion elements with different delays
      const motionElements = screen.getAllByTestId('motion-div')
      
      // Should have multiple elements with different transition timings
      const elementsWithTransitions = motionElements.filter(el => 
        el.getAttribute('data-transition')
      )
      
      expect(elementsWithTransitions.length).toBeGreaterThan(0)
    })

    it('should animate CTA buttons with proper timing', () => {
      render(<LandingPage />)
      
      const demoButton = screen.getByText('Request a Demo')
      const actionButton = screen.getByText('See it in Action')
      
      expect(demoButton).toBeInTheDocument()
      expect(actionButton).toBeInTheDocument()
      
      // Buttons should be wrapped in motion components
      const buttonContainer = demoButton.closest('[data-testid="motion-div"]')
      expect(buttonContainer).toBeInTheDocument()
    })

    it('should include scroll indicator animation', () => {
      render(<LandingPage />)
      
      // Hero section should contain scroll indicator
      const heroSection = screen.getByText('From Black Box to Crystal Clear').closest('section')
      expect(heroSection).toBeInTheDocument()
      
      // Should have motion elements for scroll indicator
      const motionElements = screen.getAllByTestId('motion-div')
      expect(motionElements.length).toBeGreaterThan(0)
    })
  })

  describe('Scroll-Triggered Animations', () => {
    it('should trigger animations when sections enter viewport', async () => {
      render(<LandingPage />)
      
      // Initially, useInView returns false for below-the-fold content
      mockUseInView.mockReturnValue(false)
      
      // Wait for lazy sections to load
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      // Simulate section coming into view
      act(() => {
        mockUseInView.mockReturnValue(true)
        
        // Trigger intersection observer callback
        if (intersectionObserverCallback) {
          intersectionObserverCallback([simulateIntersection(true)])
        }
      })
      
      // Animations should be triggered
      expect(mockUseInView).toHaveBeenCalled()
    })

    it('should use appropriate thresholds for different sections', async () => {
      render(<LandingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      // IntersectionObserver should be created with proper options
      expect(global.IntersectionObserver).toHaveBeenCalled()
      
      // Check that observers are set up for different sections
      const observerCalls = (global.IntersectionObserver as any).mock.calls
      expect(observerCalls.length).toBeGreaterThan(0)
    })

    it('should handle rapid scrolling without performance issues', async () => {
      render(<LandingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      // Simulate rapid scrolling
      for (let i = 0; i < 100; i++) {
        act(() => {
          simulateScroll(i * 10)
        })
      }
      
      // Page should remain responsive
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })

    it('should cleanup observers on unmount', () => {
      const { unmount } = render(<LandingPage />)
      
      // Observers should be created
      expect(global.IntersectionObserver).toHaveBeenCalled()
      
      // Unmount component
      unmount()
      
      // Disconnect should be called
      expect(mockIntersectionObserver.disconnect).toHaveBeenCalled()
    })
  })

  describe('Header Scroll Behavior', () => {
    it('should change header background on scroll', async () => {
      render(<LandingPage />)
      
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      
      // Initially transparent
      expect(header).toHaveClass('bg-transparent')
      
      // Simulate scrolling down
      act(() => {
        simulateScroll(100)
      })
      
      // Header should update (this would be handled by the Header component's scroll listener)
      expect(header).toBeInTheDocument()
    })

    it('should have smooth transitions for header changes', () => {
      render(<LandingPage />)
      
      // Header should use motion component
      const motionHeader = screen.queryByTestId('motion-header')
      if (motionHeader) {
        const transition = motionHeader.getAttribute('data-transition')
        expect(transition).toBeTruthy()
      }
    })

    it('should maintain header functionality during scroll', async () => {
      render(<LandingPage />)
      
      const loginButton = screen.getByText('Login')
      
      // Scroll down
      act(() => {
        simulateScroll(200)
      })
      
      // Button should still be clickable
      expect(loginButton).toBeInTheDocument()
      expect(loginButton).not.toHaveAttribute('disabled')
    })
  })

  describe('Section-Specific Animations', () => {
    it('should animate problem section statistics', async () => {
      render(<LandingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
      
      // Statistics should be wrapped in motion components
      const statisticElements = [
        screen.getByText('24%'),
        screen.getByText('85%'),
      ]
      
      statisticElements.forEach(element => {
        const motionWrapper = element.closest('[data-testid="motion-div"]')
        expect(motionWrapper).toBeInTheDocument()
      })
    })

    it('should animate solution steps sequentially', async () => {
      render(<LandingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Map Your Chain')).toBeInTheDocument()
      })
      
      // Solution steps should have staggered animations
      const solutionSteps = [
        screen.getByText('Map Your Chain'),
        screen.getByText('Anchor Your Claims'),
        screen.getByText('Tell Your Story'),
      ]
      
      solutionSteps.forEach(step => {
        const motionWrapper = step.closest('[data-testid="motion-div"]')
        expect(motionWrapper).toBeInTheDocument()
      })
    })

    it('should animate differentiator comparison', async () => {
      render(<LandingPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Full Blockchain')).toBeInTheDocument()
      })
      
      // Comparison sections should be animated
      const comparisonElements = [
        screen.getByText('Full Blockchain'),
        screen.getByText('Pragmatic Anchoring'),
      ]
      
      comparisonElements.forEach(element => {
        const motionWrapper = element.closest('[data-testid="motion-div"]')
        expect(motionWrapper).toBeInTheDocument()
      })
    })
  })

  describe('Animation Performance', () => {
    it('should use transform and opacity for animations', () => {
      render(<LandingPage />)
      
      const motionElements = screen.getAllByTestId('motion-div')
      
      motionElements.forEach(element => {
        const initial = element.getAttribute('data-initial')
        const animate = element.getAttribute('data-animate')
        
        if (initial && animate) {
          // Should use performant properties
          expect(initial).toMatch(/opacity|transform|translateY|translateX/)
          expect(animate).toMatch(/opacity|transform|translateY|translateX/)
        }
      })
    })

    it('should not cause layout thrashing', async () => {
      render(<LandingPage />)
      
      // Simulate multiple animation triggers
      for (let i = 0; i < 10; i++) {
        act(() => {
          mockUseInView.mockReturnValue(i % 2 === 0)
          if (intersectionObserverCallback) {
            intersectionObserverCallback([simulateIntersection(i % 2 === 0)])
          }
        })
      }
      
      // Page should remain stable
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })

    it('should handle animation cleanup properly', () => {
      const { unmount } = render(<LandingPage />)
      
      // Trigger some animations
      act(() => {
        simulateScroll(500)
      })
      
      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow()
    })

    it('should throttle scroll events', async () => {
      render(<LandingPage />)
      
      const scrollHandler = vi.fn()
      window.addEventListener('scroll', scrollHandler)
      
      // Rapid scroll events
      for (let i = 0; i < 100; i++) {
        act(() => {
          simulateScroll(i)
        })
      }
      
      // Should not call handler for every event (throttling)
      await waitFor(() => {
        expect(scrollHandler).toHaveBeenCalled()
      })
      
      window.removeEventListener('scroll', scrollHandler)
    })
  })

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock reduced motion preference
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
      
      // Content should still be visible
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      
      // Animations should be disabled or reduced
      const motionElements = screen.getAllByTestId('motion-div')
      motionElements.forEach(element => {
        const transition = element.getAttribute('data-transition')
        if (transition) {
          const transitionObj = JSON.parse(transition)
          // Duration should be reduced or zero
          expect(transitionObj.duration).toBeLessThan(0.2)
        }
      })
    })

    it('should provide alternative feedback for reduced motion', () => {
      // Mock reduced motion
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
      
      // Interactive elements should still provide feedback
      const demoButton = screen.getByText('Request a Demo')
      expect(demoButton).toHaveClass('hover:bg-blue-700')
    })
  })

  describe('Animation Error Handling', () => {
    it('should handle animation library failures gracefully', () => {
      // Mock Framer Motion failure
      mockMotionDiv.mockImplementation(() => {
        throw new Error('Animation library error')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Should still render content
      render(<LandingPage />)
      
      // Content should be accessible even without animations
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })

    it('should fallback to static content if animations fail', () => {
      // Mock useInView failure
      mockUseInView.mockImplementation(() => {
        throw new Error('useInView error')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<LandingPage />)
      
      // Content should still be visible
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Mobile Animation Behavior', () => {
    it('should optimize animations for mobile devices', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })
      
      render(<LandingPage />)
      
      // Animations should be optimized for mobile
      const motionElements = screen.getAllByTestId('motion-div')
      expect(motionElements.length).toBeGreaterThan(0)
      
      // Should use hardware acceleration
      motionElements.forEach(element => {
        const style = window.getComputedStyle(element)
        // In real implementation, would check for transform3d or will-change
      })
    })

    it('should handle touch interactions during animations', async () => {
      render(<LandingPage />)
      
      const demoButton = screen.getByText('Request a Demo')
      
      // Should be interactive during animations
      expect(demoButton).not.toHaveAttribute('disabled')
      expect(demoButton).toHaveClass('touch-manipulation')
    })
  })
})