import { SupplyChainMap } from './SupplyChainMap'
import type { SupplierWithCertificates } from '<ecolens>/lib/types'

// Example data for testing the SupplyChainMap component
const exampleSuppliers: SupplierWithCertificates[] = [
  {
    id: '1',
    name: 'Cotton Farm Co.',
    tier: 3,
    location: 'Texas, USA',
    latitude: 32.7767,
    longitude: -96.7970,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certificates: [
      {
        id: 'cert-1',
        supplier_id: '1',
        name: 'Organic Cotton Certificate',
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
      }
    ]
  },
  {
    id: '2',
    name: 'Textile Mill Ltd.',
    tier: 2,
    location: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certificates: [
      {
        id: 'cert-2',
        supplier_id: '2',
        name: 'Fair Trade Certificate',
        type: 'Fair Trade',
        issued_date: '2024-01-15',
        verified_at: null,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'Garment Factory Inc.',
    tier: 1,
    location: 'Ho Chi Minh City, Vietnam',
    latitude: 10.8231,
    longitude: 106.6297,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certificates: []
  }
]

const suppliersWithoutCoordinates: SupplierWithCertificates[] = [
  {
    id: '4',
    name: 'Unknown Location Supplier',
    tier: 1,
    location: 'Unknown Location',
    latitude: null,
    longitude: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certificates: []
  }
]

export function SupplyChainMapExample() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Supply Chain Map - With Coordinates</h2>
        <p className="text-gray-600 mb-4">
          This example shows suppliers with valid coordinates plotted on an interactive map.
        </p>
        <SupplyChainMap suppliers={exampleSuppliers} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Supply Chain Map - Without Coordinates</h2>
        <p className="text-gray-600 mb-4">
          This example shows the fallback state when suppliers don&apos;t have location data.
        </p>
        <SupplyChainMap suppliers={suppliersWithoutCoordinates} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Supply Chain Map - Empty State</h2>
        <p className="text-gray-600 mb-4">
          This example shows the fallback state when no suppliers are provided.
        </p>
        <SupplyChainMap suppliers={[]} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Supply Chain Map - Single Supplier</h2>
        <p className="text-gray-600 mb-4">
          This example shows how the map handles a single supplier location.
        </p>
        <SupplyChainMap suppliers={[exampleSuppliers[0]]} />
      </div>
    </div>
  )
}