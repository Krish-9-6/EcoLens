import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProductQRCode from '../ProductQRCode';

// Mock react-qr-code with more detailed mock
vi.mock('react-qr-code', () => ({
  default: ({ value, size, style, viewBox, level, ...props }: any) => {
    // Simulate QR code generation behavior
    const isValidUrl = value && typeof value === 'string' && value.length > 0;
    
    return (
      <div 
        data-testid="qr-code"
        data-value={value}
        data-size={size}
        data-viewbox={viewBox}
        data-level={level}
        data-valid={isValidUrl}
        style={style}
        {...props}
      >
        {isValidUrl ? `QR Code: ${value}` : 'Invalid QR Code'}
      </div>
    );
  }
}));

describe('ProductQRCode Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment-based URL Generation', () => {
    it('should generate correct URLs across different environments', () => {
      const testCases = [
        {
          env: 'development',
          vercelUrl: undefined,
          expected: 'http://localhost:3000/dpp/test-product'
        },
        {
          env: 'production',
          vercelUrl: 'myapp.vercel.app',
          expected: 'https://myapp.vercel.app/dpp/test-product'
        },
        {
          env: 'production',
          vercelUrl: undefined,
          expected: 'https://ecolens.vercel.app/dpp/test-product'
        },
        {
          env: 'test',
          vercelUrl: 'test-env.vercel.app',
          expected: 'https://test-env.vercel.app/dpp/test-product'
        }
      ];

      testCases.forEach(({ env, vercelUrl, expected }) => {
        process.env.NODE_ENV = env;
        if (vercelUrl) {
          process.env.NEXT_PUBLIC_VERCEL_URL = vercelUrl;
        } else {
          delete process.env.NEXT_PUBLIC_VERCEL_URL;
        }

        const { unmount } = render(<ProductQRCode productId="test-product" />);
        
        const qrCode = screen.getByTestId('qr-code');
        expect(qrCode).toHaveAttribute('data-value', expected);
        
        unmount();
      });
    });

    it('should handle complex product IDs in URLs', () => {
      const complexProductIds = [
        'product-with-dashes-123',
        'product_with_underscores_456',
        'product.with.dots.789',
        'UPPERCASE-PRODUCT-ID',
        'product123withNumbers456',
        'product-with-special-chars!@#'
      ];

      complexProductIds.forEach(productId => {
        process.env.NODE_ENV = 'development';
        
        const { unmount } = render(<ProductQRCode productId={productId} />);
        
        const qrCode = screen.getByTestId('qr-code');
        expect(qrCode).toHaveAttribute('data-value', `http://localhost:3000/dpp/${productId}`);
        
        unmount();
      });
    });
  });

  describe('QR Code Configuration Integration', () => {
    it('should generate scannable QR codes with proper configuration', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const qrCode = screen.getByTestId('qr-code');
      
      // Should have proper error correction level for scanning
      expect(qrCode).toHaveAttribute('data-level', 'M');
      
      // Should have proper viewBox for scaling
      expect(qrCode).toHaveAttribute('data-viewbox', '0 0 256 256');
      
      // Should have default size
      expect(qrCode).toHaveAttribute('data-size', '200');
      
      // Should be marked as valid
      expect(qrCode).toHaveAttribute('data-valid', 'true');
    });

    it('should support custom sizes while maintaining scannability', () => {
      const sizes = [100, 150, 200, 250, 300];
      
      sizes.forEach(size => {
        const { unmount } = render(<ProductQRCode productId="test-product" size={size} />);
        
        const qrCode = screen.getByTestId('qr-code');
        expect(qrCode).toHaveAttribute('data-size', size.toString());
        expect(qrCode).toHaveAttribute('data-valid', 'true');
        
        unmount();
      });
    });

    it('should maintain white background for contrast', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const qrCode = screen.getByTestId('qr-code');
      const style = qrCode.style;
      expect(style.backgroundColor).toBe('white');
    });
  });

  describe('Component Styling Integration', () => {
    it('should apply consistent styling across different props', () => {
      const testCases = [
        { productId: 'short', size: 100 },
        { productId: 'medium-length-product-id', size: 200 },
        { productId: 'very-long-product-id-with-many-characters-and-dashes', size: 300 }
      ];

      testCases.forEach(({ productId, size }) => {
        const { container, unmount } = render(
          <ProductQRCode productId={productId} size={size} />
        );
        
        // Container should have consistent styling
        const wrapper = container.querySelector('.inline-block.p-4.bg-white.rounded-lg.shadow-sm');
        expect(wrapper).toBeInTheDocument();
        
        // URL display should be consistent
        const urlDisplay = screen.getByText(new RegExp(productId));
        expect(urlDisplay).toHaveClass('mt-2', 'text-xs', 'text-gray-600', 'text-center', 'font-mono', 'break-all');
        
        unmount();
      });
    });

    it('should handle custom className properly', () => {
      const customClasses = ['custom-qr', 'border-2', 'border-red-500', 'my-custom-class'];
      
      customClasses.forEach(className => {
        const { container, unmount } = render(
          <ProductQRCode productId="test-product" className={className} />
        );
        
        const wrapper = container.querySelector(`.${className}`);
        expect(wrapper).toBeInTheDocument();
        
        // Should still have base classes
        expect(wrapper).toHaveClass('inline-block', 'p-4', 'bg-white', 'rounded-lg', 'shadow-sm');
        
        unmount();
      });
    });
  });

  describe('URL Display Integration', () => {
    it('should display URLs that match QR code content', () => {
      const testCases = [
        {
          env: 'development',
          productId: 'test-123',
          expected: 'http://localhost:3000/dpp/test-123'
        },
        {
          env: 'production',
          productId: 'prod-456',
          vercelUrl: 'myapp.vercel.app',
          expected: 'https://myapp.vercel.app/dpp/prod-456'
        }
      ];

      testCases.forEach(({ env, productId, vercelUrl, expected }) => {
        process.env.NODE_ENV = env;
        if (vercelUrl) {
          process.env.NEXT_PUBLIC_VERCEL_URL = vercelUrl;
        } else {
          delete process.env.NEXT_PUBLIC_VERCEL_URL;
        }

        const { unmount } = render(<ProductQRCode productId={productId} />);
        
        // QR code should have the URL
        const qrCode = screen.getByTestId('qr-code');
        expect(qrCode).toHaveAttribute('data-value', expected);
        
        // Display should show the same URL
        expect(screen.getByText(expected)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should handle very long URLs gracefully', () => {
      const longProductId = 'a'.repeat(200);
      process.env.NODE_ENV = 'development';
      
      render(<ProductQRCode productId={longProductId} />);
      
      const expectedUrl = `http://localhost:3000/dpp/${longProductId}`;
      
      // Should display the full URL
      expect(screen.getByText(expectedUrl)).toBeInTheDocument();
      
      // Should have break-all class for long URLs
      const urlElement = screen.getByText(expectedUrl);
      expect(urlElement).toHaveClass('break-all');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing environment variables gracefully', () => {
      // Remove all relevant environment variables
      delete process.env.NODE_ENV;
      delete process.env.NEXT_PUBLIC_VERCEL_URL;
      
      render(<ProductQRCode productId="test-product" />);
      
      // Should still render without crashing
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toBeInTheDocument();
      expect(qrCode).toHaveAttribute('data-valid', 'true');
    });

    it('should handle invalid size props gracefully', () => {
      const invalidSizes = [0, -100, NaN, Infinity];
      
      invalidSizes.forEach(size => {
        const { unmount } = render(<ProductQRCode productId="test-product" size={size} />);
        
        // Should still render without crashing
        const qrCode = screen.getByTestId('qr-code');
        expect(qrCode).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should be accessible with screen readers', () => {
      process.env.NODE_ENV = 'development';
      
      render(<ProductQRCode productId="test-product" />);
      
      // URL should be visible and readable
      const url = screen.getByText('http://localhost:3000/dpp/test-product');
      expect(url).toBeInTheDocument();
      expect(url).toBeVisible();
      
      // Container should be properly structured
      const container = url.closest('.inline-block');
      expect(container).toBeInTheDocument();
    });

    it('should work with different contrast requirements', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const qrCode = screen.getByTestId('qr-code');
      
      // Should have white background for contrast
      expect(qrCode.style.backgroundColor).toBe('white');
      
      // Container should have proper styling for visibility
      const container = qrCode.closest('.bg-white');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should render efficiently with different product IDs', () => {
      const productIds = Array.from({ length: 10 }, (_, i) => `product-${i}`);
      
      productIds.forEach(productId => {
        const startTime = performance.now();
        
        const { unmount } = render(<ProductQRCode productId={productId} />);
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Should render quickly (less than 100ms)
        expect(renderTime).toBeLessThan(100);
        
        // Should render successfully
        expect(screen.getByTestId('qr-code')).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should handle rapid re-renders without issues', () => {
      const { rerender } = render(<ProductQRCode productId="initial" />);
      
      // Rapidly change product IDs
      for (let i = 0; i < 10; i++) {
        rerender(<ProductQRCode productId={`product-${i}`} />);
        
        const qrCode = screen.getByTestId('qr-code');
        expect(qrCode).toHaveAttribute('data-value', expect.stringContaining(`product-${i}`));
      }
    });
  });
});