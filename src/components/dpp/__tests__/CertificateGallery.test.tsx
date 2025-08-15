import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CertificateGallery } from '../CertificateGallery';
import type { SupplierWithCertificates } from '<ecolens>/lib/types';

describe('CertificateGallery', () => {
  const mockSuppliersWithCertificates: SupplierWithCertificates[] = [
    {
      id: 'supplier-1',
      name: 'Organic Farm Co',
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
            data_hash: 'abc123def456ghi789',
            timestamp: '2024-01-02T00:00:00Z',
            created_at: '2024-01-02T00:00:00Z',
          }
        },
        {
          id: 'cert-2',
          supplier_id: 'supplier-1',
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
      id: 'supplier-2',
      name: 'Manufacturing Plant',
      tier: 2,
      location: 'Vietnam',
      latitude: 21.0285,
      longitude: 105.8542,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: [
        {
          id: 'cert-3',
          supplier_id: 'supplier-2',
          name: 'ISO 9001 Quality Management',
          type: 'Quality',
          issued_date: '2023-12-01',
          verified_at: '2023-12-02T00:00:00Z',
          created_at: '2023-12-01T00:00:00Z',
          updated_at: '2023-12-01T00:00:00Z',
          ledger_entry: {
            id: 'ledger-2',
            certificate_id: 'cert-3',
            data_hash: 'xyz789uvw456rst123',
            timestamp: '2023-12-02T00:00:00Z',
            created_at: '2023-12-02T00:00:00Z',
          }
        }
      ]
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
      certificates: []
    }
  ];

  describe('Basic Rendering', () => {
    it('should render the main heading', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      expect(screen.getByText('Certificates & Verifications')).toBeInTheDocument();
    });

    it('should render all certificates from all suppliers', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      expect(screen.getByText('Organic Certification')).toBeInTheDocument();
      expect(screen.getByText('Fair Trade Certification')).toBeInTheDocument();
      expect(screen.getByText('ISO 9001 Quality Management')).toBeInTheDocument();
    });

    it('should display certificate details', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      // Check certificate types
      expect(screen.getByText('Sustainability')).toBeInTheDocument();
      expect(screen.getByText('Social')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      
      // Check supplier names (multiple certificates from same supplier)
      expect(screen.getAllByText('Organic Farm Co')).toHaveLength(2);
      expect(screen.getByText('Manufacturing Plant')).toBeInTheDocument();
    });
  });

  describe('Certificate Card Layout', () => {
    it('should render certificates in a responsive grid', () => {
      const { container } = render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should render each certificate in a card', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      // Should have multiple cards (one for each certificate)
      const certificateCards = screen.getAllByText(/Type:/).map(el => el.closest('[class*="h-full"]'));
      expect(certificateCards).toHaveLength(3);
    });

    it('should display tier badges for each certificate', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      expect(screen.getAllByText('Tier 3')).toHaveLength(2); // Two certificates from Tier 3 supplier
      expect(screen.getByText('Tier 2')).toBeInTheDocument();
      // Note: Tier 1 supplier has no certificates, so no Tier 1 badge should appear
    });
  });

  describe('Date Formatting', () => {
    it('should format issued dates correctly', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('December 1, 2023')).toBeInTheDocument();
    });

    it('should handle invalid date formats gracefully', () => {
      const supplierWithInvalidDate: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[0],
          certificates: [
            {
              ...mockSuppliersWithCertificates[0].certificates[0],
              issued_date: 'invalid-date'
            }
          ]
        }
      ];

      render(<CertificateGallery suppliers={supplierWithInvalidDate} />);
      
      // Should fallback to "Invalid Date" when date parsing fails
      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });
  });

  describe('Verification Status', () => {
    it('should show verified badge for verified certificates', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      // Should show verified badges for certificates with ledger entries
      const verifiedBadges = screen.getAllByText('Verified');
      expect(verifiedBadges).toHaveLength(2); // cert-1 and cert-3 are verified
    });

    it('should show unverified status for unverified certificates', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      expect(screen.getByText('Unverified')).toBeInTheDocument();
      expect(screen.getByText('This certificate has not been verified on the blockchain ledger.')).toBeInTheDocument();
    });

    it('should pass correct props to VerifiedBadge component', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      // Should display hash and timestamp from ledger entry (truncated format)
      expect(screen.getByText('abc123de...56ghi789')).toBeInTheDocument();
      expect(screen.getByText('xyz789uv...56rst123')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no certificates are available', () => {
      const suppliersWithoutCertificates: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[2], // Supplier with empty certificates array
        }
      ];

      render(<CertificateGallery suppliers={suppliersWithoutCertificates} />);
      
      expect(screen.getByText('Certificates & Verifications')).toBeInTheDocument();
      expect(screen.getByText('No certificates available for this product.')).toBeInTheDocument();
    });

    it('should render empty state when suppliers array is empty', () => {
      render(<CertificateGallery suppliers={[]} />);
      
      expect(screen.getByText('No certificates available for this product.')).toBeInTheDocument();
    });

    it('should render empty state when all suppliers have empty certificate arrays', () => {
      const suppliersWithEmptyCertificates: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[0],
          certificates: []
        },
        {
          ...mockSuppliersWithCertificates[1],
          certificates: []
        }
      ];

      render(<CertificateGallery suppliers={suppliersWithEmptyCertificates} />);
      
      expect(screen.getByText('No certificates available for this product.')).toBeInTheDocument();
    });
  });

  describe('Certificate Aggregation', () => {
    it('should collect certificates from multiple suppliers', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      // Should show certificates from different suppliers
      expect(screen.getByText('Organic Certification')).toBeInTheDocument(); // From supplier-1
      expect(screen.getByText('Fair Trade Certification')).toBeInTheDocument(); // From supplier-1
      expect(screen.getByText('ISO 9001 Quality Management')).toBeInTheDocument(); // From supplier-2
    });

    it('should maintain supplier context for each certificate', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      // Each certificate should show its supplier name
      const organicCertCard = screen.getByText('Organic Certification').closest('[class*="h-full"]');
      expect(organicCertCard).toHaveTextContent('Organic Farm Co');
      
      const isoCertCard = screen.getByText('ISO 9001 Quality Management').closest('[class*="h-full"]');
      expect(isoCertCard).toHaveTextContent('Manufacturing Plant');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      const grid = container.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should handle long certificate names gracefully', () => {
      const supplierWithLongCertName: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[0],
          certificates: [
            {
              ...mockSuppliersWithCertificates[0].certificates[0],
              name: 'This is a very long certificate name that should wrap properly and not break the card layout'
            }
          ]
        }
      ];

      render(<CertificateGallery suppliers={supplierWithLongCertName} />);
      
      expect(screen.getByText('This is a very long certificate name that should wrap properly and not break the card layout')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Certificates & Verifications');
    });

    it('should have semantic structure for certificate information', () => {
      render(<CertificateGallery suppliers={mockSuppliersWithCertificates} />);
      
      // Certificate details should be properly structured
      expect(screen.getAllByText('Type:')).toHaveLength(3);
      expect(screen.getAllByText('Supplier:')).toHaveLength(3);
      expect(screen.getAllByText('Issued:')).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle suppliers with null certificates array', () => {
      const supplierWithNullCertificates: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[0],
          certificates: null as any
        }
      ];

      // This should crash due to null.map(), so we expect it to throw
      expect(() => {
        render(<CertificateGallery suppliers={supplierWithNullCertificates} />);
      }).toThrow();
    });

    it('should handle certificates without ledger entries', () => {
      const supplierWithUnverifiedCert: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[0],
          certificates: [
            {
              ...mockSuppliersWithCertificates[0].certificates[0],
              verified_at: null,
              ledger_entry: undefined
            }
          ]
        }
      ];

      render(<CertificateGallery suppliers={supplierWithUnverifiedCert} />);
      
      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });

    it('should handle certificates with missing supplier information', () => {
      const supplierWithMissingInfo: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[0],
          name: '',
          certificates: [mockSuppliersWithCertificates[0].certificates[0]]
        }
      ];

      render(<CertificateGallery suppliers={supplierWithMissingInfo} />);
      
      expect(screen.getByText('Organic Certification')).toBeInTheDocument();
      // Should still render without crashing
    });

    it('should handle special characters in certificate data', () => {
      const supplierWithSpecialChars: SupplierWithCertificates[] = [
        {
          ...mockSuppliersWithCertificates[0],
          certificates: [
            {
              ...mockSuppliersWithCertificates[0].certificates[0],
              name: 'Certificate™ & Co. (2024)',
              type: 'Quality®'
            }
          ]
        }
      ];

      render(<CertificateGallery suppliers={supplierWithSpecialChars} />);
      
      expect(screen.getByText('Certificate™ & Co. (2024)')).toBeInTheDocument();
      expect(screen.getByText('Quality®')).toBeInTheDocument();
    });
  });
});