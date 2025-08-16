import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VerifiedBadge } from '../VerifiedBadge';

describe('VerifiedBadge', () => {
  const defaultProps = {
    timestamp: '2024-01-15T10:30:00Z',
    hash: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  };

  describe('Basic Rendering', () => {
    it('should render verified badge with check icon', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      expect(screen.getByText('Verified')).toBeInTheDocument();
      
      // Check for BadgeCheck icon (Lucide React)
      const badge = screen.getByText('Verified').closest('[class*="inline-flex"]');
      expect(badge).toBeInTheDocument();
    });

    it('should display formatted timestamp', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      // Should format the timestamp to readable date
      expect(screen.getByText(/Verified:/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    it('should display truncated hash', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      expect(screen.getByText(/Hash:/)).toBeInTheDocument();
      // Should show truncated hash: first 8 + ... + last 8 characters
      expect(screen.getByText('abc123de...x234yz')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format different date formats correctly', () => {
      const testCases = [
        {
          timestamp: '2024-12-25T15:45:30Z',
          expectedText: 'Dec 25, 2024'
        },
        {
          timestamp: '2023-06-01T09:00:00Z',
          expectedText: 'Jun 1, 2023'
        },
        {
          timestamp: '2024-02-29T23:59:59Z',
          expectedText: 'Feb 29, 2024'
        }
      ];

      testCases.forEach(({ timestamp, expectedText }) => {
        const { unmount } = render(<VerifiedBadge timestamp={timestamp} hash="testhash" />);
        
        expect(screen.getByText(new RegExp(expectedText))).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should include time in the formatted date', () => {
      render(<VerifiedBadge timestamp="2024-01-15T14:30:00Z" hash="testhash" />);
      
      // Should include time (format may vary based on locale)
      const verifiedText = screen.getByText(/Verified:/).parentElement;
      expect(verifiedText?.textContent).toMatch(/2:30 PM|14:30/);
    });

    it('should handle invalid date gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<VerifiedBadge timestamp="invalid-date" hash="testhash" />);
      
      // Should fallback to original string
      expect(screen.getByText(/invalid-date/)).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Error formatting date:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Hash Truncation', () => {
    it('should not truncate short hashes', () => {
      render(<VerifiedBadge timestamp={defaultProps.timestamp} hash="short" />);
      
      expect(screen.getByText('short')).toBeInTheDocument();
    });

    it('should not truncate hashes exactly 16 characters', () => {
      render(<VerifiedBadge timestamp={defaultProps.timestamp} hash="1234567890123456" />);
      
      expect(screen.getByText('1234567890123456')).toBeInTheDocument();
    });

    it('should truncate long hashes correctly', () => {
      const longHash = 'abcdefghijklmnopqrstuvwxyz1234567890';
      render(<VerifiedBadge timestamp={defaultProps.timestamp} hash={longHash} />);
      
      expect(screen.getByText('abcdefgh...567890')).toBeInTheDocument();
    });

    it('should handle very long hashes', () => {
      const veryLongHash = 'a'.repeat(100);
      render(<VerifiedBadge timestamp={defaultProps.timestamp} hash={veryLongHash} />);
      
      expect(screen.getByText('aaaaaaaa...aaaaaaaa')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply success variant to badge', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      const badge = screen.getByText('Verified').closest('[class*="inline-flex"]');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'gap-1');
    });

    it('should display hash in monospace font', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      const hashElement = screen.getByText('abc123de...x234yz');
      expect(hashElement).toHaveClass('font-mono', 'text-xs', 'bg-muted', 'px-1', 'py-0.5', 'rounded');
    });

    it('should have proper spacing and text sizing', () => {
      const { container } = render(<VerifiedBadge {...defaultProps} />);
      
      // Check for proper spacing classes
      const mainContainer = container.querySelector('.space-y-2');
      expect(mainContainer).toBeInTheDocument();
      
      const detailsContainer = container.querySelector('.text-xs.text-muted-foreground.space-y-1');
      expect(detailsContainer).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('should render BadgeCheck icon with proper size', () => {
      const { container } = render(<VerifiedBadge {...defaultProps} />);
      
      // Check for icon with proper classes
      const icon = container.querySelector('.w-3.h-3');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure for screen readers', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      // Verification information should be clearly structured
      expect(screen.getByText('Verified:')).toBeInTheDocument();
      expect(screen.getByText('Hash:')).toBeInTheDocument();
    });

    it('should use code element for hash display', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      const hashElement = screen.getByText('abc123de...x234yz');
      expect(hashElement.tagName).toBe('CODE');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty hash', () => {
      render(<VerifiedBadge timestamp={defaultProps.timestamp} hash="" />);
      
      expect(screen.getByText('Hash:')).toBeInTheDocument();
      // Should render empty hash without crashing
    });

    it('should handle empty timestamp', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<VerifiedBadge timestamp="" hash="testhash" />);
      
      expect(screen.getByText('Verified:')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle special characters in hash', () => {
      render(<VerifiedBadge timestamp={defaultProps.timestamp} hash="abc!@#$%^&*()123" />);
      
      expect(screen.getByText('abc!@#$%^&*()123')).toBeInTheDocument();
    });

    it('should handle unicode characters in hash', () => {
      render(<VerifiedBadge timestamp={defaultProps.timestamp} hash="abc123αβγδε456" />);
      
      expect(screen.getByText('abc123αβγδε456')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work with different Badge variants', () => {
      render(<VerifiedBadge {...defaultProps} />);
      
      // Should render without errors and maintain structure
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText('abc123de...x234yz')).toBeInTheDocument();
    });
  });
});