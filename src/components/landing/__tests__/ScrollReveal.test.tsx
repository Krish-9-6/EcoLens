import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ScrollReveal from '../ui/ScrollReveal';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useInView: vi.fn(() => true),
}));

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

describe('ScrollReveal', () => {
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

  it('renders children correctly', () => {
    render(
      <ScrollReveal>
        <div>Test content</div>
      </ScrollReveal>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ScrollReveal className="custom-class">
        <div>Test content</div>
      </ScrollReveal>
    );

    const container = screen.getByText('Test content').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('respects prefers-reduced-motion setting', () => {
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

    render(
      <ScrollReveal className="test-class">
        <div>Test content</div>
      </ScrollReveal>
    );

    // The component should render the content regardless of motion preference
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('accepts custom animation parameters', () => {
    render(
      <ScrollReveal delay={0.5} duration={1.2} threshold={0.3}>
        <div>Test content</div>
      </ScrollReveal>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});