import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AddSupplierForm } from '../AddSupplierForm'
import type { SupplierWithHierarchy } from '<ecolens>/lib/types'

// Mock the server action to return a simple function
vi.mock('<ecolens>/app/actions', () => ({
  addSupplierToProduct: vi.fn().mockResolvedValue({ message: null })
}))

// Mock useFormState to return initial state
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  useFormState: vi.fn().mockReturnValue([{ message: null }, vi.fn()])
}))

const mockTier1Suppliers: SupplierWithHierarchy[] = [
  {
    id: 'supplier-1',
    name: 'Tier 1 Supplier A',
    tier: 1,
    location: 'China',
    brand_id: 'brand-1',
    parent_supplier_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    latitude: null,
    longitude: null
  },
  {
    id: 'supplier-2',
    name: 'Tier 1 Supplier B',
    tier: 1,
    location: 'India',
    brand_id: 'brand-1',
    parent_supplier_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    latitude: null,
    longitude: null
  }
]

const mockTier2Suppliers: SupplierWithHierarchy[] = [
  {
    id: 'supplier-3',
    name: 'Tier 2 Supplier A',
    tier: 2,
    location: 'Vietnam',
    brand_id: 'brand-1',
    parent_supplier_id: 'supplier-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    latitude: null,
    longitude: null
  }
]

describe('AddSupplierForm', () => {
  const defaultProps = {
    productId: 'test-product-id',
    tier: 1 as const,
    parentSupplierId: null,
    tier1Suppliers: mockTier1Suppliers,
    tier2Suppliers: mockTier2Suppliers,
    onFormSuccess: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render supplier name input', () => {
      render(<AddSupplierForm {...defaultProps} />)

      expect(screen.getByLabelText(/supplier name/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/enter supplier name/i)).toBeInTheDocument()
    })

    it('should render location input', () => {
      render(<AddSupplierForm {...defaultProps} />)

      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/e\.g\., Shanghai, China/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<AddSupplierForm {...defaultProps} />)

      expect(screen.getByRole('button', { name: /add supplier/i })).toBeInTheDocument()
    })
  })

  describe('Hidden Fields Management', () => {
    it('should include hidden productId field', () => {
      render(<AddSupplierForm {...defaultProps} />)

      const hiddenProductId = screen.getByDisplayValue('test-product-id')
      expect(hiddenProductId).toBeInTheDocument()
      expect(hiddenProductId).toHaveAttribute('type', 'hidden')
      expect(hiddenProductId).toHaveAttribute('name', 'productId')
    })

    it('should include hidden tier field', () => {
      render(<AddSupplierForm {...defaultProps} tier={2} />)

      const hiddenTier = screen.getByDisplayValue('2')
      expect(hiddenTier).toBeInTheDocument()
      expect(hiddenTier).toHaveAttribute('type', 'hidden')
      expect(hiddenTier).toHaveAttribute('name', 'tier')
    })

    it('should include hidden parentSupplierId field when provided', () => {
      render(<AddSupplierForm {...defaultProps} parentSupplierId="parent-id" />)

      const hiddenParentId = screen.getByDisplayValue('parent-id')
      expect(hiddenParentId).toBeInTheDocument()
      expect(hiddenParentId).toHaveAttribute('type', 'hidden')
      expect(hiddenParentId).toHaveAttribute('name', 'parentSupplierId')
    })
  })

  describe('Parent Supplier Selection', () => {
    it('should not show parent supplier selection for Tier 1', () => {
      render(<AddSupplierForm {...defaultProps} tier={1} />)

      expect(screen.queryByText(/parent supplier/i)).not.toBeInTheDocument()
    })

    it('should show parent supplier selection for Tier 2', () => {
      render(<AddSupplierForm {...defaultProps} tier={2} />)

      expect(screen.getByText(/parent supplier \(tier 1\)/i)).toBeInTheDocument()
      expect(screen.getByText(/select a tier 1 supplier/i)).toBeInTheDocument()
    })

    it('should show parent supplier selection for Tier 3', () => {
      render(<AddSupplierForm {...defaultProps} tier={3} />)

      expect(screen.getByText(/parent supplier \(tier 2\)/i)).toBeInTheDocument()
      expect(screen.getByText(/select a tier 2 supplier/i)).toBeInTheDocument()
    })

    it('should populate parent supplier options for Tier 2', () => {
      render(<AddSupplierForm {...defaultProps} tier={2} />)

      // Click to open the select dropdown
      fireEvent.click(screen.getByRole('combobox'))

      expect(screen.getByText('Tier 1 Supplier A - China')).toBeInTheDocument()
      expect(screen.getByText('Tier 1 Supplier B - India')).toBeInTheDocument()
    })

    it('should populate parent supplier options for Tier 3', () => {
      render(<AddSupplierForm {...defaultProps} tier={3} />)

      // Click to open the select dropdown
      fireEvent.click(screen.getByRole('combobox'))

      expect(screen.getByText('Tier 2 Supplier A - Vietnam')).toBeInTheDocument()
    })

    it('should disable parent selection when parentSupplierId is pre-selected', () => {
      render(
        <AddSupplierForm 
          {...defaultProps} 
          tier={2} 
          parentSupplierId="supplier-1" 
        />
      )

      const selectTrigger = screen.getByRole('combobox')
      expect(selectTrigger).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should show validation error for empty supplier name', async () => {
      render(<AddSupplierForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/supplier name/i)
      fireEvent.change(nameInput, { target: { value: 'ab' } }) // Too short
      fireEvent.blur(nameInput)

      await waitFor(() => {
        expect(screen.getByText(/supplier name must be at least 3 characters/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for empty location', async () => {
      render(<AddSupplierForm {...defaultProps} />)

      const locationInput = screen.getByLabelText(/location/i)
      fireEvent.change(locationInput, { target: { value: 'a' } }) // Too short
      fireEvent.blur(locationInput)

      await waitFor(() => {
        expect(screen.getByText(/location must be at least 2 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Success Callback Integration', () => {
    it('should accept onFormSuccess callback prop', () => {
      const mockOnFormSuccess = vi.fn()

      render(<AddSupplierForm {...defaultProps} onFormSuccess={mockOnFormSuccess} />)

      // Component should render without errors when callback is provided
      expect(screen.getByRole('button', { name: /add supplier/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and descriptions', () => {
      render(<AddSupplierForm {...defaultProps} />)

      expect(screen.getByLabelText(/supplier name/i)).toBeInTheDocument()
      expect(screen.getByText(/the name of the supplier company/i)).toBeInTheDocument()
      
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      expect(screen.getByText(/the primary location or country/i)).toBeInTheDocument()
    })

    it('should have proper form structure', () => {
      render(<AddSupplierForm {...defaultProps} />)

      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add supplier/i })).toBeInTheDocument()
    })
  })

  describe('Props-based Configuration', () => {
    it('should configure form based on tier prop', () => {
      const { rerender } = render(<AddSupplierForm {...defaultProps} tier={1} />)

      // Tier 1 should not show parent selection
      expect(screen.queryByText(/parent supplier/i)).not.toBeInTheDocument()

      // Change to tier 2
      rerender(<AddSupplierForm {...defaultProps} tier={2} />)

      // Tier 2 should show parent selection
      expect(screen.getByText(/parent supplier \(tier 1\)/i)).toBeInTheDocument()
    })

    it('should use provided productId in hidden field', () => {
      render(<AddSupplierForm {...defaultProps} productId="custom-product-id" />)

      expect(screen.getByDisplayValue('custom-product-id')).toBeInTheDocument()
    })

    it('should handle different parentSupplierId values', () => {
      const { rerender } = render(<AddSupplierForm {...defaultProps} parentSupplierId={null} />)

      // Should not have hidden parent field when null
      expect(screen.queryByDisplayValue('null')).not.toBeInTheDocument()

      // Should have hidden parent field when provided
      rerender(<AddSupplierForm {...defaultProps} parentSupplierId="parent-123" />)
      expect(screen.getByDisplayValue('parent-123')).toBeInTheDocument()
    })
  })
})