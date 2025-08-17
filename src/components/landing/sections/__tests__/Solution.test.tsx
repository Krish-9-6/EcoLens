import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Solution from '../Solution';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, whileHover: _whileHover, ...props }: any) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  useInView: () => true,
}));

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
  Workflow: ({ className }: any) => (
    <div data-testid="workflow-icon" className={className}>
      Workflow
    </div>
  ),
  BadgeCheck: ({ className }: any) => (
    <div data-testid="badgecheck-icon" className={className}>
      BadgeCheck
    </div>
  ),
  ScanLine: ({ className }: any) => (
    <div data-testid="scanline-icon" className={className}>
      ScanLine
    </div>
  ),
}));

describe('Solution Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main section title and subtitle', () => {
    render(<Solution />);
    
    expect(screen.getByText('Our 3-Step Process to Radical Transparency')).toBeInTheDocument();
    expect(screen.getByText('Transform your supply chain from opaque to transparent with our proven methodology')).toBeInTheDocument();
  });

  it('renders all three solution steps', () => {
    render(<Solution />);
    
    // Check step titles
    expect(screen.getByText('Map Your Chain')).toBeInTheDocument();
    expect(screen.getByText('Anchor Your Claims')).toBeInTheDocument();
    expect(screen.getByText('Tell Your Story')).toBeInTheDocument();
    
    // Check step subtitles
    expect(screen.getByText('MAP')).toBeInTheDocument();
    expect(screen.getByText('VERIFY')).toBeInTheDocument();
    expect(screen.getByText('REVEAL')).toBeInTheDocument();
  });

  it('renders correct icons for each step', () => {
    render(<Solution />);
    
    expect(screen.getByTestId('workflow-icon')).toBeInTheDocument();
    expect(screen.getByTestId('badgecheck-icon')).toBeInTheDocument();
    expect(screen.getByTestId('scanline-icon')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<Solution />);
    
    expect(screen.getByText(/Visualize your entire supply network/)).toBeInTheDocument();
    expect(screen.getByText(/Secure your sustainability claims with blockchain verification/)).toBeInTheDocument();
    expect(screen.getByText(/Generate beautiful Digital Product Passports/)).toBeInTheDocument();
  });

  it('implements staggered animation delays', () => {
    render(<Solution />);
    
    const scrollRevealElements = screen.getAllByTestId('scroll-reveal');
    
    // Find the step elements (excluding the title section)
    const stepElements = scrollRevealElements.filter(el => 
      el.getAttribute('data-delay') !== null
    );
    
    expect(stepElements).toHaveLength(3);
    expect(stepElements[0]).toHaveAttribute('data-delay', '0');
    expect(stepElements[1]).toHaveAttribute('data-delay', '0.15');
    expect(stepElements[2]).toHaveAttribute('data-delay', '0.3');
  });

  it('has proper responsive grid layout classes', () => {
    render(<Solution />);
    
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-3');
  });

  it('applies correct styling classes', () => {
    render(<Solution />);
    
    // Check section background
    const section = document.querySelector('section');
    expect(section).toHaveClass('bg-white');
    
    // Check icon containers have green background
    const iconContainers = document.querySelectorAll('.bg-green-500');
    expect(iconContainers).toHaveLength(3);
  });

  it('renders motion divs for hover effects', () => {
    render(<Solution />);
    
    const motionDivs = screen.getAllByTestId('motion-div');
    expect(motionDivs).toHaveLength(3); // One for each step card
  });

  it('has accessible structure with proper headings', () => {
    render(<Solution />);
    
    // Main heading should be h2
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toHaveTextContent('Our 3-Step Process to Radical Transparency');
    
    // Step titles should be h3
    const stepHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(stepHeadings).toHaveLength(3);
    expect(stepHeadings[0]).toHaveTextContent('Map Your Chain');
    expect(stepHeadings[1]).toHaveTextContent('Anchor Your Claims');
    expect(stepHeadings[2]).toHaveTextContent('Tell Your Story');
  });

  it('maintains proper content hierarchy', () => {
    render(<Solution />);
    
    // Each step should have: icon, subtitle, title, description
    const stepCards = screen.getAllByTestId('motion-div');
    
    stepCards.forEach((card, index) => {
      const expectedSubtitles = ['MAP', 'VERIFY', 'REVEAL'];
      const expectedTitles = ['Map Your Chain', 'Anchor Your Claims', 'Tell Your Story'];
      
      expect(card).toHaveTextContent(expectedSubtitles[index]);
      expect(card).toHaveTextContent(expectedTitles[index]);
    });
  });
}); 
 it('has responsive design with proper breakpoints', () => {
    render(<Solution />);
    
    const gridContainer = document.querySelector('.grid');
    
    // Check that it has responsive classes for different screen sizes
    expect(gridContainer).toHaveClass('grid-cols-1'); // Mobile first
    expect(gridContainer).toHaveClass('md:grid-cols-3'); // Medium screens and up
    expect(gridContainer).toHaveClass('gap-8'); // Base gap
    expect(gridContainer).toHaveClass('lg:gap-12'); // Larger gap on large screens
  });

  it('has proper spacing and layout classes', () => {
    render(<Solution />);
    
    const section = document.querySelector('section');
    const container = document.querySelector('.max-w-7xl');
    
    // Check section padding
    expect(section).toHaveClass('py-24');
    
    // Check container max width and padding
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('has proper typography scaling', () => {
    render(<Solution />);
    
    const mainHeading = screen.getByRole('heading', { level: 2 });
    const stepHeadings = screen.getAllByRole('heading', { level: 3 });
    
    // Check responsive typography
    expect(mainHeading).toHaveClass('text-4xl', 'md:text-5xl', 'font-extrabold');
    
    stepHeadings.forEach(heading => {
      expect(heading).toHaveClass('text-2xl', 'font-bold');
    });
  });