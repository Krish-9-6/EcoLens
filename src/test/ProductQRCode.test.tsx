import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductQRCode from '../components/ui/ProductQRCode';
import { mockNodeEnv } from './setup';

// Mock react-qr-code since it's a visual component
vi.mock('react-qr-code', () => ({
  default: ({ value, size, style, viewBox, level }: any) => (
    <div 
      data-testid="qr-code"
      data-value={value}
      data-size={size}
      data-viewbox={viewBox}
      data-level={level}
      style={style}
    >
      QR Code for: {value}
    </div>
  )
}));

describe('ProductQRCode', () => {

  describe('URL Generation', () => {
    it('should generate localhost URL in development environment', () => {
      const restore = mockNodeEnv('development');
      
      render(<ProductQRCode productId="test-product-123" />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-value', 'http://localhost:3000/dpp/test-product-123');
      restore();
    });

    it('should generate production URL with NEXT_PUBLIC_VERCEL_URL', () => {
      const restore = mockNodeEnv('production');
      process.env.NEXT_PUBLIC_VERCEL_URL = 'ecolens-production.vercel.app';
      
      render(<ProductQRCode productId="test-product-456" />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-value', 'https://ecolens-production.vercel.app/dpp/test-product-456');
      restore();
    });

    it('should fallback to default production domain when NEXT_PUBLIC_VERCEL_URL is not set', () => {
      const restore = mockNodeEnv('production');
      delete process.env.NEXT_PUBLIC_VERCEL_URL;
      
      render(<ProductQRCode productId="test-product-789" />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-value', 'https://ecolens.vercel.app/dpp/test-product-789');
      restore();
    });

    it('should handle special characters in product ID', () => {
      const restore = mockNodeEnv('development');
      
      render(<ProductQRCode productId="test-product-with-special-chars_123" />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-value', 'http://localhost:3000/dpp/test-product-with-special-chars_123');
      restore();
    });
  });

  describe('QR Code Rendering', () => {
    it('should render QR code with default size', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-size', '200');
    });

    it('should render QR code with custom size', () => {
      render(<ProductQRCode productId="test-product" size={150} />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-size', '150');
    });

    it('should apply proper QR code configuration for scanning', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-viewbox', '0 0 256 256');
      expect(qrCode).toHaveAttribute('data-level', 'M');
    });

    it('should have white background for proper contrast', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const qrCode = screen.getByTestId('qr-code');
      const style = qrCode.style;
      expect(style.backgroundColor).toBe('white');
    });
  });

  describe('Component Styling', () => {
    it('should apply default styling with white background and padding', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const container = screen.getByTestId('qr-code').parentElement;
      expect(container).toHaveClass('inline-block', 'p-4', 'bg-white', 'rounded-lg', 'shadow-sm');
      // Check that the container has the proper styling attributes
      expect(container).toHaveAttribute('style');
    });

    it('should apply custom className', () => {
      render(<ProductQRCode productId="test-product" className="custom-class" />);
      
      const container = screen.getByTestId('qr-code').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('should display the URL below the QR code', () => {
      const restore = mockNodeEnv('development');
      
      render(<ProductQRCode productId="test-product" />);
      
      const urlDisplay = screen.getByText('http://localhost:3000/dpp/test-product');
      expect(urlDisplay).toBeInTheDocument();
      expect(urlDisplay).toHaveClass('mt-2', 'text-xs', 'text-gray-600', 'text-center', 'font-mono', 'break-all');
      restore();
    });
  });

  describe('Accessibility', () => {
    it('should be properly contained for screen readers', () => {
      render(<ProductQRCode productId="test-product" />);
      
      const container = screen.getByTestId('qr-code').parentElement;
      expect(container).toBeInTheDocument();
      
      // URL should be visible for screen readers
      const urlText = screen.getByText('http://localhost:3000/dpp/test-product');
      expect(urlText).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty product ID', () => {
      const restore = mockNodeEnv('development');
      
      render(<ProductQRCode productId="" />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-value', 'http://localhost:3000/dpp/');
      restore();
    });

    it('should handle very long product IDs', () => {
      const longProductId = 'a'.repeat(100);
      const restore = mockNodeEnv('development');
      
      render(<ProductQRCode productId={longProductId} />);
      
      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toHaveAttribute('data-value', `http://localhost:3000/dpp/${longProductId}`);
      restore();
    });
  });
});