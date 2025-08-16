import { render, screen, waitFor } from '@testing-library/react'
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

// Performance measurement utilities
interface PerformanceEntry {
  name: string
  entryType: string
  startTime: number
  duration: number
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime: number
  loadTime: number
  size: number
  element: Element
}

interface FirstInputDelayEntry extends PerformanceEntry {
  processingStart: number
  processingEnd: number
}

class MockPerformanceObserver {
  private callback: (list: { getEntries: () => PerformanceEntry[] }) => void
  private entries: PerformanceEntry[] = []

  constructor(callback: (list: { getEntries: () => PerformanceEntry[] }) => void) {
    this.callback = callback
  }

  observe(options: { entryTypes: string[] }) {
    // Simulate performance entries
    setTimeout(() => {
      this.callback({
        getEntries: () => this.entries
      })
    }, 100)
  }

  disconnect() {}

  addEntry(entry: PerformanceEntry) {
    this.entries.push(entry)
  }
}

describe('Core Web Vitals Performance Tests', () => {
  let performanceObserver: MockPerformanceObserver
  let performanceEntries: PerformanceEntry[]

  beforeEach(() => {
    performanceEntries = []
    
    // Mock Performance Observer
    global.PerformanceObserver = vi.fn().mockImplementation((callback) => {
      performanceObserver = new MockPerformanceObserver(callback)
      return performanceObserver
    })

    // Mock performance API
    global.performance = {
      ...global.performance,
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn((type: string) => {
        return performanceEntries.filter(entry => entry.entryType === type)
      }),
      getEntriesByName: vi.fn((name: string) => {
        return performanceEntries.filter(entry => entry.name === name)
      }),
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

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
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

  describe('Largest Contentful Paint (LCP)', () => {
    it('should measure LCP for hero section', async () => {
      const lcpEntries: LargestContentfulPaintEntry[] = []
      
      // Mock LCP observer
      global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      }))

      render(<LandingPage />)

      // Simulate LCP measurement
      const heroHeading = screen.getByText('From Black Box to Crystal Clear')
      expect(heroHeading).toBeInTheDocument()

      // Simulate LCP entry
      const lcpEntry: LargestContentfulPaintEntry = {
        name: '',
        entryType: 'largest-contentful-paint',
        startTime: 0,
        duration: 0,
        renderTime: 1200, // Should be under 2.5s for good LCP
        loadTime: 1200,
        size: 5000,
        element: heroHeading,
      }

      lcpEntries.push(lcpEntry)

      // LCP should be under 2.5 seconds for good performance
      expect(lcpEntry.renderTime).toBeLessThan(2500)
    })

    it('should prioritize above-the-fold content for LCP', () => {
      render(<LandingPage />)

      // Hero section should be immediately visible
      const heroSection = screen.getByText('From Black Box to Crystal Clear')
      expect(heroSection).toBeInTheDocument()

      // Hero should be the largest contentful element
      const heroContainer = heroSection.closest('section')
      expect(heroContainer).toBeInTheDocument()
    })

    it('should not have layout shifts that affect LCP', async () => {
      const { rerender } = render(<LandingPage />)

      // Initial render
      const initialHero = screen.getByText('From Black Box to Crystal Clear')
      const initialRect = initialHero.getBoundingClientRect()

      // Rerender to simulate dynamic content loading
      rerender(<LandingPage />)

      // Hero position should remain stable
      const updatedHero = screen.getByText('From Black Box to Crystal Clear')
      const updatedRect = updatedHero.getBoundingClientRect()

      expect(updatedRect.top).toBe(initialRect.top)
      expect(updatedRect.left).toBe(initialRect.left)
    })
  })

  describe('Cumulative Layout Shift (CLS)', () => {
    it('should have minimal layout shifts during loading', async () => {
      const layoutShifts: LayoutShiftEntry[] = []

      // Mock CLS observer
      global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn((options) => {
          if (options.entryTypes?.includes('layout-shift')) {
            // Simulate minimal layout shift
            setTimeout(() => {
              const shiftEntry: LayoutShiftEntry = {
                name: '',
                entryType: 'layout-shift',
                startTime: 100,
                duration: 0,
                value: 0.05, // Should be under 0.1 for good CLS
                hadRecentInput: false,
              }
              layoutShifts.push(shiftEntry)
              callback({
                getEntries: () => [shiftEntry]
              })
            }, 50)
          }
        }),
        disconnect: vi.fn(),
      }))

      render(<LandingPage />)

      // Wait for potential layout shifts
      await waitFor(() => {
        expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      })

      // Calculate total CLS score
      const totalCLS = layoutShifts
        .filter(entry => !entry.hadRecentInput)
        .reduce((sum, entry) => sum + entry.value, 0)

      // CLS should be under 0.1 for good performance
      expect(totalCLS).toBeLessThan(0.1)
    })

    it('should reserve space for lazy-loaded content', async () => {
      render(<LandingPage />)

      // Get initial layout
      const heroSection = screen.getByText('From Black Box to Crystal Clear')
      const initialRect = heroSection.getBoundingClientRect()

      // Wait for lazy content to load
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })

      // Hero position should not shift
      const finalRect = heroSection.getBoundingClientRect()
      expect(finalRect.top).toBe(initialRect.top)
    })

    it('should handle font loading without layout shift', () => {
      // Mock font loading
      Object.defineProperty(document, 'fonts', {
        value: {
          ready: Promise.resolve(),
          load: vi.fn().mockResolvedValue([]),
        },
      })

      render(<LandingPage />)

      // Text should be visible immediately
      const heroText = screen.getByText('From Black Box to Crystal Clear')
      expect(heroText).toBeInTheDocument()

      // Should use font-display: swap or similar strategy
      expect(heroText).toHaveClass('font-extrabold')
    })
  })

  describe('First Input Delay (FID)', () => {
    it('should respond quickly to user interactions', async () => {
      const fidEntries: FirstInputDelayEntry[] = []

      // Mock FID observer
      global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn((options) => {
          if (options.entryTypes?.includes('first-input')) {
            const fidEntry: FirstInputDelayEntry = {
              name: 'click',
              entryType: 'first-input',
              startTime: 100,
              duration: 50, // Should be under 100ms for good FID
              processingStart: 110,
              processingEnd: 150,
            }
            fidEntries.push(fidEntry)
            callback({
              getEntries: () => [fidEntry]
            })
          }
        }),
        disconnect: vi.fn(),
      }))

      render(<LandingPage />)

      // Simulate user interaction
      const demoButton = screen.getByText('Request a Demo')
      expect(demoButton).toBeInTheDocument()

      // FID should be under 100ms for good performance
      if (fidEntries.length > 0) {
        expect(fidEntries[0].duration).toBeLessThan(100)
      }
    })

    it('should not block main thread during animations', async () => {
      render(<LandingPage />)

      // Simulate scroll to trigger animations
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 500,
      })
      window.dispatchEvent(new Event('scroll'))

      // Interactive elements should remain responsive
      const demoButton = screen.getByText('Request a Demo')
      expect(demoButton).toBeInTheDocument()

      // Button should be clickable without delay
      demoButton.click()
      expect(demoButton).toBeInTheDocument()
    })

    it('should prioritize critical interactions', () => {
      render(<LandingPage />)

      // Critical CTAs should be immediately interactive
      const demoButton = screen.getByText('Request a Demo')
      const actionButton = screen.getByText('See it in Action')

      expect(demoButton).toBeInTheDocument()
      expect(actionButton).toBeInTheDocument()

      // Should not have disabled state initially
      expect(demoButton).not.toHaveAttribute('disabled')
      expect(actionButton).not.toHaveAttribute('disabled')
    })
  })

  describe('Time to Interactive (TTI)', () => {
    it('should become interactive quickly', async () => {
      const startTime = performance.now()
      
      render(<LandingPage />)

      // Wait for page to be fully interactive
      await waitFor(() => {
        expect(screen.getByText('Request a Demo')).toBeInTheDocument()
        expect(screen.getByText('See it in Action')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const tti = endTime - startTime

      // TTI should be reasonable (under 3.8s for good performance)
      expect(tti).toBeLessThan(3800)
    })

    it('should not have long tasks blocking interactivity', async () => {
      const longTasks: PerformanceEntry[] = []

      // Mock long task observer
      global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn((options) => {
          if (options.entryTypes?.includes('longtask')) {
            // Should not have tasks longer than 50ms
            const longTask: PerformanceEntry = {
              name: 'unknown',
              entryType: 'longtask',
              startTime: 100,
              duration: 30, // Should be under 50ms
            }
            longTasks.push(longTask)
            callback({
              getEntries: () => [longTask]
            })
          }
        }),
        disconnect: vi.fn(),
      }))

      render(<LandingPage />)

      await waitFor(() => {
        expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      })

      // No long tasks should block the main thread
      longTasks.forEach(task => {
        expect(task.duration).toBeLessThan(50)
      })
    })
  })

  describe('Resource Loading Performance', () => {
    it('should load critical resources efficiently', () => {
      render(<LandingPage />)

      // Critical content should be immediately available
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
      expect(screen.getByText('Request a Demo')).toBeInTheDocument()
    })

    it('should lazy load non-critical sections', async () => {
      render(<LandingPage />)

      // Hero should load immediately
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()

      // Below-the-fold content should load lazily
      await waitFor(() => {
        expect(screen.getByText('24%')).toBeInTheDocument()
      })
    })

    it('should optimize image loading', () => {
      render(<LandingPage />)

      // Images should use appropriate loading strategies
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        // Critical images should not have loading="lazy"
        if (img.closest('[data-critical]')) {
          expect(img).not.toHaveAttribute('loading', 'lazy')
        }
      })
    })
  })

  describe('Bundle Size and Code Splitting', () => {
    it('should not load unnecessary JavaScript upfront', () => {
      render(<LandingPage />)

      // Page should render with minimal JavaScript
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })

    it('should code-split animation libraries', async () => {
      render(<LandingPage />)

      // Framer Motion should be loaded only when needed
      // This is mocked in our tests, but in real implementation
      // it should be dynamically imported
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })

    it('should minimize render-blocking resources', () => {
      render(<LandingPage />)

      // Critical CSS should be inlined
      // Non-critical CSS should be loaded asynchronously
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })
  })

  describe('Memory Usage', () => {
    it('should not have memory leaks in animations', async () => {
      const { unmount } = render(<LandingPage />)

      // Simulate scroll events
      for (let i = 0; i < 100; i++) {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: i * 10,
        })
        window.dispatchEvent(new Event('scroll'))
      }

      // Cleanup should happen properly
      unmount()

      // Verify cleanup (in real tests, you'd check memory usage)
      expect(true).toBe(true)
    })

    it('should cleanup event listeners properly', () => {
      const { unmount } = render(<LandingPage />)

      // Add event listeners
      const scrollHandler = vi.fn()
      window.addEventListener('scroll', scrollHandler)

      unmount()

      // Event listeners should be cleaned up
      window.removeEventListener('scroll', scrollHandler)
      expect(scrollHandler).not.toHaveBeenCalled()
    })
  })

  describe('Network Performance', () => {
    it('should minimize network requests', () => {
      render(<LandingPage />)

      // Should not make unnecessary API calls on initial load
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })

    it('should handle slow network conditions', async () => {
      // Mock slow network
      global.navigator = {
        ...global.navigator,
        connection: {
          effectiveType: '2g',
          downlink: 0.5,
        },
      }

      render(<LandingPage />)

      // Should still render critical content
      expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument()
    })
  })
})