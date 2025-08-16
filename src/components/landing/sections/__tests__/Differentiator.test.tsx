import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Differentiator from '../Differentiator';

// Mock ScrollReveal component
vi.mock('../../ui/ScrollReveal', () => ({
  default: ({ children, delay, className }: any) => (
    <div data-testid="scroll-reveal" data-delay={delay} className={className}>
      {children}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  XCircle: ({ className }: any) => (
    <div data-testid="xcircle-icon" className={className}>
      XCircle
    </div>
  ),
  CheckCircle2: ({ className }: any) => (
    <div data-testid="checkcircle2-icon" className={className}>
      CheckCircle2
    </div>
  ),
}));

describe('Differentiator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main section title and subtitle', () => {
    render(<Differentiator />);
    
    expect(screen.getByText("The 'Secret Sauce': Pragmatic Anchoring")).toBeInTheDocument();
    expect(screen.getByText(/Why settle for slow, expensive blockchain/)).toBeInTheDocument();
  });

  it('renders both comparison columns', () => {
    render(<Differentiator />);
    
    expect(screen.getByText('Full Blockchain')).toBeInTheDocument();
    expect(screen.getByText('Pragmatic Anchoring')).toBeInTheDocument();
  });

  it('renders correct icons for each column', () => {
    render(<Differentiator />);
    
    const xCircleIcons = screen.getAllByTestId('xcircle-icon');
    const checkCircle2Icons = screen.getAllByTestId('checkcircle2-icon');
    
    // Should have XCircle icons for Full Blockchain (1 in header + 4 in list)
    expect(xCircleIcons).toHaveLength(5);
    
    // Should have CheckCircle2 icons for Pragmatic Anchoring (1 in header + 4 in list)
    expect(checkCircle2Icons).toHaveLength(5);
  });

  it('renders Full Blockchain disadvantages', () => {
    render(<Differentiator />);
    
    expect(screen.getByText(/Slow:/)).toBeInTheDocument();
    expect(screen.getByText(/Minutes to hours for transaction confirmation/)).toBeInTheDocument();
    expect(screen.getByText(/Expensive:/)).toBeInTheDocument();
    expect(screen.getByText(/High gas fees for every transaction/)).toBeInTheDocument();
    expect(screen.getByText(/Complex:/)).toBeInTheDocument();
    expect(screen.getByText(/Requires deep blockchain expertise/)).toBeInTheDocument();
    expect(screen.getByText(/Rigid:/)).toBeInTheDocument();
    expect(screen.getByText(/Difficult to update or modify data/)).toBeInTheDocument();
  });

  it('renders Pragmatic Anchoring advantages', () => {
    render(<Differentiator />);
    
    expect(screen.getByText(/Instant:/)).toBeInTheDocument();
    expect(screen.getByText(/Real-time verification and updates/)).toBeInTheDocument();
    expect(screen.getByText(/Low-cost:/)).toBeInTheDocument();
    expect(screen.getByText(/Minimal fees for maximum value/)).toBeInTheDocument();
    expect(screen.getByText(/Scalable:/)).toBeInTheDocument();
    expect(screen.getByText(/Grows seamlessly with your business/)).toBeInTheDocument();
    expect(screen.getByText(/Flexible:/)).toBeInTheDocument();
    expect(screen.getByText(/Easy to update and maintain data integrity/)).toBeInTheDocument();
  });

  it('implements ScrollReveal animation with correct delays', () => {
    render(<Differentiator />);
    
    const scrollRevealElements = screen.getAllByTestId('scroll-reveal');
    
    expect(scrollRevealElements).toHaveLength(2);
    expect(scrollRevealElements[0]).not.toHaveAttribute('data-delay'); // First element has no delay
    expect(scrollRevealElements[1]).toHaveAttribute('data-delay', '0.2'); // Second element has 0.2s delay
  });

  it('has proper responsive grid layout classes', () => {
    render(<Differentiator />);
    
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });

  it('applies correct styling classes', () => {
    render(<Differentiator />);
    
    // Check section background
    const section = document.querySelector('section');
    expect(section).toHaveClass('bg-slate-50');
    
    // Check Full Blockchain column styling
    const fullBlockchainColumn = screen.getByText('Full Blockchain').closest('.bg-white');
    expect(fullBlockchainColumn).toHaveClass('border-slate-200');
    
    // Check Pragmatic Anchoring column has special styling (ring)
    const pragmaticColumn = screen.getByText('Pragmatic Anchoring').closest('.bg-white');
    expect(pragmaticColumn).toHaveClass('border-green-200', 'ring-2', 'ring-green-100');
  });

  it('has proper icon color styling', () => {
    render(<Differentiator />);
    
    const xCircleIcons = screen.getAllByTestId('xcircle-icon');
    const checkCircle2Icons = screen.getAllByTestId('checkcircle2-icon');
    
    // Check XCircle icons have red styling (some have text-red-500, some have text-red-600)
    xCircleIcons.forEach(icon => {
      const hasRedStyling = icon.className.includes('text-red-500') || icon.className.includes('text-red-600');
      expect(hasRedStyling).toBe(true);
    });
    
    // Check CheckCircle2 icons have green styling (some have text-green-500, some have text-green-600)
    checkCircle2Icons.forEach(icon => {
      const hasGreenStyling = icon.className.includes('text-green-500') || icon.className.includes('text-green-600');
      expect(hasGreenStyling).toBe(true);
    });
  });

  it('has accessible structure with proper headings', () => {
    render(<Differentiator />);
    
    // Main heading should be h2
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toHaveTextContent("The 'Secret Sauce': Pragmatic Anchoring");
    
    // Column titles should be h3
    const columnHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(columnHeadings).toHaveLength(2);
    expect(columnHeadings[0]).toHaveTextContent('Full Blockchain');
    expect(columnHeadings[1]).toHaveTextContent('Pragmatic Anchoring');
  });

  it('has proper spacing and layout classes', () => {
    render(<Differentiator />);
    
    const section = document.querySelector('section');
    const container = document.querySelector('.max-w-7xl');
    
    // Check section padding
    expect(section).toHaveClass('py-24');
    
    // Check container max width and padding
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('has proper typography scaling', () => {
    render(<Differentiator />);
    
    const mainHeading = screen.getByRole('heading', { level: 2 });
    const columnHeadings = screen.getAllByRole('heading', { level: 3 });
    
    // Check responsive typography
    expect(mainHeading).toHaveClass('text-4xl', 'md:text-5xl', 'font-extrabold');
    
    columnHeadings.forEach(heading => {
      expect(heading).toHaveClass('text-2xl', 'font-bold');
    });
  });

  it('maintains proper content hierarchy and structure', () => {
    render(<Differentiator />);
    
    // Each column should have: icon container, title, and list of items
    const columns = document.querySelectorAll('.bg-white.rounded-2xl');
    expect(columns).toHaveLength(2);
    
    columns.forEach(column => {
      // Should have icon container
      const iconContainer = column.querySelector('.w-12.h-12');
      expect(iconContainer).toBeInTheDocument();
      
      // Should have list of items
      const list = column.querySelector('ul');
      expect(list).toBeInTheDocument();
      
      // Should have 4 list items
      const listItems = column.querySelectorAll('li');
      expect(listItems).toHaveLength(4);
    });
  });

  it('has responsive design with proper breakpoints', () => {
    render(<Differentiator />);
    
    const gridContainer = document.querySelector('.grid');
    
    // Check that it has responsive classes for different screen sizes
    expect(gridContainer).toHaveClass('grid-cols-1'); // Mobile first
    expect(gridContainer).toHaveClass('lg:grid-cols-2'); // Large screens
    expect(gridContainer).toHaveClass('gap-8'); // Base gap
    expect(gridContainer).toHaveClass('lg:gap-12'); // Larger gap on large screens
  });
});