import { JourneyTimeline } from './JourneyTimeline';
import type { SupplierWithCertificates } from '<ecolens>/lib/types';

// Example usage of JourneyTimeline component
const exampleSuppliers: SupplierWithCertificates[] = [
  {
    id: 'supplier-1',
    name: 'Organic Cotton Farm',
    tier: 3,
    location: 'Gujarat, India',
    latitude: 23.0225,
    longitude: 72.5714,
    brand_id: 'brand-1',
    parent_supplier_id: 'supplier-2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certificates: [
      {
        id: 'cert-1',
        supplier_id: 'supplier-1',
        name: 'GOTS Organic Cotton Certificate',
        type: 'Organic',
        issued_date: '2024-01-01',
        verified_at: '2024-01-02T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ledger_entry: {
          id: 'ledger-1',
          certificate_id: 'cert-1',
          data_hash: 'abc123def456',
          timestamp: '2024-01-02T00:00:00Z',
          created_at: '2024-01-02T00:00:00Z'
        }
      },
      {
        id: 'cert-2',
        supplier_id: 'supplier-1',
        name: 'Fair Trade Certificate',
        type: 'Fair Trade',
        issued_date: '2024-01-01',
        verified_at: '2024-01-03T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ledger_entry: {
          id: 'ledger-2',
          certificate_id: 'cert-2',
          data_hash: 'def456ghi789',
          timestamp: '2024-01-03T00:00:00Z',
          created_at: '2024-01-03T00:00:00Z'
        }
      }
    ]
  },
  {
    id: 'supplier-2',
    name: 'Sustainable Textile Mill',
    tier: 2,
    location: 'Tamil Nadu, India',
    latitude: 11.1271,
    longitude: 78.6569,
    brand_id: 'brand-1',
    parent_supplier_id: 'supplier-3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certificates: [
      {
        id: 'cert-3',
        supplier_id: 'supplier-2',
        name: 'OEKO-TEX Standard 100',
        type: 'Safety',
        issued_date: '2024-01-01',
        verified_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: 'supplier-3',
    name: 'EcoFriendly Garment Factory',
    tier: 1,
    location: 'Ho Chi Minh City, Vietnam',
    latitude: 10.8231,
    longitude: 106.6297,
    brand_id: 'brand-1',
    parent_supplier_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certificates: []
  }
];

export function JourneyTimelineExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Journey Timeline Example</h2>
      <JourneyTimeline suppliers={exampleSuppliers} />
    </div>
  );
}

export default JourneyTimelineExample;