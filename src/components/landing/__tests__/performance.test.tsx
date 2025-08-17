import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { performanceMonitor, useAnimationPerformance } from '<ecolens>/lib/performance-monitor'
import { getLandingConfig, validateLandingConfig } from '<ecolens>/lib/landing-config'
import { LandingErrorBoundary } from '../ui/LandingErrorBoundary'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}))

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/dynamic', () => ({
  default: (importFn: any, options: any) => {
    const Component = () => <div data-testid="lazy-component">Lazy Component</div>
    Component.displayName = 'LazyComponent'
    return Component
  },
}))

describe('Performance Optimizations', () => {
  beforeEach(() => {
    // Mock performance API
    global.performance = {
      ...global.performance,
      now: vi.fn(() => Date.now()),
    }

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
    global.cancelAnimationFrame = vi.fn()

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Mock navigator properties
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      writable: true,
      value: 4,
    })

    Object.defineProperty(navigator, 'deviceMemory', {
      writable: true,
      value: 8,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Landing Configuration', () => {
    it('should provide fallback demo product ID', () => {
      const config = getLandingConfig()
      expect(config.demoProductId).toBeDefined()
      expect(config.demoProductId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should respect reduced motion preference', () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const config = getLandingConfig()
      expect(config.enableAnimations).toBe(false)
      expect(config.animationDuration).toBeLessThan(0.2)
    })

    it('should validate configuration without errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      validateLandingConfig()
      
      // Should warn about missing environment variable
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Performance Monitor', () => {
    it('should detect low performance devices', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })

      // Mock low hardware specs
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 2,
      })

      const { isLowPerformanceDevice } = useAnimationPerformance()
      expect(isLowPerformanceDevice).toBe(true)
    })

    it('should provide optimized animation settings for low performance', () => {
      // Mock low performance device
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })

      const { optimizedSettings } = useAnimationPerformance()
      expect(optimizedSettings.duration).toBeLessThan(0.6)
      expect(optimizedSettings.enableComplexAnimations).toBe(false)
    })

    it('should monitor frame rate', async () => {
      performanceMonitor.startMonitoring()
      
      // Simulate some time passing
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const metrics = performanceMonitor.stopMonitoring()
      expect(metrics).toHaveProperty('fps')
      expect(metrics).toHaveProperty('frameTime')
      expect(metrics).toHaveProperty('isLowPerformance')
    })
  })

  describe('Error Boundaries', () => {
    it('should render error boundary fallback when child throws', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <LandingErrorBoundary sectionName="Test Section">
          <ThrowError />
        </LandingErrorBoundary>
      )

      expect(screen.getByText('Test Section Section Unavailable')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn()
      const ThrowError = () => {
        throw new Error('Test error')
      }

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <LandingErrorBoundary sectionName="Test Section" onError={onError}>
          <ThrowError />
        </LandingErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )

      consoleSpy.mockRestore()
    })

    it('should render custom fallback when provided', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }

      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <LandingErrorBoundary fallback={customFallback}>
          <ThrowError />
        </LandingErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Lazy Loading', () => {
    it('should render lazy components', async () => {
      const LazyProblem = await import('../sections/LazyProblem')
      
      render(<LazyProblem.default />)
      
      await waitFor(() => {
        expect(screen.getByTestId('lazy-component')).toBeInTheDocument()
      })
    })
  })
})