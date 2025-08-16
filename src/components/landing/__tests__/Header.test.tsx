import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import Header from '../Header'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, className, ...props }: React.ComponentProps<'header'>) => (
      <header className={className} {...props}>
        {children}
      </header>
    ),
  },
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock the auth hook
const mockUseAuth = vi.fn()
vi.mock('<ecolens>/lib/auth-client', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
})

describe('Header', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0
    
    // Add event listener mock
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the EcoLens logo', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    expect(screen.getByText('EcoLens')).toBeInTheDocument()
  })

  it('shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    
    render(<Header />)
    
    // Should show skeleton loading buttons
    const skeletonButtons = document.querySelectorAll('.animate-pulse')
    expect(skeletonButtons).toHaveLength(2)
  })

  it('shows login and signup buttons when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument()
  })

  it('shows dashboard button when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: '123', email: 'test@example.com' }, 
      loading: false 
    })
    
    render(<Header />)
    
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
  })

  it('has correct links for navigation buttons', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    const loginLink = screen.getByText('Login').closest('a')
    const signupLink = screen.getByText('Sign Up').closest('a')
    
    expect(loginLink).toHaveAttribute('href', '/auth/login')
    expect(signupLink).toHaveAttribute('href', '/auth/signup')
  })

  it('has correct link for dashboard button when authenticated', () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: '123', email: 'test@example.com' }, 
      loading: false 
    })
    
    render(<Header />)
    
    const dashboardLink = screen.getByText('Go to Dashboard').closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('applies transparent background initially', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-transparent')
    expect(header).not.toHaveClass('bg-slate-900/95')
  })

  it('sets up scroll event listener on mount', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('removes scroll event listener on unmount', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    const { unmount } = render(<Header />)
    unmount()
    
    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('has proper accessibility attributes', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    // Logo should be a link
    const logoLink = screen.getByText('EcoLens').closest('a')
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('applies sticky positioning and z-index', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50')
  })

  it('has responsive padding classes', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    render(<Header />)
    
    const container = document.querySelector('.max-w-7xl')
    expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
  })

  it('changes background when scrolled past threshold', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    // Mock addEventListener to capture the scroll handler
    let scrollHandler: () => void
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'scroll') {
        scrollHandler = handler as () => void
      }
    })
    
    render(<Header />)
    
    const header = screen.getByRole('banner')
    
    // Initially should have transparent background
    expect(header).toHaveClass('bg-transparent')
    expect(header).not.toHaveClass('bg-slate-900/95')
    
    // Simulate scroll past threshold
    window.scrollY = 60
    scrollHandler!()
    
    await waitFor(() => {
      expect(header).toHaveClass('bg-slate-900/95', 'backdrop-blur-md', 'border-b', 'border-slate-800')
      expect(header).not.toHaveClass('bg-transparent')
    })
  })

  it('maintains transparent background when scrolled below threshold', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    
    // Mock addEventListener to capture the scroll handler
    let scrollHandler: () => void
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'scroll') {
        scrollHandler = handler as () => void
      }
    })
    
    render(<Header />)
    
    const header = screen.getByRole('banner')
    
    // Simulate scroll below threshold
    window.scrollY = 30
    scrollHandler!()
    
    await waitFor(() => {
      expect(header).toHaveClass('bg-transparent')
      expect(header).not.toHaveClass('bg-slate-900/95')
    })
  })
})