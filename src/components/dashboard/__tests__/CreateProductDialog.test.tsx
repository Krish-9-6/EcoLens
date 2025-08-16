import { render, screen, fireEvent } from '@testing-library/react'
import { CreateProductDialog } from '../CreateProductDialog'
import { vi } from 'vitest'

// Mock the CreateProductForm component
vi.mock('../CreateProductForm', () => ({
  CreateProductForm: ({ onFormSuccess }: { onFormSuccess: () => void }) => (
    <div data-testid="create-product-form">
      <button onClick={onFormSuccess}>Mock Success</button>
    </div>
  )
}))

describe('CreateProductDialog', () => {
  it('should render trigger button and dialog content when opened', () => {
    render(
      <CreateProductDialog>
        <button>Open Dialog</button>
      </CreateProductDialog>
    )
    
    const triggerButton = screen.getByText('Open Dialog')
    expect(triggerButton).toBeInTheDocument()
    
    // Dialog should not be visible initially
    expect(screen.queryByText('Create New Product')).not.toBeInTheDocument()
    
    // Click to open dialog
    fireEvent.click(triggerButton)
    
    // Dialog should now be visible
    expect(screen.getByText('Create New Product')).toBeInTheDocument()
    expect(screen.getByText(/add a new product to your brand catalog/i)).toBeInTheDocument()
    expect(screen.getByTestId('create-product-form')).toBeInTheDocument()
  })

  it('should close dialog when form success is called', () => {
    render(
      <CreateProductDialog>
        <button>Open Dialog</button>
      </CreateProductDialog>
    )
    
    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'))
    expect(screen.getByText('Create New Product')).toBeInTheDocument()
    
    // Trigger form success
    fireEvent.click(screen.getByText('Mock Success'))
    
    // Dialog should be closed
    expect(screen.queryByText('Create New Product')).not.toBeInTheDocument()
  })

  it('should have proper dialog structure and accessibility', () => {
    render(
      <CreateProductDialog>
        <button>Open Dialog</button>
      </CreateProductDialog>
    )
    
    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'))
    
    // Check dialog structure
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create New Product')).toBeInTheDocument()
    
    // Check for close button (X)
    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
    
    // Test closing with X button
    fireEvent.click(closeButton)
    expect(screen.queryByText('Create New Product')).not.toBeInTheDocument()
  })

  it('should handle dialog open/close state changes', () => {
    render(
      <CreateProductDialog>
        <button>Open Dialog</button>
      </CreateProductDialog>
    )
    
    // Initially closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    
    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Close with escape key
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})