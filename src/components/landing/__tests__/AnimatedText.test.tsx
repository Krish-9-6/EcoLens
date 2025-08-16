import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimatedText from '../ui/AnimatedText';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

describe('AnimatedText', () => {
  beforeEach(() => {
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders text correctly', () => {
    render(<AnimatedText text="Hello World" />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('splits text into individual words', () => {
    render(<AnimatedText text="This is a test" />);
    
    expect(screen.getByText('This')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AnimatedText text="Test" className="custom-class" />);
    
    const container = screen.getByText('Test').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('respects prefers-reduced-motion setting', async () => {
    // Mock prefers-reduced-motion: reduce
    mockMatchMedia.mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<AnimatedText text="Test content" className="test-class" />);

    // When reduced motion is preferred, the text should be rendered as a single block
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('accepts custom animation parameters', () => {
    render(
      <AnimatedText 
        text="Test" 
        delay={0.5} 
        duration={1.2} 
        staggerChildren={0.1}
        animationType="fadeIn"
      />
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles different animation types', () => {
    const { rerender } = render(
      <AnimatedText text="Test" animationType="fadeInUp" />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();

    rerender(<AnimatedText text="Test" animationType="fadeIn" />);
    expect(screen.getByText('Test')).toBeInTheDocument();

    rerender(<AnimatedText text="Test" animationType="typewriter" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});