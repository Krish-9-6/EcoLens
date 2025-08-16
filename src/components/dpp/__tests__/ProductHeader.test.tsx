import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductHeader } from '../ProductHeader';

describe('ProductHeader', () => {
  const defaultProps = {
    productName: 'Test Product',
    brandName: 'Test Brand',
  };

  describe('Basic Rendering', () => {
    it('should render product name and brand name', () => {
      render(<ProductHeader {...defaultProps} />);
      
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('TEST BRAND')).toBeInTheDocument();
    });

    it('should render the descriptive text', () => {
      render(<ProductHeader {...defaultProps} />);
      
      expect(screen.getByText('Discover the complete journey of this product from raw materials to your hands.')).toBeInTheDocument();
    });

    it('should render within a Card component', () => {
      const { container } = render(<ProductHeader {...defaultProps} />);
      
      // Check for card structure
      expect(container.querySelector('.w-full')).toBeInTheDocument();
    });
  });

  describe('Product Image Handling', () => {
    it('should render image when imageUrl is provided', () => {
      render(
        <ProductHeader 
          {...defaultProps} 
          imageUrl="https://example.com/product.jpg" 
        />
      );
      
      const image = screen.getByAltText('Test Product product image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/product.jpg');
    });

    it('should render fallback initials when no image is provided', () => {
      render(<ProductHeader {...defaultProps} />);
      
      // Should show initials "TE" for "Test Product"
      expect(screen.getByText('TE')).toBeInTheDocument();
    });

    it('should handle single word product names for initials', () => {
      render(
        <ProductHeader 
          productName="Smartphone" 
          brandName="TechCorp" 
        />
      );
      
      // Should show first two characters "SM" for "Smartphone"
      expect(screen.getByText('SM')).toBeInTheDocument();
    });

    it('should handle multiple word product names for initials', () => {
      render(
        <ProductHeader 
          productName="Organic Cotton T-Shirt" 
          brandName="EcoWear" 
        />
      );
      
      // Should show first character of first two words "OC"
      expect(screen.getByText('OC')).toBeInTheDocument();
    });

    it('should handle product names with extra spaces', () => {
      render(
        <ProductHeader 
          productName="  Eco   Friendly   Bottle  " 
          brandName="GreenCorp" 
        />
      );
      
      // Should show "EF" for "Eco Friendly"
      expect(screen.getByText('EF')).toBeInTheDocument();
    });
  });

  describe('Brand Name Formatting', () => {
    it('should display brand name in uppercase', () => {
      render(
        <ProductHeader 
          productName="Test Product" 
          brandName="lowercase brand" 
        />
      );
      
      expect(screen.getByText('LOWERCASE BRAND')).toBeInTheDocument();
    });

    it('should handle brand names with special characters', () => {
      render(
        <ProductHeader 
          productName="Test Product" 
          brandName="Brand & Co." 
        />
      );
      
      expect(screen.getByText('BRAND & CO.')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive classes for different screen sizes', () => {
      const { container } = render(<ProductHeader {...defaultProps} />);
      
      // Check for responsive flex classes
      const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
      
      // Check for responsive text sizing
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl');
    });

    it('should have responsive avatar sizing', () => {
      const { container } = render(<ProductHeader {...defaultProps} />);
      
      // Avatar should have responsive sizing classes
      const avatar = container.querySelector('[class*="w-24"][class*="h-24"][class*="md:w-32"][class*="md:h-32"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ProductHeader {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Product');
    });

    it('should have proper alt text for product image', () => {
      render(
        <ProductHeader 
          {...defaultProps} 
          imageUrl="https://example.com/product.jpg" 
        />
      );
      
      const image = screen.getByAltText('Test Product product image');
      expect(image).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      render(<ProductHeader {...defaultProps} />);
      
      // Should have proper paragraph elements
      const brandParagraph = screen.getByText('TEST BRAND').closest('p');
      expect(brandParagraph).toBeInTheDocument();
      
      const descriptionParagraph = screen.getByText(/Discover the complete journey/).closest('p');
      expect(descriptionParagraph).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty product name gracefully', () => {
      render(
        <ProductHeader 
          productName="" 
          brandName="Test Brand" 
        />
      );
      
      // Should still render without crashing
      expect(screen.getByText('TEST BRAND')).toBeInTheDocument();
    });

    it('should handle empty brand name gracefully', () => {
      render(
        <ProductHeader 
          productName="Test Product" 
          brandName="" 
        />
      );
      
      // Should still render without crashing
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('should handle very long product names', () => {
      const longProductName = 'This is a very long product name that should still render properly without breaking the layout or causing any issues';
      
      render(
        <ProductHeader 
          productName={longProductName} 
          brandName="Test Brand" 
        />
      );
      
      expect(screen.getByText(longProductName)).toBeInTheDocument();
    });

    it('should handle special characters in product names', () => {
      render(
        <ProductHeader 
          productName="Product™ & Co. (2024)" 
          brandName="Brand®" 
        />
      );
      
      expect(screen.getByText('Product™ & Co. (2024)')).toBeInTheDocument();
      expect(screen.getByText('BRAND®')).toBeInTheDocument();
    });
  });
});