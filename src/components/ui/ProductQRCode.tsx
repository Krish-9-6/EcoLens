'use client';

import QRCode from 'react-qr-code';

interface ProductQRCodeProps {
  productId: string;
  size?: number;
  className?: string;
}

/**
 * ProductQRCode component generates a scannable QR code for a product's DPP page
 * Uses environment-aware URL construction for production vs development
 */
export function ProductQRCode({ 
  productId, 
  size = 200, 
  className = '' 
}: ProductQRCodeProps) {
  // Environment-aware URL construction
  const getBaseUrl = (): string => {
    // Production: Use NEXT_PUBLIC_VERCEL_URL or custom domain
    if (process.env.NODE_ENV === 'production') {
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      }
      // Fallback to a default production domain if needed
      return 'https://ecolens.vercel.app';
    }
    
    // Development: Use localhost
    return 'http://localhost:3000';
  };

  const dppUrl = `${getBaseUrl()}/dpp/${productId}`;

  return (
    <div 
      className={`inline-block p-4 bg-white rounded-lg shadow-sm ${className}`}
      style={{ 
        // Ensure proper contrast and sizing for reliable scanning
        backgroundColor: 'white',
        padding: '16px'
      }}
    >
      <QRCode
        value={dppUrl}
        size={size}
        style={{ 
          height: 'auto', 
          maxWidth: '100%', 
          width: '100%',
          // Ensure proper contrast for scanning
          backgroundColor: 'white'
        }}
        viewBox="0 0 256 256"
        level="M" // Medium error correction level for better scanning
      />
      <div className="mt-2 text-xs text-gray-600 text-center font-mono break-all">
        {dppUrl}
      </div>
    </div>
  );
}

export default ProductQRCode;