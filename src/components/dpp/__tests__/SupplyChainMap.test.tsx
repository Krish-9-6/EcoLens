import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupplyChainMap } from '../SupplyChainMap';
import type { SupplierWithCertificates } from '<ecolens>/lib/types';

// Mock Next.js dynamic import
vi.mock('next/dynamic', () => ({
  default: (importFn: any, options: any) => {
    if (options?.ssr === false) {
      // Return a mock component for SSR-disabled components
      return ({ children, ...props }: any) => (
        <div data-testid="mock-map-component" {...props}>
          {children}
        </div>
      );
    }
    return importFn;
  },
}));

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, onError, ...props }: any) => (
    <div 
      data-testid="map-container" 
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
      {...props}
    >
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution, onError, ...props }: any) => (
    <div 
      data-testid="tile-layer" 
      data-url={url}
      data-attribution={attribution}
      {...props}
    />
  ),
  Marker: ({ position, children, ...props }: any) => (
    <div 
      data-testid="marker" 
      data-position={JSON.stringify(position)}
      {...props}
    >
      {children}
    </div>
  ),
  Popup: ({ children, ...props }: any) => (
    <div data-testid="popup" {...props}>
      {children}
    </div>
  ),
}));

describe('SupplyChainMap', () => {
  const mockSuppliersWithCoordinates: SupplierWithCertificates[] = [
    {
      id: 'supplier-1',
      name: 'Raw Materials Co',
      tier: 3,
      location: 'Indonesia',
      latitude: -6.2088,
      longitude: 106.8456,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: [
        {
          id: 'cert-1',
          supplier_id: 'supplier-1',
          name: 'Organic Certification',
          type: 'Sustainability',
          issued_date: '2024-01-01',
          verified_at: '2024-01-02T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      ]
    },
    {
      id: 'supplier-2',
      name: 'Manufacturing Plant',
      tier: 2,
      location: 'Vietnam',
      latitude: 21.0285,
      longitude: 105.8542,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: []
    },
    {
      id: 'supplier-3',
      name: 'Final Assembly',
      tier: 1,
      location: 'China',
      latitude: 39.9042,
      longitude: 116.4074,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: [
        {
          id: 'cert-2',
          supplier_id: 'supplier-3',
          name: 'Quality Cert',
          type: 'Quality',
          issued_date: '2024-01-15',
          verified_at: null,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        },
        {
          id: 'cert-3',
          supplier_id: 'supplier-3',
          name: 'Safety Cert',
          type: 'Safety',
          issued_date: '2024-01-20',
          verified_at: null,
          created_at: '2024-01-20T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z',
        }
      ]
    }
  ];

  const mockSuppliersWithoutCoordinates: SupplierWithCertificates[] = [
    {
      id: 'supplier-4',
      name: 'No Location Supplier',
      tier: 2,
      location: 'Unknown Location',
      latitude: null,
      longitude: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: []
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
    });

    it('should have proper loading state styling', () => {
      const { container } = render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      const loadingContainer = container.querySelector('.w-full.h-96.bg-gray-100.rounded-lg');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Map Rendering with Valid Coordinates', () => {
    it('should render map container when suppliers have coordinates', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });
    });

    it('should render tile layer with correct URL', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const tileLayer = screen.getByTestId('tile-layer');
        expect(tileLayer).toHaveAttribute('data-url', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      });
    });

    it('should render markers for each supplier with coordinates', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(3);
      });
    });

    it('should position markers correctly', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        
        expect(markers[0]).toHaveAttribute('data-position', JSON.stringify([-6.2088, 106.8456]));
        expect(markers[1]).toHaveAttribute('data-position', JSON.stringify([21.0285, 105.8542]));
        expect(markers[2]).toHaveAttribute('data-position', JSON.stringify([39.9042, 116.4074]));
      });
    });
  });

  describe('Popup Content', () => {
    it('should render popup with supplier information', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByText('Raw Materials Co')).toBeInTheDocument();
        expect(screen.getByText('Manufacturing Plant')).toBeInTheDocument();
        expect(screen.getByText('Final Assembly')).toBeInTheDocument();
      });
    });

    it('should display tier information in popups', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByText('Tier 3')).toBeInTheDocument();
        expect(screen.getByText('Tier 2')).toBeInTheDocument();
        expect(screen.getByText('Tier 1')).toBeInTheDocument();
      });
    });

    it('should display location information in popups', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByText('Indonesia')).toBeInTheDocument();
        expect(screen.getByText('Vietnam')).toBeInTheDocument();
        expect(screen.getByText('China')).toBeInTheDocument();
      });
    });

    it('should display certificate count in popups', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByText('1 certificate')).toBeInTheDocument();
        expect(screen.getByText('2 certificates')).toBeInTheDocument();
      });
    });

    it('should not display certificate count when no certificates', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        // Manufacturing Plant has no certificates, so should not show certificate count
        const manufacturingPopup = screen.getByText('Manufacturing Plant').closest('[data-testid="popup"]');
        expect(manufacturingPopup).not.toHaveTextContent('certificate');
      });
    });
  });

  describe('Map Bounds Calculation', () => {
    it('should calculate center and zoom for multiple suppliers', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
        
        // Should calculate center based on all supplier coordinates
        expect(center).toHaveLength(2);
        expect(typeof center[0]).toBe('number');
        expect(typeof center[1]).toBe('number');
      });
    });

    it('should handle single supplier correctly', async () => {
      const singleSupplier = [mockSuppliersWithCoordinates[0]];
      
      render(<SupplyChainMap suppliers={singleSupplier} />);
      
      await waitFor(() => {
        const mapContainer = screen.getByTestId('map-container');
        const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
        const zoom = mapContainer.getAttribute('data-zoom');
        
        expect(center).toEqual([-6.2088, 106.8456]);
        expect(zoom).toBe('8');
      });
    });
  });

  describe('Empty State - No Coordinates', () => {
    it('should render empty state when no suppliers have coordinates', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithoutCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByText('Supply Chain Locations')).toBeInTheDocument();
        expect(screen.getByText('Location data is not available for the suppliers in this product\'s supply chain.')).toBeInTheDocument();
      });
    });

    it('should show supplier count in empty state', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithoutCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByText('1 supplier without location data')).toBeInTheDocument();
      });
    });

    it('should handle plural supplier count in empty state', async () => {
      const multipleSuppliersWithoutCoords = [
        ...mockSuppliersWithoutCoordinates,
        {
          ...mockSuppliersWithoutCoordinates[0],
          id: 'supplier-5',
          name: 'Another No Location Supplier'
        }
      ];
      
      render(<SupplyChainMap suppliers={multipleSuppliersWithoutCoords} />);
      
      await waitFor(() => {
        expect(screen.getByText('2 suppliers without location data')).toBeInTheDocument();
      });
    });

    it('should have proper empty state styling', async () => {
      const { container } = render(<SupplyChainMap suppliers={mockSuppliersWithoutCoordinates} />);
      
      await waitFor(() => {
        const emptyState = container.querySelector('.w-full.h-96.bg-gray-50.rounded-lg.border-2.border-dashed');
        expect(emptyState).toBeInTheDocument();
      });
    });
  });

  describe('Legend', () => {
    it('should render legend with tier information', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        expect(screen.getByText('Supply Chain Tiers')).toBeInTheDocument();
        expect(screen.getByText('Tier 3 - Raw Materials')).toBeInTheDocument();
        expect(screen.getByText('Tier 2 - Manufacturing')).toBeInTheDocument();
        expect(screen.getByText('Tier 1 - Final Assembly')).toBeInTheDocument();
      });
    });

    it('should have proper legend styling', async () => {
      const { container } = render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const legend = container.querySelector('.absolute.bottom-4.left-4');
        expect(legend).toBeInTheDocument();
        expect(legend).toHaveClass('bg-white/90', 'backdrop-blur-sm', 'rounded-lg', 'p-3', 'shadow-lg', 'z-10');
      });
    });

    it('should render colored dots for each tier', async () => {
      const { container } = render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const greenDot = container.querySelector('.w-2.h-2.rounded-full.bg-green-500');
        const orangeDot = container.querySelector('.w-2.h-2.rounded-full.bg-orange-500');
        const redDot = container.querySelector('.w-2.h-2.rounded-full.bg-red-500');
        
        expect(greenDot).toBeInTheDocument();
        expect(orangeDot).toBeInTheDocument();
        expect(redDot).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid coordinates gracefully', async () => {
      const suppliersWithInvalidCoords: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCoordinates[0],
          latitude: NaN,
          longitude: NaN
        }
      ];
      
      render(<SupplyChainMap suppliers={suppliersWithInvalidCoords} />);
      
      await waitFor(() => {
        // Should render empty state since coordinates are invalid
        expect(screen.getByText('Supply Chain Locations')).toBeInTheDocument();
      });
    });

    it('should filter out suppliers with null coordinates', async () => {
      const mixedSuppliers = [
        ...mockSuppliersWithCoordinates,
        ...mockSuppliersWithoutCoordinates
      ];
      
      render(<SupplyChainMap suppliers={mixedSuppliers} />);
      
      await waitFor(() => {
        // Should only render markers for suppliers with valid coordinates
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(3); // Only the 3 with valid coordinates
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive container classes', async () => {
      const { container } = render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const mapWrapper = container.querySelector('.w-full.h-96.rounded-lg.overflow-hidden');
        expect(mapWrapper).toBeInTheDocument();
      });
    });

    it('should handle different screen sizes for legend', async () => {
      const { container } = render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        const legend = container.querySelector('.absolute.bottom-4.left-4');
        expect(legend).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        // Map should be contained in a proper container
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toBeInTheDocument();
      });
    });

    it('should provide meaningful content in popups', async () => {
      render(<SupplyChainMap suppliers={mockSuppliersWithCoordinates} />);
      
      await waitFor(() => {
        // Popup content should be accessible
        expect(screen.getByText('Raw Materials Co')).toBeInTheDocument();
        expect(screen.getByText('Indonesia')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty suppliers array', async () => {
      render(<SupplyChainMap suppliers={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('Supply Chain Locations')).toBeInTheDocument();
        expect(screen.getByText('Location data is not available for the suppliers in this product\'s supply chain.')).toBeInTheDocument();
      });
    });

    it('should handle suppliers with extreme coordinates', async () => {
      const suppliersWithExtremeCoords: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCoordinates[0],
          latitude: 90,
          longitude: 180
        },
        {
          ...mockSuppliersWithCoordinates[1],
          latitude: -90,
          longitude: -180
        }
      ];
      
      render(<SupplyChainMap suppliers={suppliersWithExtremeCoords} />);
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(2);
      });
    });

    it('should handle suppliers with zero coordinates', async () => {
      const suppliersWithZeroCoords: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCoordinates[0],
          latitude: 0,
          longitude: 0
        }
      ];
      
      render(<SupplyChainMap suppliers={suppliersWithZeroCoords} />);
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(1);
        expect(markers[0]).toHaveAttribute('data-position', JSON.stringify([0, 0]));
      });
    });
  });
});