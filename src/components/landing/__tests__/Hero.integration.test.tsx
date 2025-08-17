import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Hero from '../sections/Hero';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
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

describe('Hero Integration Test', () => {
  it('renders without crashing and displays all required elements', () => {
    const { container } = render(<Hero />);
    
    // Check main structure
    const heroSection = container.querySelector('section');
    expect(heroSection).toBeInTheDocument();
    
    // Check headline
    expect(screen.getByText('From Black Box to Crystal Clear')).toBeInTheDocument();
    
    // Check sub-headline
    expect(screen.getByText('EcoLens is the trust engine for the new era of fashion')).toBeInTheDocument();
    
    // Check CTA buttons
    expect(screen.getByRole('link', { name: /request a demo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see it in action/i })).toBeInTheDocument();
    
    // Check scroll indicator
    const scrollIndicator = container.querySelector('.absolute.bottom-8');
    expect(scrollIndicator).toBeInTheDocument();
  });
});