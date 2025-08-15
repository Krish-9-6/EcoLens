import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JourneyTimeline } from '../JourneyTimeline';
import type { SupplierWithCertificates } from '<ecolens>/lib/types';

describe('JourneyTimeline', () => {
  const mockSuppliers: SupplierWithCertificates[] = [
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
          ledger_entry: {
            id: 'ledger-1',
            certificate_id: 'cert-1',
            data_hash: 'abc123',
            timestamp: '2024-01-02T00:00:00Z',
            created_at: '2024-01-02T00:00:00Z',
          }
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
          name: 'Quality Assurance',
          type: 'Quality',
          issued_date: '2024-01-15',
          verified_at: null,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        }
      ]
    }
  ];

  describe('Basic Rendering', () => {
    it('should render the timeline title and description', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      expect(screen.getByText('Supply Chain Journey')).toBeInTheDocument();
      expect(screen.getByText('Follow the path from raw materials to final product')).toBeInTheDocument();
    });

    it('should render all suppliers', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      expect(screen.getByText('Raw Materials Co')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing Plant')).toBeInTheDocument();
      expect(screen.getByText('Final Assembly')).toBeInTheDocument();
    });

    it('should render supplier locations', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      expect(screen.getByText('Indonesia')).toBeInTheDocument();
      expect(screen.getByText('Vietnam')).toBeInTheDocument();
      expect(screen.getByText('China')).toBeInTheDocument();
    });
  });

  describe('Supplier Ordering', () => {
    it('should sort suppliers by tier (3 → 2 → 1)', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      const supplierNames = screen.getAllByText(/Raw Materials Co|Manufacturing Plant|Final Assembly/);
      
      // Should be ordered: Raw Materials Co (Tier 3), Manufacturing Plant (Tier 2), Final Assembly (Tier 1)
      expect(supplierNames[0]).toHaveTextContent('Raw Materials Co');
      expect(supplierNames[1]).toHaveTextContent('Manufacturing Plant');
      expect(supplierNames[2]).toHaveTextContent('Final Assembly');
    });

    it('should handle suppliers with same tier', () => {
      const suppliersWithSameTier: SupplierWithCertificates[] = [
        {
          ...mockSuppliers[0],
          id: 'supplier-a',
          name: 'Supplier A',
          tier: 2
        },
        {
          ...mockSuppliers[1],
          id: 'supplier-b',
          name: 'Supplier B',
          tier: 2
        }
      ];

      render(<JourneyTimeline suppliers={suppliersWithSameTier} />);
      
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
      expect(screen.getByText('Supplier B')).toBeInTheDocument();
    });
  });

  describe('Tier Information', () => {
    it('should display correct tier badges and descriptions', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      expect(screen.getByText('Tier 3 • Raw Materials')).toBeInTheDocument();
      expect(screen.getByText('Tier 2 • Manufacturing')).toBeInTheDocument();
      expect(screen.getByText('Tier 1 • Final Assembly')).toBeInTheDocument();
    });

    it('should apply correct color classes for different tiers', () => {
      const { container } = render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      // Check for tier-specific color classes
      const tier3Badge = screen.getByText('Tier 3 • Raw Materials');
      expect(tier3Badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
      
      const tier2Badge = screen.getByText('Tier 2 • Manufacturing');
      expect(tier2Badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
      
      const tier1Badge = screen.getByText('Tier 1 • Final Assembly');
      expect(tier1Badge).toHaveClass('bg-purple-100', 'text-purple-800', 'border-purple-200');
    });
  });

  describe('Certificate Information', () => {
    it('should display certificate count when certificates are available', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      const certificateTexts = screen.getAllByText('1 certificate available');
      expect(certificateTexts.length).toBeGreaterThan(0);
    });

    it('should handle plural certificate count correctly', () => {
      const supplierWithMultipleCerts: SupplierWithCertificates[] = [
        {
          ...mockSuppliers[0],
          certificates: [
            mockSuppliers[0].certificates[0],
            {
              id: 'cert-3',
              supplier_id: 'supplier-1',
              name: 'Another Cert',
              type: 'Quality',
              issued_date: '2024-01-01',
              verified_at: null,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            }
          ]
        }
      ];

      render(<JourneyTimeline suppliers={supplierWithMultipleCerts} />);
      
      expect(screen.getByText('2 certificates available')).toBeInTheDocument();
    });

    it('should not display certificate count when no certificates', () => {
      render(<JourneyTimeline suppliers={[mockSuppliers[1]]} />);
      
      expect(screen.queryByText(/certificate/)).not.toBeInTheDocument();
    });
  });

  describe('Timeline Visual Elements', () => {
    it('should render timeline dots for each supplier', () => {
      const { container } = render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      // Should have timeline dots with proper styling
      const timelineDots = container.querySelectorAll('.w-8.h-8.rounded-full');
      expect(timelineDots).toHaveLength(3);
    });

    it('should render connecting lines between suppliers', () => {
      const { container } = render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      // Should have connecting lines (not for the last item)
      const connectingLines = container.querySelectorAll('.absolute.left-4.top-8');
      expect(connectingLines.length).toBeGreaterThan(0);
    });

    it('should render location icons', () => {
      const { container } = render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      // Should have location SVG icons
      const locationIcons = container.querySelectorAll('svg');
      expect(locationIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no suppliers provided', () => {
      render(<JourneyTimeline suppliers={[]} />);
      
      expect(screen.getByText('Supply Chain Journey')).toBeInTheDocument();
      expect(screen.getByText('No supply chain information available.')).toBeInTheDocument();
    });

    it('should still render the card structure in empty state', () => {
      const { container } = render(<JourneyTimeline suppliers={[]} />);
      
      expect(container.querySelector('.w-full')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      const { container } = render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      // Check for responsive flex classes
      const responsiveElements = container.querySelectorAll('.flex.flex-col.sm\\:flex-row');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('should handle long supplier names gracefully', () => {
      const supplierWithLongName: SupplierWithCertificates[] = [
        {
          ...mockSuppliers[0],
          name: 'This is a very long supplier name that should wrap properly and not break the layout'
        }
      ];

      render(<JourneyTimeline suppliers={supplierWithLongName} />);
      
      expect(screen.getByText('This is a very long supplier name that should wrap properly and not break the layout')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Supply Chain Journey');
      
      const supplierHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(supplierHeadings).toHaveLength(3);
    });

    it('should have semantic HTML structure', () => {
      render(<JourneyTimeline suppliers={mockSuppliers} />);
      
      // Should have proper list-like structure with meaningful elements
      const supplierNames = screen.getAllByText(/Raw Materials Co|Manufacturing Plant|Final Assembly/);
      supplierNames.forEach(name => {
        expect(name.tagName).toBe('H3');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle suppliers with missing location data', () => {
      const supplierWithoutLocation: SupplierWithCertificates[] = [
        {
          ...mockSuppliers[0],
          location: ''
        }
      ];

      render(<JourneyTimeline suppliers={supplierWithoutLocation} />);
      
      expect(screen.getByText('Raw Materials Co')).toBeInTheDocument();
      // Should still render the location icon and empty location
    });

    it('should handle suppliers with null certificates array', () => {
      const supplierWithNullCerts: SupplierWithCertificates[] = [
        {
          ...mockSuppliers[0],
          certificates: null as any
        }
      ];

      render(<JourneyTimeline suppliers={supplierWithNullCerts} />);
      
      expect(screen.getByText('Raw Materials Co')).toBeInTheDocument();
      expect(screen.queryByText(/certificate/)).not.toBeInTheDocument();
    });

    it('should handle invalid tier values gracefully', () => {
      const supplierWithInvalidTier: SupplierWithCertificates[] = [
        {
          ...mockSuppliers[0],
          tier: 4 as any
        }
      ];

      render(<JourneyTimeline suppliers={supplierWithInvalidTier} />);
      
      expect(screen.getByText('Raw Materials Co')).toBeInTheDocument();
      // Should still render without crashing
    });
  });
});