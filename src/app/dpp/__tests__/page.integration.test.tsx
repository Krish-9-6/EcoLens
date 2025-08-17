import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DppPage, { generateMetadata } from '../[productId]/page';
import type { DppData } from '<ecolens>/lib/types';

// Mock the data fetching function
vi.mock('<ecolens>/lib/data', () => ({
  fetchDppData: vi.fn(),
}));

// Mock Next.js dynamic import for map component
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<React.ComponentType>, options: { ssr?: boolean }) => {
    if (options?.ssr === false) {
      return ({ children, ...props }: React.ComponentProps<'div'>) => (
        <div data-testid="mock-dynamic-component" {...props}>
          {children}
        </div>
      );
    }
    return importFn;
  },
}));

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="map-container" {...props}>{children}</div>
  ),
  TileLayer: (props: React.ComponentProps<'div'>) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="marker" {...props}>{children}</div>
  ),
  Popup: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="popup" {...props}>{children}</div>
  ),
}));

describe('DPP Page Integration', () => {
  const mockFetchDppData = vi.mocked((await import('<ecolens>/lib/data')).fetchDppData);
  
  const mockDppData: DppData = {
    product: {
      id: 'product-123',
      name: 'Eco-Friendly T-Shirt',
      image_url: 'https://example.com/tshirt.jpg',
      brand_id: 'brand-456',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      brand: {
        id: 'brand-456',
        name: 'EcoWear',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    },
    suppliers: [
      {
        id: 'supplier-1',
        name: 'Organic Cotton Farm',
        tier: 3,
        location: 'India',
        latitude: 20.5937,
        longitude: 78.9629,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        certificates: [
          {
            id: 'cert-1',
            supplier_id: 'supplier-1',
            name: 'GOTS Organic Certification',
            type: 'Sustainability',
            issued_date: '2024-01-01',
            verified_at: '2024-01-02T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            ledger_entry: {
              id: 'ledger-1',
              certificate_id: 'cert-1',
              data_hash: 'abc123def456ghi789jkl012',
              timestamp: '2024-01-02T00:00:00Z',
              created_at: '2024-01-02T00:00:00Z',
            }
          }
        ]
      },
      {
        id: 'supplier-2',
        name: 'Textile Mill',
        tier: 2,
        location: 'Bangladesh',
        latitude: 23.6850,
        longitude: 90.3563,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        certificates: [
          {
            id: 'cert-2',
            supplier_id: 'supplier-2',
            name: 'Fair Trade Certification',
            type: 'Social',
            issued_date: '2024-01-15',
            verified_at: null,
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
          }
        ]
      },
      {
        id: 'supplier-3',
        name: 'Garment Factory',
        tier: 1,
        location: 'Vietnam',
        latitude: 21.0285,
        longitude: 105.8542,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        certificates: []
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      mockFetchDppData.mockResolvedValue(mockDppData);
    });

    it('should render all main sections when data is available', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      // Product Header
      expect(screen.getByText('Eco-Friendly T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('ECOWEAR')).toBeInTheDocument();
      
      // Journey Timeline
      expect(screen.getByText('Supply Chain Journey')).toBeInTheDocument();
      expect(screen.getByText('Organic Cotton Farm')).toBeInTheDocument();
      expect(screen.getByText('Textile Mill')).toBeInTheDocument();
      expect(screen.getByText('Garment Factory')).toBeInTheDocument();
      
      // Supply Chain Map
      expect(screen.getByText('Supply Chain Map')).toBeInTheDocument();
      
      // Certificates
      expect(screen.getByText('Certificates & Verifications')).toBeInTheDocument();
      expect(screen.getByText('GOTS Organic Certification')).toBeInTheDocument();
      expect(screen.getByText('Fair Trade Certification')).toBeInTheDocument();
    });

    it('should render product header with correct information', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      expect(screen.getByText('Eco-Friendly T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('ECOWEAR')).toBeInTheDocument();
      expect(screen.getByText('Discover the complete journey of this product from raw materials to your hands.')).toBeInTheDocument();
    });

    it('should render journey timeline with suppliers in correct order', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      // Should be ordered by tier: 3 → 2 → 1
      const supplierNames = screen.getAllByText(/Organic Cotton Farm|Textile Mill|Garment Factory/);
      expect(supplierNames[0]).toHaveTextContent('Organic Cotton Farm'); // Tier 3
      expect(supplierNames[1]).toHaveTextContent('Textile Mill'); // Tier 2
      expect(supplierNames[2]).toHaveTextContent('Garment Factory'); // Tier 1
    });

    it('should render certificates with verification status', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      // Verified certificate
      expect(screen.getByText('GOTS Organic Certification')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
      
      // Unverified certificate
      expect(screen.getByText('Fair Trade Certification')).toBeInTheDocument();
      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });

    it('should render supply chain map with markers', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(3); // One for each supplier with coordinates
      });
    });

    it('should have proper page layout and styling', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      const { container } = render(await DppPage({ params }));
      
      // Main container
      const main = container.querySelector('main');
      expect(main).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-gray-50', 'to-gray-100');
      
      // Grid layout
      const grid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Product Not Found', () => {
    beforeEach(() => {
      mockFetchDppData.mockResolvedValue(null);
    });

    it('should render ProductNotFound component when data is null', async () => {
      const params = Promise.resolve({ productId: 'invalid-product' });
      
      render(await DppPage({ params }));
      
      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
      expect(screen.getByText('invalid-product')).toBeInTheDocument();
    });

    it('should not render main DPP sections when product not found', async () => {
      const params = Promise.resolve({ productId: 'invalid-product' });
      
      render(await DppPage({ params }));
      
      expect(screen.queryByText('Supply Chain Journey')).not.toBeInTheDocument();
      expect(screen.queryByText('Certificates & Verifications')).not.toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    beforeEach(() => {
      mockFetchDppData.mockResolvedValue(mockDppData);
    });

    it('should wrap components in error boundaries', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      const { container } = render(await DppPage({ params }));
      
      // Error boundaries should be present (though we can't easily test their functionality)
      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });

  describe('Data Fetching with Retry', () => {
    it('should call fetchDppData with retry options', async () => {
      mockFetchDppData.mockResolvedValue(mockDppData);
      const params = Promise.resolve({ productId: 'product-123' });
      
      await DppPage({ params });
      
      expect(mockFetchDppData).toHaveBeenCalledWith('product-123', {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000
      });
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetchDppData.mockRejectedValue(new Error('Network error'));
      const params = Promise.resolve({ productId: 'product-123' });
      
      // Should not throw, should render ProductNotFound instead
      render(await DppPage({ params }));
      
      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      mockFetchDppData.mockResolvedValue(mockDppData);
    });

    it('should pass correct props to ProductHeader', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      expect(screen.getByText('Eco-Friendly T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('ECOWEAR')).toBeInTheDocument();
      
      // Should have product image
      const image = screen.getByAltText('Eco-Friendly T-Shirt product image');
      expect(image).toHaveAttribute('src', 'https://example.com/tshirt.jpg');
    });

    it('should pass suppliers data to all components that need it', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      // Timeline should show all suppliers
      expect(screen.getByText('Organic Cotton Farm')).toBeInTheDocument();
      expect(screen.getByText('Textile Mill')).toBeInTheDocument();
      expect(screen.getByText('Garment Factory')).toBeInTheDocument();
      
      // Certificates should show certificates from suppliers
      expect(screen.getByText('GOTS Organic Certification')).toBeInTheDocument();
      expect(screen.getByText('Fair Trade Certification')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    beforeEach(() => {
      mockFetchDppData.mockResolvedValue(mockDppData);
    });

    it('should have responsive grid layout', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      const { container } = render(await DppPage({ params }));
      
      const grid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2.gap-8');
      expect(grid).toBeInTheDocument();
    });

    it('should have proper spacing between sections', async () => {
      const params = Promise.resolve({ productId: 'product-123' });
      const { container } = render(await DppPage({ params }));
      
      const spacedContainer = container.querySelector('.space-y-8');
      expect(spacedContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle product with no suppliers', async () => {
      const dataWithNoSuppliers: DppData = {
        ...mockDppData,
        suppliers: []
      };
      
      mockFetchDppData.mockResolvedValue(dataWithNoSuppliers);
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      expect(screen.getByText('Eco-Friendly T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('No supply chain information available.')).toBeInTheDocument();
      expect(screen.getByText('No certificates available for this product.')).toBeInTheDocument();
    });

    it('should handle product with no image', async () => {
      const dataWithNoImage: DppData = {
        ...mockDppData,
        product: {
          ...mockDppData.product,
          image_url: null
        }
      };
      
      mockFetchDppData.mockResolvedValue(dataWithNoImage);
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      // Should show initials instead of image
      expect(screen.getByText('EC')).toBeInTheDocument(); // Eco-Friendly T-Shirt initials
    });

    it('should handle suppliers with no certificates', async () => {
      const dataWithNoCertificates: DppData = {
        ...mockDppData,
        suppliers: mockDppData.suppliers.map(supplier => ({
          ...supplier,
          certificates: []
        }))
      };
      
      mockFetchDppData.mockResolvedValue(dataWithNoCertificates);
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      expect(screen.getByText('No certificates available for this product.')).toBeInTheDocument();
    });
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate metadata for valid product', async () => {
    mockFetchDppData.mockResolvedValue(mockDppData);
    const params = Promise.resolve({ productId: 'product-123' });
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata.title).toBe('Eco-Friendly T-Shirt - EcoWear | Digital Product Passport');
    expect(metadata.description).toContain('Discover the complete supply chain journey of Eco-Friendly T-Shirt by EcoWear');
    expect(metadata.openGraph?.title).toBe('Eco-Friendly T-Shirt - EcoWear | Digital Product Passport');
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://example.com/tshirt.jpg',
        width: 1200,
        height: 630,
        alt: 'Eco-Friendly T-Shirt product image',
      }
    ]);
  });

  it('should generate metadata for product not found', async () => {
    mockFetchDppData.mockResolvedValue(null);
    const params = Promise.resolve({ productId: 'invalid-product' });
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata.title).toBe('Product Not Found - Digital Product Passport');
    expect(metadata.description).toBe('The requested product could not be found.');
  });

  it('should handle product without image in metadata', async () => {
    const dataWithoutImage: DppData = {
      ...mockDppData,
      product: {
        ...mockDppData.product,
        image_url: null
      }
    };
    
    mockFetchDppData.mockResolvedValue(dataWithoutImage);
    const params = Promise.resolve({ productId: 'product-123' });
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata.openGraph?.images).toEqual([]);
    expect(metadata.twitter?.images).toEqual([]);
  });

  it('should include Twitter card metadata', async () => {
    mockFetchDppData.mockResolvedValue(mockDppData);
    const params = Promise.resolve({ productId: 'product-123' });
    
    const metadata = await generateMetadata({ params });
    
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.twitter?.title).toBe('Eco-Friendly T-Shirt - EcoWear | Digital Product Passport');
    expect(metadata.twitter?.images).toEqual(['https://example.com/tshirt.jpg']);
  });
});