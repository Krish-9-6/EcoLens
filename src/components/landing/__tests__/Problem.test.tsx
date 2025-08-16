import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Problem from '../sections/Problem';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useInView: () => true,
}));

// Mock ScrollReveal component
vi.mock('../ui/ScrollReveal', () => ({
  default: ({ children, delay }: { children: React.ReactNode; delay?: number }) => (
    <div data-testid={`scroll-reveal${delay ? `-${delay}` : ''}`}>{children}</div>
  ),
}));

describe('Problem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section title correctly', () => {
    render(<Problem />);
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'The Fashion Industry Has a Trust Problem'
    );
  });

  it('displays the 24% statistic with correct description', () => {
    render(<Problem />);
    
    expect(screen.getByText('24%')).toBeInTheDocument();
    expect(screen.getByText('Average score on the Fashion Transparency Index')).toBeInTheDocument();
  });

  it('displays the 85% statistic with correct description', () => {
    render(<Problem />);
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Of major brands fail to disclose annual production volumes')).toBeInTheDocument();
  });

  it('uses ScrollReveal for animations', () => {
    render(<Problem />);
    
    // Check that ScrollReveal components are rendered
    expect(screen.getByTestId('scroll-reveal')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-reveal-0.2')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    const { container } = render(<Problem />);
    
    // Check for section element
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('py-20', 'px-4', 'bg-slate-50');
  });

  it('uses responsive grid layout for statistics', () => {
    render(<Problem />);
    
    // Find the grid container
    const gridContainer = screen.getByText('24%').closest('.grid');
    expect(gridContainer).toHaveClass('grid', 'md:grid-cols-2', 'gap-12');
  });

  it('applies correct styling to statistics', () => {
    render(<Problem />);
    
    const stat24 = screen.getByText('24%');
    const stat85 = screen.getByText('85%');
    
    expect(stat24).toHaveClass('text-6xl', 'md:text-7xl', 'font-extrabold', 'text-red-600');
    expect(stat85).toHaveClass('text-6xl', 'md:text-7xl', 'font-extrabold', 'text-red-600');
  });

  it('applies correct styling to descriptions', () => {
    render(<Problem />);
    
    const desc1 = screen.getByText('Average score on the Fashion Transparency Index');
    const desc2 = screen.getByText('Of major brands fail to disclose annual production volumes');
    
    expect(desc1).toHaveClass('text-lg', 'md:text-xl', 'text-slate-700', 'leading-relaxed');
    expect(desc2).toHaveClass('text-lg', 'md:text-xl', 'text-slate-700', 'leading-relaxed');
  });

  it('centers content appropriately', () => {
    render(<Problem />);
    
    const titleContainer = screen.getByRole('heading').closest('.text-center');
    expect(titleContainer).toBeInTheDocument();
    
    const statsContainer = screen.getByText('24%').closest('.text-center');
    expect(statsContainer).toBeInTheDocument();
  });

  it('uses proper max-width constraints', () => {
    const { container } = render(<Problem />);
    
    // Check main container
    const mainContainer = container.querySelector('.max-w-6xl');
    expect(mainContainer).toBeInTheDocument();
    
    // Check stats container
    const statsContainer = screen.getByText('24%').closest('.max-w-4xl');
    expect(statsContainer).toBeInTheDocument();
  });
});