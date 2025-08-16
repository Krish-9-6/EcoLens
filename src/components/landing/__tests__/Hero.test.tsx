import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Hero from '../sections/Hero';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: React.ComponentProps<'section'>) => <section {...props}>{children}</section>,
  },
  useInView: () => true,
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock AnimatedText component
vi.mock('../ui/AnimatedText', () => ({
  default: ({ text, className }: { text: string; className?: string }) => (
    <div className={className}>{text}</div>
  ),
}));

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_DEMO_PRODUCT_ID: '123e4567-e89b-12d3-a456-426614174000',
};

describe('Hero Component', () => {
  beforeEach(() => {
    // Mock process.env
    Object.defineProperty(process, 'env', {
      value: mockEnv,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero section with correct structure', () => {
    const { container } = render(<Hero />);
    
    // Check if the main section is rendered
    const heroSection = container.querySelector('section');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection).toHaveClass('min-h-screen', 'bg-slate-900');
  });

  it('displays the correct headline text', () => {
    render(<Hero />);
    
    const headline = screen.getByText('From Black Box to Crystal Clear');
    expect(headline).toBeInTheDocument();
    expect(headline).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-7xl', 'font-extrabold');
  });

  it('displays the correct sub-headline text', () => {
    render(<Hero />);
    
    const subHeadline = screen.getByText('EcoLens is the trust engine for the new era of fashion');
    expect(subHeadline).toBeInTheDocument();
    expect(subHeadline).toHaveClass('text-xl', 'md:text-2xl', 'lg:text-3xl', 'font-semibold', 'text-slate-300');
  });

  it('renders both CTA buttons with correct text', () => {
    render(<Hero />);
    
    const requestDemoButton = screen.getByRole('link', { name: /request a demo/i });
    const seeActionButton = screen.getByRole('link', { name: /see it in action/i });
    
    expect(requestDemoButton).toBeInTheDocument();
    expect(seeActionButton).toBeInTheDocument();
  });

  it('links Request a Demo button to contact page', () => {
    render(<Hero />);
    
    const requestDemoButton = screen.getByRole('link', { name: /request a demo/i });
    expect(requestDemoButton).toHaveAttribute('href', '/contact');
  });

  it('links See it in Action button to demo DPP with environment variable', () => {
    render(<Hero />);
    
    const seeActionButton = screen.getByRole('link', { name: /see it in action/i });
    expect(seeActionButton).toHaveAttribute('href', '/dpp/123e4567-e89b-12d3-a456-426614174000');
  });

  it('uses custom demo product ID when provided as prop', () => {
    const customProductId = 'custom-product-id-123';
    render(<Hero demoProductId={customProductId} />);
    
    const seeActionButton = screen.getByRole('link', { name: /see it in action/i });
    expect(seeActionButton).toHaveAttribute('href', `/dpp/${customProductId}`);
  });

  it('falls back to hardcoded UUID when no environment variable or prop provided', () => {
    // Clear environment variable
    delete (process.env as any).NEXT_PUBLIC_DEMO_PRODUCT_ID;
    
    render(<Hero />);
    
    const seeActionButton = screen.getByRole('link', { name: /see it in action/i });
    expect(seeActionButton).toHaveAttribute('href', '/dpp/123e4567-e89b-12d3-a456-426614174000');
  });

  it('applies correct styling to CTA buttons', () => {
    render(<Hero />);
    
    const requestDemoButton = screen.getByRole('link', { name: /request a demo/i });
    const seeActionButton = screen.getByRole('link', { name: /see it in action/i });
    
    // Check Request Demo button styling
    expect(requestDemoButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    
    // Check See it in Action button styling
    expect(seeActionButton).toHaveClass('border-2', 'border-slate-300', 'text-slate-300');
  });

  it('renders background elements with correct styling', () => {
    const { container } = render(<Hero />);
    
    const heroSection = container.querySelector('section');
    
    // Check for background gradient classes
    expect(heroSection).toHaveClass('bg-slate-900', 'relative', 'overflow-hidden');
  });

  it('renders scroll indicator', () => {
    const { container } = render(<Hero />);
    
    // The scroll indicator should be present (though specific testing of animation requires more complex setup)
    const scrollIndicator = container.querySelector('.absolute.bottom-8');
    expect(scrollIndicator).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(<Hero />);
    
    const heroSection = container.querySelector('section');
    expect(heroSection).toBeInTheDocument();
    
    // Check that buttons are properly accessible
    const requestDemoButton = screen.getByRole('link', { name: /request a demo/i });
    const seeActionButton = screen.getByRole('link', { name: /see it in action/i });
    
    expect(requestDemoButton).toBeInTheDocument();
    expect(seeActionButton).toBeInTheDocument();
  });

  it('maintains responsive design classes', () => {
    render(<Hero />);
    
    const headline = screen.getByText('From Black Box to Crystal Clear');
    const subHeadline = screen.getByText('EcoLens is the trust engine for the new era of fashion');
    
    // Check responsive classes are present
    expect(headline).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-7xl');
    expect(subHeadline).toHaveClass('text-xl', 'md:text-2xl', 'lg:text-3xl');
  });

  it('renders with proper z-index layering', () => {
    const { container } = render(<Hero />);
    
    const heroSection = container.querySelector('section');
    const contentDiv = heroSection?.querySelector('.relative.z-10');
    
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveClass('relative', 'z-10');
  });
});