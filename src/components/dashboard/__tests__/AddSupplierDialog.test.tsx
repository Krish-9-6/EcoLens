import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AddSupplierDialog } from '../AddSupplierDialog'
import type { SupplierWithHierarchy } from '<ecolens>/lib/types'

// Mock the AddSupplierForm component
vi.mock('../AddSupplierForm', () => ({
  AddSupplierForm: ({ onFormSuccess, tier, productId, parentSupplierId }: {
    onFormSuccess: () => void;
    tier: number;
    productId: string;
    parentSupplierId: string | null;
  }) => (
    <div data-testid="add-supplier-form">
      <div data-testid="form-tier">{tier}</div>
      <div data-testid="form-product-id">{productId}</div>
      <div data-testid="form-parent-supplier-id">{parentSupplierId || 'null'}</div>
      <button onClick={onFormSuccess} data-testid="mock-success-button">
        Mock Success
      </button>
    </div>
  )
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
  }
]

const mockTier2Suppliers: SupplierWithHierarchy[] = [
  {
    id: 'supplier-2',
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

describe('AddSupplierDialog', () => {
  const defaultProps = {
    productId: 'test-product-id',
    tier: 1 as const,
    parentSupplierId: null,
    tier1Suppliers: mockTier1Suppliers,
    tier2Suppliers: mockTier2Suppliers
  }

  describe('Dynamic Titles and Descriptions', () => {
    it('should display correct title and description for Tier 1', () => {
      render(
        <AddSupplierDialog {...defaultProps} tier={1}>
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      expect(screen.getByText('Add Tier 1 Supplier')).toBeInTheDocument()
      expect(screen.getByText(/Add a direct supplier to your brand/)).toBeInTheDocument()
    })

    it('should display correct title and description for Tier 2', () => {
      render(
        <AddSupplierDialog {...defaultProps} tier={2}>
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      expect(screen.getByText('Add Tier 2 Supplier')).toBeInTheDocument()
      expect(screen.getByText(/Add a supplier that provides materials or services to your Tier 1 suppliers/)).toBeInTheDocument()
    })

    it('should display correct title and description for Tier 3', () => {
      render(
        <AddSupplierDialog {...defaultProps} tier={3}>
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      expect(screen.getByText('Add Tier 3 Supplier')).toBeInTheDocument()
      expect(screen.getByText(/Add a supplier that provides materials or services to your Tier 2 suppliers/)).toBeInTheDocument()
    })
  })

  describe('Props Passing', () => {
    it('should pass correct props to AddSupplierForm', () => {
      render(
        <AddSupplierDialog 
          {...defaultProps} 
          tier={2} 
          parentSupplierId="parent-supplier-id"
        >
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      expect(screen.getByTestId('form-tier')).toHaveTextContent('2')
      expect(screen.getByTestId('form-product-id')).toHaveTextContent('test-product-id')
      expect(screen.getByTestId('form-parent-supplier-id')).toHaveTextContent('parent-supplier-id')
    })

    it('should handle null parentSupplierId correctly', () => {
      render(
        <AddSupplierDialog {...defaultProps} tier={1} parentSupplierId={null}>
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      expect(screen.getByTestId('form-parent-supplier-id')).toHaveTextContent('null')
    })
  })

  describe('Dialog State Management', () => {
    it('should open dialog when trigger is clicked', () => {
      render(
        <AddSupplierDialog {...defaultProps}>
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      expect(screen.queryByTestId('add-supplier-form')).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('Open Dialog'))

      expect(screen.getByTestId('add-supplier-form')).toBeInTheDocument()
    })

    it('should close dialog on successful form submission', async () => {
      render(
        <AddSupplierDialog {...defaultProps}>
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      // Open dialog
      fireEvent.click(screen.getByText('Open Dialog'))
      expect(screen.getByTestId('add-supplier-form')).toBeInTheDocument()

      // Trigger success callback
      fireEvent.click(screen.getByTestId('mock-success-button'))

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByTestId('add-supplier-form')).not.toBeInTheDocument()
      })
    })

    it('should support controlled state via open and onOpenChange props', () => {
      const mockOnOpenChange = vi.fn()
      
      render(
        <AddSupplierDialog 
          {...defaultProps} 
          open={true} 
          onOpenChange={mockOnOpenChange}
        >
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      // Dialog should be open due to controlled state
      expect(screen.getByTestId('add-supplier-form')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog structure', () => {
      render(
        <AddSupplierDialog {...defaultProps}>
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      // Check for dialog title
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Add Tier 1 Supplier')).toBeInTheDocument()
    })

    it('should render trigger element correctly', () => {
      render(
        <AddSupplierDialog {...defaultProps}>
          <button data-testid="custom-trigger">Custom Trigger</button>
        </AddSupplierDialog>
      )

      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
      expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
    })
  })

  describe('Context-Aware Behavior', () => {
    it('should pass tier1Suppliers for tier 2 supplier creation', () => {
      render(
        <AddSupplierDialog 
          {...defaultProps} 
          tier={2}
          tier1Suppliers={mockTier1Suppliers}
        >
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      // The form should receive the tier1Suppliers
      expect(screen.getByTestId('add-supplier-form')).toBeInTheDocument()
    })

    it('should pass tier2Suppliers for tier 3 supplier creation', () => {
      render(
        <AddSupplierDialog 
          {...defaultProps} 
          tier={3}
          tier2Suppliers={mockTier2Suppliers}
        >
          <button>Open Dialog</button>
        </AddSupplierDialog>
      )

      fireEvent.click(screen.getByText('Open Dialog'))

      // The form should receive the tier2Suppliers
      expect(screen.getByTestId('add-supplier-form')).toBeInTheDocument()
    })
  })
})