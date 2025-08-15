import { CertificateGallery } from './CertificateGallery';
import type { SupplierWithCertificates } from '<ecolens>/lib/types';

// Example usage of CertificateGallery component
export function CertificateGalleryExample() {
  // Mock data for demonstration
  const mockSuppliers: SupplierWithCertificates[] = [
    {
      id: '1',
      name: 'Organic Cotton Farm',
      tier: 3,
      location: 'Gujarat, India',
      latitude: 23.0225,
      longitude: 72.5714,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: [
        {
          id: 'cert-1',
          supplier_id: '1',
          name: 'GOTS Organic Certification',
          type: 'Organic',
          issued_date: '2024-01-15T00:00:00Z',
          verified_at: '2024-01-16T00:00:00Z',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-16T00:00:00Z',
          ledger_entry: {
            id: 'ledger-1',
            certificate_id: 'cert-1',
            data_hash: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890',
            timestamp: '2024-01-16T10:30:00Z',
            created_at: '2024-01-16T10:30:00Z'
          }
        },
        {
          id: 'cert-2',
          supplier_id: '1',
          name: 'Fair Trade Certification',
          type: 'Social',
          issued_date: '2024-02-01T00:00:00Z',
          verified_at: null,
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        }
      ]
    },
    {
      id: '2',
      name: 'Textile Mill',
      tier: 2,
      location: 'Tamil Nadu, India',
      latitude: 11.1271,
      longitude: 78.6569,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: [
        {
          id: 'cert-3',
          supplier_id: '2',
          name: 'ISO 14001 Environmental',
          type: 'Environmental',
          issued_date: '2024-01-20T00:00:00Z',
          verified_at: '2024-01-21T00:00:00Z',
          created_at: '2024-01-20T00:00:00Z',
          updated_at: '2024-01-21T00:00:00Z',
          ledger_entry: {
            id: 'ledger-2',
            certificate_id: 'cert-3',
            data_hash: 'xyz789abc123def456ghi789jkl012mno345pqr678stu901',
            timestamp: '2024-01-21T14:45:00Z',
            created_at: '2024-01-21T14:45:00Z'
          }
        }
      ]
    },
    {
      id: '3',
      name: 'Final Assembly',
      tier: 1,
      location: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      certificates: [] // No certificates for this supplier
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Certificate Gallery Example</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">With Certificates</h2>
          <CertificateGallery suppliers={mockSuppliers} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Empty State</h2>
          <CertificateGallery suppliers={[mockSuppliers[2]]} />
        </div>
      </div>
    </div>
  );
}