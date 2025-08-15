import { render, screen, fireEvent } from '@testing-library/react'
import { 
  NetworkErrorFallback, 
  DatabaseErrorFallback, 
  MapErrorFallback, 
  GenericErrorFallback 
} from '../ErrorFallbacks'

describe('Error Fallback Components', () => {
  describe('NetworkErrorFallback', () => {
    it('should render network error message', () => {
      render(<NetworkErrorFallback />)
      
      expect(screen.getByText('Connection Problem')).toBeInTheDocument()
      expect(screen.getByText(/having trouble connecting to our servers/)).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<NetworkErrorFallback onRetry={onRetry} />)
      
      fireEvent.click(screen.getByText('Try Again'))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should not show retry button when onRetry is not provided', () => {
      render(<NetworkErrorFallback />)
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
    })
  })

  describe('DatabaseErrorFallback', () => {
    it('should render database error message', () => {
      render(<DatabaseErrorFallback />)
      
      expect(screen.getByText('Data Unavailable')).toBeInTheDocument()
      expect(screen.getByText(/experiencing technical difficulties/)).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<DatabaseErrorFallback onRetry={onRetry} />)
      
      fireEvent.click(screen.getByText('Retry'))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('MapErrorFallback', () => {
    it('should render map error message', () => {
      render(<MapErrorFallback />)
      
      expect(screen.getByText('Map Unavailable')).toBeInTheDocument()
      expect(screen.getByText(/interactive map couldn't load/)).toBeInTheDocument()
    })

    it('should call onRetry when reload button is clicked', () => {
      const onRetry = vi.fn()
      render(<MapErrorFallback onRetry={onRetry} />)
      
      fireEvent.click(screen.getByText('Reload Map'))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('GenericErrorFallback', () => {
    it('should render generic error message', () => {
      render(<GenericErrorFallback />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/unexpected error occurred/)).toBeInTheDocument()
    })

    it('should call onRetry when try again button is clicked', () => {
      const onRetry = vi.fn()
      render(<GenericErrorFallback onRetry={onRetry} />)
      
      fireEvent.click(screen.getByText('Try Again'))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should apply custom className', () => {
      const { container } = render(<GenericErrorFallback className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})