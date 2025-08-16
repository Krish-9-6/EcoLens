import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardErrorBoundary } from '../DashboardErrorBoundary'
import { ErrorMessage, getUserFriendlyErrorMessage } from '../ErrorMessage'
import { DashboardLoadingState } from '../DashboardLoadingState'

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

describe('Error Handling Components', () => {
  describe('DashboardErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <DashboardErrorBoundary>
          <div>Test content</div>
        </DashboardErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should render error UI when error occurs', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      )

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('should show retry button and handle retry', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()

      // Click retry should reset error state
      fireEvent.click(retryButton)

      consoleSpy.mockRestore()
    })

    it('should show navigation buttons when configured', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <DashboardErrorBoundary showHomeButton={true} showBackButton={true}>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      )

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('ErrorMessage', () => {
    it('should render error message with default styling', () => {
      render(
        <ErrorMessage
          message="Test error message"
        />
      )

      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should render different types of messages', () => {
      const { rerender } = render(
        <ErrorMessage
          type="error"
          title="Error Title"
          message="Error message"
        />
      )

      expect(screen.getByText('Error Title')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()

      rerender(
        <ErrorMessage
          type="warning"
          title="Warning Title"
          message="Warning message"
        />
      )

      expect(screen.getByText('Warning Title')).toBeInTheDocument()
      expect(screen.getByText('Warning message')).toBeInTheDocument()

      rerender(
        <ErrorMessage
          type="success"
          title="Success Title"
          message="Success message"
        />
      )

      expect(screen.getByText('Success Title')).toBeInTheDocument()
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    it('should render action button when provided', () => {
      const mockAction = jest.fn()

      render(
        <ErrorMessage
          message="Test message"
          action={{
            label: 'Test Action',
            onClick: mockAction
          }}
        />
      )

      const actionButton = screen.getByRole('button', { name: 'Test Action' })
      expect(actionButton).toBeInTheDocument()

      fireEvent.click(actionButton)
      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should render dismiss button when dismissible', () => {
      const mockDismiss = jest.fn()

      render(
        <ErrorMessage
          message="Test message"
          dismissible={true}
          onDismiss={mockDismiss}
        />
      )

      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      expect(dismissButton).toBeInTheDocument()

      fireEvent.click(dismissButton)
      expect(mockDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('getUserFriendlyErrorMessage', () => {
    it('should handle network errors', () => {
      const result = getUserFriendlyErrorMessage(new Error('Network error occurred'))
      
      expect(result.title).toBe('Connection Problem')
      expect(result.type).toBe('error')
      expect(result.message).toContain('Unable to connect')
    })

    it('should handle authentication errors', () => {
      const result = getUserFriendlyErrorMessage(new Error('Unauthorized access'))
      
      expect(result.title).toBe('Authentication Required')
      expect(result.type).toBe('warning')
      expect(result.message).toContain('session has expired')
    })

    it('should handle validation errors', () => {
      const result = getUserFriendlyErrorMessage(new Error('Validation failed'))
      
      expect(result.title).toBe('Invalid Input')
      expect(result.type).toBe('warning')
      expect(result.message).toContain('check your input')
    })

    it('should handle not found errors', () => {
      const result = getUserFriendlyErrorMessage(new Error('Resource not found'))
      
      expect(result.title).toBe('Not Found')
      expect(result.type).toBe('info')
      expect(result.message).toContain('could not be found')
    })

    it('should handle server errors', () => {
      const result = getUserFriendlyErrorMessage(new Error('Internal server error'))
      
      expect(result.title).toBe('Server Error')
      expect(result.type).toBe('error')
      expect(result.message).toContain('servers are experiencing issues')
    })

    it('should handle unknown errors', () => {
      const result = getUserFriendlyErrorMessage(new Error('Some random error'))
      
      expect(result.title).toBe('Something Went Wrong')
      expect(result.type).toBe('error')
      expect(result.message).toContain('unexpected error occurred')
    })

    it('should handle string errors', () => {
      const result = getUserFriendlyErrorMessage('String error message')
      
      expect(result.title).toBe('Something Went Wrong')
      expect(result.type).toBe('error')
      expect(result.message).toBe('String error message')
    })
  })

  describe('DashboardLoadingState', () => {
    it('should render default loading state', () => {
      render(<DashboardLoadingState />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render custom message', () => {
      render(<DashboardLoadingState message="Custom loading message" />)

      expect(screen.getByText('Custom loading message')).toBeInTheDocument()
    })

    it('should render different types', () => {
      const { rerender } = render(<DashboardLoadingState type="inline" />)
      
      // Should render inline version
      expect(screen.getByRole('status')).toBeInTheDocument()

      rerender(<DashboardLoadingState type="form" message="Processing..." />)
      
      // Should render form version
      expect(screen.getByText('Processing...')).toBeInTheDocument()

      rerender(<DashboardLoadingState type="card" />)
      
      // Should render card version
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render skeleton when requested', () => {
      render(<DashboardLoadingState type="table" showSkeleton={true} />)

      // Should render skeleton elements
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(7) // Header + 5 rows + button
    })
  })
})