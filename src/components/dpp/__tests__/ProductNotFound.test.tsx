import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductNotFound } from '../ProductNotFound';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ProductNotFound', () => {
  const defaultProps = {
    productId: 'test-product-123',
  };

  describe('Basic Rendering', () => {
    it('should render the main heading', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
    });

    it('should display the product ID', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      expect(screen.getByText('test-product-123')).toBeInTheDocument();
      expect(screen.getByText('Product ID:')).toBeInTheDocument();
    });

    it('should render the main error message', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      expect(screen.getByText("We couldn't find a digital passport for this product.")).toBeInTheDocument();
    });

    it('should render the error icon', () => {
      const { container } = render(<ProductNotFound {...defaultProps} />);
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-12', 'h-12', 'text-gray-400');
    });
  });

  describe('Possible Reasons Section', () => {
    it('should display the reasons heading', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      expect(screen.getByText('This could happen if:')).toBeInTheDocument();
    });

    it('should list all possible reasons', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      expect(screen.getByText('The product ID is incorrect or has been mistyped')).toBeInTheDocument();
      expect(screen.getByText("The product hasn't been registered in our system yet")).toBeInTheDocument();
      expect(screen.getByText('The QR code may be damaged or outdated')).toBeInTheDocument();
    });

    it('should render reasons as a list with bullet points', () => {
      const { container } = render(<ProductNotFound {...defaultProps} />);
      
      const bulletPoints = container.querySelectorAll('.text-gray-400');
      const bullets = Array.from(bulletPoints).filter(el => el.textContent === '•');
      expect(bullets).toHaveLength(3);
    });
  });

  describe('Help Section', () => {
    it('should display help message', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      expect(screen.getByText('Need help? Contact the brand or retailer where you purchased this product.')).toBeInTheDocument();
    });

    it('should render "Return to Home" link', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      const homeLink = screen.getByText('Return to Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('Retry Functionality', () => {
    it('should render retry button when onRetry is provided', () => {
      const mockRetry = vi.fn();
      
      render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = vi.fn();
      
      render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should render refresh icon in retry button', () => {
      const mockRetry = vi.fn();
      render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('Try Again');
      const refreshIcon = retryButton.parentElement?.querySelector('.w-4.h-4');
      expect(refreshIcon).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have centered layout', () => {
      const { container } = render(<ProductNotFound {...defaultProps} />);
      
      const mainContainer = container.querySelector('.container.mx-auto.px-4.py-16');
      expect(mainContainer).toBeInTheDocument();
      
      const centeredContent = container.querySelector('.max-w-md.mx-auto.text-center');
      expect(centeredContent).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      const { container } = render(<ProductNotFound {...defaultProps} />);
      
      const spacedSections = container.querySelectorAll('.space-y-4, .mb-8, .mb-6');
      expect(spacedSections.length).toBeGreaterThan(0);
    });

    it('should display product ID in monospace font', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      const productIdElement = screen.getByText('test-product-123');
      expect(productIdElement).toHaveClass('bg-gray-100', 'px-2', 'py-1', 'rounded', 'text-xs', 'font-mono');
    });
  });

  describe('Button Styling', () => {
    it('should style retry button as secondary', () => {
      const mockRetry = vi.fn();
      
      render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('Try Again').closest('button');
      expect(retryButton).toHaveClass(
        'inline-flex', 'items-center', 'justify-center', 'gap-2',
        'px-4', 'py-2', 'border', 'border-gray-300',
        'text-sm', 'font-medium', 'rounded-md',
        'text-gray-700', 'bg-white'
      );
    });

    it('should style home link as primary', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      const homeLink = screen.getByText('Return to Home').closest('a');
      expect(homeLink).toHaveClass(
        'inline-flex', 'items-center', 'justify-center',
        'px-4', 'py-2', 'border', 'border-transparent',
        'text-sm', 'font-medium', 'rounded-md',
        'text-white', 'bg-blue-600'
      );
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive button layout', () => {
      const mockRetry = vi.fn();
      const { container } = render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      const buttonContainer = container.querySelector('.flex.flex-col.sm\\:flex-row.gap-3');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('should handle different screen sizes', () => {
      const { container } = render(<ProductNotFound {...defaultProps} />);
      
      // Should have responsive classes for different breakpoints
      expect(container.querySelector('.text-center')).toBeInTheDocument();
      expect(container.querySelector('.max-w-md')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Product Not Found');
    });

    it('should have proper button semantics', () => {
      const mockRetry = vi.fn();
      
      render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should have proper link semantics', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      const homeLink = screen.getByRole('link', { name: /return to home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have focus management for interactive elements', () => {
      const mockRetry = vi.fn();
      
      render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('Try Again').closest('button');
      const homeLink = screen.getByText('Return to Home').closest('a');
      
      expect(retryButton).toHaveClass('focus:outline-none', 'focus:ring-2');
      expect(homeLink).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty product ID', () => {
      render(<ProductNotFound productId="" />);
      
      expect(screen.getByText('Product ID:')).toBeInTheDocument();
      // Should still render without crashing
    });

    it('should handle very long product IDs', () => {
      const longProductId = 'a'.repeat(100);
      
      render(<ProductNotFound productId={longProductId} />);
      
      expect(screen.getByText(longProductId)).toBeInTheDocument();
    });

    it('should handle special characters in product ID', () => {
      const specialProductId = 'product-123!@#$%^&*()';
      
      render(<ProductNotFound productId={specialProductId} />);
      
      expect(screen.getByText(specialProductId)).toBeInTheDocument();
    });

    it('should handle unicode characters in product ID', () => {
      const unicodeProductId = 'product-αβγδε-123';
      
      render(<ProductNotFound productId={unicodeProductId} />);
      
      expect(screen.getByText(unicodeProductId)).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should provide clear error explanation', () => {
      render(<ProductNotFound {...defaultProps} />);
      
      // Should explain what happened
      expect(screen.getByText("We couldn't find a digital passport for this product.")).toBeInTheDocument();
      
      // Should provide possible reasons
      expect(screen.getByText('This could happen if:')).toBeInTheDocument();
      
      // Should offer help
      expect(screen.getByText('Need help? Contact the brand or retailer where you purchased this product.')).toBeInTheDocument();
    });

    it('should provide actionable next steps', () => {
      const mockRetry = vi.fn();
      
      render(<ProductNotFound {...defaultProps} onRetry={mockRetry} />);
      
      // Should offer retry option
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      
      // Should offer navigation option
      expect(screen.getByText('Return to Home')).toBeInTheDocument();
    });
  });
});