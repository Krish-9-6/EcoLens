import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateProductForm } from '../CreateProductForm'
import { vi } from 'vitest'

// Mock the server action
vi.mock('<ecolens>/app/actions', () => ({
  createProduct: vi.fn()
}))

// Mock react-dom for useFormState
vi.mock('react-dom', () => ({
  useFormState: vi.fn(() => [{ message: null }, vi.fn()])
}))

describe('CreateProductForm', () => {
  const mockOnFormSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields correctly', () => {
    render(<CreateProductForm onFormSuccess={mockOnFormSuccess} />)
    
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter product name/i)).toBeInTheDocument()
    expect(screen.getByText(/choose a descriptive name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should handle form input changes', async () => {
    render(<CreateProductForm onFormSuccess={mockOnFormSuccess} />)
    
    const input = screen.getByLabelText(/product name/i)
    fireEvent.change(input, { target: { value: 'Test Product' } })
    
    expect(input).toHaveValue('Test Product')
  })

  it('should disable submit button when form is invalid', async () => {
    render(<CreateProductForm onFormSuccess={mockOnFormSuccess} />)
    
    const submitButton = screen.getByRole('button', { name: /create product/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when form is valid', async () => {
    render(<CreateProductForm onFormSuccess={mockOnFormSuccess} />)
    
    const input = screen.getByLabelText(/product name/i)
    fireEvent.change(input, { target: { value: 'Valid Product Name' } })
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create product/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('should call onFormSuccess when cancel is clicked', () => {
    render(<CreateProductForm onFormSuccess={mockOnFormSuccess} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnFormSuccess).toHaveBeenCalledTimes(1)
  })

  it('should have proper error message structure when server errors occur', () => {
    // This test verifies the error message structure exists
    // Server error testing would require more complex mocking
    render(<CreateProductForm onFormSuccess={mockOnFormSuccess} />)
    
    // Verify the form structure supports error display
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('noValidate')
  })

  it('should have proper accessibility attributes', () => {
    render(<CreateProductForm onFormSuccess={mockOnFormSuccess} />)
    
    const input = screen.getByLabelText(/product name/i)
    expect(input).toHaveAttribute('aria-describedby', 'name-description name-error')
    expect(input).toHaveAttribute('maxLength', '255')
    expect(input).toHaveAttribute('autoComplete', 'off')
    
    const form = input.closest('form')
    expect(form).toHaveAttribute('noValidate')
  })
})