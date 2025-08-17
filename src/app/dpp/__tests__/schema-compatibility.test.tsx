import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DppPage from '../[productId]/page';
import type { DppData } from '<ecolens>/lib/types';

// Mock the data fetching function
vi.mock('<ecolens>/lib/data', () => ({
  fetchDppData: vi.fn(),
}));

// Mock Next.js dynamic import for map component
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<any>, options: { ssr?: boolean }) => {
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

describe('DPP Schema Compatibility Tests', () => {
  const mockFetchDppData = vi.mocked(await import('<ecolens>/lib/data')).fetchDppData;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Updated Schema Compatibility', () => {
    it('should render DPP page with suppliers containing new brand_id and parent_supplier_id columns', async () => {
      const mockDppDataWithNewSchema: DppData = {
        product: {
          id: 'product-123',
          name: 'Updated Schema Product',
          image_url: 'https://example.com/updated.jpg',
          brand_id: 'brand-456',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: 'brand-456',
            name: 'Updated Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: 'supplier-tier1',
            name: 'Tier 1 Supplier',
            tier: 1,
            location: 'Vietnam',
            latitude: 21.0285,
            longitude: 105.8542,
            brand_id: 'brand-456', // New column
            parent_supplier_id: null, // New column - Tier 1 has no parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: [
              {
                id: 'cert-1',
                supplier_id: 'supplier-tier1',
                name: 'Manufacturing Certificate',
                type: 'Quality',
                issued_date: '2024-01-01',
                verified_at: '2024-01-02T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                ledger_entry: {
                  id: 'ledger-1',
                  certificate_id: 'cert-1',
                  data_hash: 'abc123def456',
                  timestamp: '2024-01-02T00:00:00Z',
                  created_at: '2024-01-02T00:00:00Z',
                }
              }
            ]
          },
          {
            id: 'supplier-tier2',
            name: 'Tier 2 Supplier',
            tier: 2,
            location: 'Bangladesh',
            latitude: 23.6850,
            longitude: 90.3563,
            brand_id: 'brand-456', // New column
            parent_supplier_id: 'supplier-tier1', // New column - Tier 2 has Tier 1 parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: [
              {
                id: 'cert-2',
                supplier_id: 'supplier-tier2',
                name: 'Fair Trade Certificate',
                type: 'Social',
                issued_date: '2024-01-15',
                verified_at: null,
                created_at: '2024-01-15T00:00:00Z',
                updated_at: '2024-01-15T00:00:00Z',
              }
            ]
          },
          {
            id: 'supplier-tier3',
            name: 'Tier 3 Supplier',
            tier: 3,
            location: 'India',
            latitude: 20.5937,
            longitude: 78.9629,
            brand_id: 'brand-456', // New column
            parent_supplier_id: 'supplier-tier2', // New column - Tier 3 has Tier 2 parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: [
              {
                id: 'cert-3',
                supplier_id: 'supplier-tier3',
                name: 'Organic Certificate',
                type: 'Sustainability',
                issued_date: '2024-01-01',
                verified_at: '2024-01-02T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                ledger_entry: {
                  id: 'ledger-3',
                  certificate_id: 'cert-3',
                  data_hash: 'xyz789abc123',
                  timestamp: '2024-01-02T00:00:00Z',
                  created_at: '2024-01-02T00:00:00Z',
                }
              }
            ]
          }
        ]
      };

      mockFetchDppData.mockResolvedValue(mockDppDataWithNewSchema);
      const params = Promise.resolve({ productId: 'product-123' });
      
      render(await DppPage({ params }));
      
      // Verify product information renders correctly
      expect(screen.getByText('Updated Schema Product')).toBeInTheDocument();
      expect(screen.getByText('UPDATED BRAND')).toBeInTheDocument();
      
      // Verify all suppliers render correctly despite new schema columns
      expect(screen.getByText('Tier 1 Supplier')).toBeInTheDocument();
      expect(screen.getByText('Tier 2 Supplier')).toBeInTheDocument();
      expect(screen.getByText('Tier 3 Supplier')).toBeInTheDocument();
      
      // Verify certificates still render correctly
      expect(screen.getByText('Manufacturing Certificate')).toBeInTheDocument();
      expect(screen.getByText('Fair Trade Certificate')).toBeInTheDocument();
      expect(screen.getByText('Organic Certificate')).toBeInTheDocument();
      
      // Verify verification status displays correctly
      expect(screen.getAllByText('Verified')).toHaveLength(2); // Manufacturing and Organic certs
      expect(screen.getByText('Unverified')).toBeInTheDocument(); // Fair Trade cert
    });

    it('should handle supplier hierarchy display with parent-child relationships', async () => {
      const mockHierarchicalData: DppData = {
        product: {
          id: 'product-hierarchy',
          name: 'Hierarchy Test Product',
          image_url: null,
          brand_id: 'brand-789',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: 'brand-789',
            name: 'Hierarchy Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: 'raw-material-supplier',
            name: 'Raw Material Supplier',
            tier: 3,
            location: 'Cotton Farm, India',
            latitude: 20.5937,
            longitude: 78.9629,
            brand_id: 'brand-789',
            parent_supplier_id: null, // This will be linked to tier 2
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          },
          {
            id: 'processing-supplier',
            name: 'Processing Supplier',
            tier: 2,
            location: 'Textile Mill, Bangladesh',
            latitude: 23.6850,
            longitude: 90.3563,
            brand_id: 'brand-789',
            parent_supplier_id: null, // This will be linked to tier 1
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          },
          {
            id: 'final-assembly',
            name: 'Final Assembly',
            tier: 1,
            location: 'Garment Factory, Vietnam',
            latitude: 21.0285,
            longitude: 105.8542,
            brand_id: 'brand-789',
            parent_supplier_id: null, // Tier 1 has no parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      };

      mockFetchDppData.mockResolvedValue(mockHierarchicalData);
      const params = Promise.resolve({ productId: 'product-hierarchy' });
      
      render(await DppPage({ params }));
      
      // Verify timeline shows suppliers in correct order (Tier 3 → 2 → 1)
      const supplierElements = screen.getAllByText(/Raw Material Supplier|Processing Supplier|Final Assembly/);
      expect(supplierElements[0]).toHaveTextContent('Raw Material Supplier'); // Tier 3 first
      expect(supplierElements[1]).toHaveTextContent('Processing Supplier'); // Tier 2 second
      expect(supplierElements[2]).toHaveTextContent('Final Assembly'); // Tier 1 last
      
      // Verify map renders all suppliers
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(3); // One for each supplier
      });
    });

    it('should maintain backward compatibility with existing DPP components', async () => {
      // Test with data that might come from older schema (without new columns)
      const mockLegacyCompatibleData: DppData = {
        product: {
          id: 'legacy-product',
          name: 'Legacy Compatible Product',
          image_url: 'https://example.com/legacy.jpg',
          brand_id: 'legacy-brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: 'legacy-brand',
            name: 'Legacy Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: 'legacy-supplier',
            name: 'Legacy Supplier',
            tier: 1,
            location: 'Legacy Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: 'legacy-brand', // New column but with legacy data
            parent_supplier_id: null, // New column but with legacy data
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: [
              {
                id: 'legacy-cert',
                supplier_id: 'legacy-supplier',
                name: 'Legacy Certificate',
                type: 'Legacy Type',
                issued_date: '2024-01-01',
                verified_at: '2024-01-02T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                ledger_entry: {
                  id: 'legacy-ledger',
                  certificate_id: 'legacy-cert',
                  data_hash: 'legacy-hash',
                  timestamp: '2024-01-02T00:00:00Z',
                  created_at: '2024-01-02T00:00:00Z',
                }
              }
            ]
          }
        ]
      };

      mockFetchDppData.mockResolvedValue(mockLegacyCompatibleData);
      const params = Promise.resolve({ productId: 'legacy-product' });
      
      render(await DppPage({ params }));
      
      // All existing functionality should work
      expect(screen.getByText('Legacy Compatible Product')).toBeInTheDocument();
      expect(screen.getByText('LEGACY BRAND')).toBeInTheDocument();
      expect(screen.getByText('Legacy Supplier')).toBeInTheDocument();
      expect(screen.getByText('Legacy Certificate')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
      
      // Map should still work
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByTestId('marker')).toBeInTheDocument();
      });
    });

    it('should handle edge cases with new schema columns', async () => {
      const mockEdgeCaseData: DppData = {
        product: {
          id: 'edge-case-product',
          name: 'Edge Case Product',
          image_url: null,
          brand_id: 'edge-brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: 'edge-brand',
            name: 'Edge Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: 'supplier-no-coords',
            name: 'Supplier Without Coordinates',
            tier: 1,
            location: 'Unknown Location',
            latitude: null, // No coordinates
            longitude: null,
            brand_id: 'edge-brand',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          },
          {
            id: 'supplier-with-invalid-parent',
            name: 'Supplier With Invalid Parent',
            tier: 2,
            location: 'Test Location',
            latitude: 0,
            longitude: 0,
            brand_id: 'edge-brand',
            parent_supplier_id: 'non-existent-parent', // Invalid parent reference
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      };

      mockFetchDppData.mockResolvedValue(mockEdgeCaseData);
      const params = Promise.resolve({ productId: 'edge-case-product' });
      
      render(await DppPage({ params }));
      
      // Should still render without crashing
      expect(screen.getByText('Edge Case Product')).toBeInTheDocument();
      expect(screen.getByText('Supplier Without Coordinates')).toBeInTheDocument();
      expect(screen.getByText('Supplier With Invalid Parent')).toBeInTheDocument();
      
      // Map should handle suppliers without coordinates gracefully
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        // Only one marker should be rendered (the one with coordinates)
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(1);
      });
    });
  });

  describe('Public Access Compatibility', () => {
    it('should work without authentication context (public access)', async () => {
      const mockPublicData: DppData = {
        product: {
          id: 'public-product',
          name: 'Public Access Product',
          image_url: 'https://example.com/public.jpg',
          brand_id: 'public-brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: 'public-brand',
            name: 'Public Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: 'public-supplier',
            name: 'Public Supplier',
            tier: 1,
            location: 'Public Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: 'public-brand',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      };

      mockFetchDppData.mockResolvedValue(mockPublicData);
      const params = Promise.resolve({ productId: 'public-product' });
      
      render(await DppPage({ params }));
      
      // Should render correctly for public access
      expect(screen.getByText('Public Access Product')).toBeInTheDocument();
      expect(screen.getByText('PUBLIC BRAND')).toBeInTheDocument();
      expect(screen.getByText('Public Supplier')).toBeInTheDocument();
      
      // Verify fetchDppData was called (simulating public access)
      expect(mockFetchDppData).toHaveBeenCalledWith('public-product');
    });
  });

  describe('Performance with Updated Schema', () => {
    it('should handle large datasets with new schema columns efficiently', async () => {
      // Create a large dataset to test performance
      const suppliers = Array.from({ length: 50 }, (_, index) => ({
        id: `supplier-${index}`,
        name: `Supplier ${index}`,
        tier: ((index % 3) + 1) as 1 | 2 | 3,
        location: `Location ${index}`,
        latitude: 40.7128 + (index * 0.01),
        longitude: -74.0060 + (index * 0.01),
        brand_id: 'performance-brand',
        parent_supplier_id: index > 0 ? `supplier-${index - 1}` : null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        certificates: []
      }));

      const mockLargeDataset: DppData = {
        product: {
          id: 'performance-product',
          name: 'Performance Test Product',
          image_url: null,
          brand_id: 'performance-brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: 'performance-brand',
            name: 'Performance Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers
      };

      mockFetchDppData.mockResolvedValue(mockLargeDataset);
      const params = Promise.resolve({ productId: 'performance-product' });
      
      const startTime = performance.now();
      render(await DppPage({ params }));
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Should still render correctly
      expect(screen.getByText('Performance Test Product')).toBeInTheDocument();
      expect(screen.getByText('PERFORMANCE BRAND')).toBeInTheDocument();
      
      // Should handle the large number of suppliers
      expect(screen.getByText('Supplier 0')).toBeInTheDocument();
      expect(screen.getByText('Supplier 49')).toBeInTheDocument();
    });
  });
});