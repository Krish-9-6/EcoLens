# Design Document

## Overview

The Digital Product Passport (DPP) feature creates a public-facing interface that transforms supply chain data into an engaging consumer experience. The system leverages Next.js 15 with App Router, Supabase for data access, and Shadcn/ui components to deliver a fast, SEO-optimized, and visually compelling product story.

The architecture follows a server-first approach using Next.js Server Components for optimal performance, with strategic use of Client Components only where interactivity is required (QR code generation and potential map interactions).

## Architecture

### High-Level Architecture

```mermaid
graph TB
    A[Consumer scans QR Code] --> B[Public DPP Page /dpp/[productId]]
    B --> C[Next.js Server Component]
    C --> D[Data Fetching Layer]
    D --> E[Supabase Database]
    E --> F[RLS Policies for Public Access]
    
    G[Brand Dashboard] --> H[QR Code Generator]
    H --> I[Client Component]
    
    C --> J[UI Components]
    J --> K[ProductHeader]
    J --> L[JourneyTimeline]
    J --> M[SupplyChainMap]
    J --> N[CertificateGallery]
    
    E --> O[Products Table]
    E --> P[Suppliers Table]
    E --> Q[Certificates Table]
    E --> R[Ledger Table]
```

### Data Flow

1. **QR Code Scan**: Consumer scans QR code → redirects to `/dpp/[productId]`
2. **Server-Side Rendering**: Next.js Server Component fetches data using single optimized query
3. **Data Transformation**: Raw database data is transformed into UI-ready format
4. **Component Composition**: Multiple presentational components render the complete story
5. **Client Hydration**: Minimal client-side JavaScript for interactive elements

## Components and Interfaces

### Core Data Types

```typescript
// Based on Supabase generated types
interface DppData {
  product: {
    id: string;
    name: string;
    image_url?: string;
    brand: {
      name: string;
    };
  };
  suppliers: Array<{
    id: string;
    name: string;
    tier: 1 | 2 | 3;
    location: string;
    latitude?: number;
    longitude?: number;
    certificates: Array<{
      id: string;
      name: string;
      type: string;
      issued_date: string;
      verified_at?: string;
      ledger_entry?: {
        data_hash: string;
        timestamp: string;
      };
    }>;
  }>;
}
```

### Component Architecture

#### 1. Data Layer (`lib/data.ts`)

**Purpose**: Centralized data fetching with optimized queries

**Key Functions**:
- `fetchDppData(productId: string): Promise<DppData | null>`
- Single query with joins to minimize network requests
- Comprehensive error handling and logging
- Type-safe using Supabase generated types

**Query Strategy**:
```sql
-- Conceptual query structure
SELECT 
  products.*,
  brands.name as brand_name,
  suppliers.*,
  certificates.*,
  ledger.data_hash,
  ledger.timestamp
FROM products
JOIN brands ON products.brand_id = brands.id
JOIN product_suppliers ON products.id = product_suppliers.product_id
JOIN suppliers ON product_suppliers.supplier_id = suppliers.id
LEFT JOIN certificates ON suppliers.id = certificates.supplier_id
LEFT JOIN ledger ON certificates.id = ledger.certificate_id
WHERE products.id = $1
```

#### 2. Page Component (`app/dpp/[productId]/page.tsx`)

**Purpose**: Main entry point for DPP pages

**Architecture**:
- Next.js Server Component for optimal SEO and performance
- Async data fetching at component level
- Error boundary handling for missing products
- Metadata generation for social sharing

**Structure**:
```typescript
export default async function DppPage({ 
  params 
}: { 
  params: { productId: string } 
}) {
  const data = await fetchDppData(params.productId);
  
  if (!data) {
    return <ProductNotFound />;
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <ProductHeader {...data.product} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <JourneyTimeline suppliers={data.suppliers} />
        <SupplyChainMap suppliers={data.suppliers} />
      </div>
      <CertificateGallery suppliers={data.suppliers} />
    </main>
  );
}
```

#### 3. QR Code Component (`components/ui/ProductQRCode.tsx`)

**Purpose**: Generate scannable QR codes for products

**Architecture**:
- Client Component using `react-qr-code`
- Environment-aware URL generation
- Optimized for scanning with proper contrast and sizing

**Features**:
- Production URL detection via `NEXT_PUBLIC_VERCEL_URL`
- Fallback to localhost for development
- Responsive sizing and styling

#### 4. Presentational Components

##### ProductHeader (`components/dpp/ProductHeader.tsx`)
- **Purpose**: Display product and brand information
- **Components Used**: Shadcn Card, Avatar
- **Props**: `productName`, `brandName`, `imageUrl?`
- **Layout**: Hero-style header with product image and branding

##### JourneyTimeline (`components/dpp/JourneyTimeline.tsx`)
- **Purpose**: Visual timeline of supply chain journey
- **Design**: Vertical timeline with tier-based ordering
- **Props**: `suppliers[]` sorted by tier (3→2→1)
- **Styling**: Custom CSS with Tailwind for timeline connectors

##### SupplyChainMap (`components/dpp/SupplyChainMap.tsx`)
- **Purpose**: Geographic visualization of supplier locations
- **Implementation**: React Leaflet for interactive mapping
- **Props**: `suppliers[]` with location data
- **Features**: Clustered markers, responsive zoom levels

##### CertificateGallery (`components/dpp/CertificateGallery.tsx`)
- **Purpose**: Display certificates with verification status
- **Components Used**: Shadcn Card, Badge
- **Props**: `suppliers[]` with nested certificates
- **Features**: Verification badges, certificate details

##### VerifiedBadge (`components/dpp/VerifiedBadge.tsx`)
- **Purpose**: Visual proof of certificate verification
- **Components Used**: Lucide BadgeCheck icon, Shadcn Badge
- **Props**: `timestamp`, `hash`
- **Styling**: Green success styling with monospace hash display

## Data Models

### Database Schema Requirements

The design assumes the following table structure with appropriate RLS policies:

```sql
-- Public read access policies needed
CREATE POLICY "Allow public read access" ON public.products 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.suppliers 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.certificates 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.ledger 
FOR SELECT USING (true);
```

### Data Relationships

- **Products** → **Brands** (many-to-one)
- **Products** → **Suppliers** (many-to-many via product_suppliers)
- **Suppliers** → **Certificates** (one-to-many)
- **Certificates** → **Ledger** (one-to-one for verification)

## Error Handling

### Client-Side Error Boundaries

```typescript
// Error handling strategy
try {
  const data = await fetchDppData(productId);
  if (!data) {
    return <ProductNotFound productId={productId} />;
  }
  // Render success state
} catch (error) {
  console.error('DPP fetch error:', error);
  return <ErrorFallback error={error} />;
}
```

### Graceful Degradation

- **Missing Images**: Fallback to placeholder or brand logo
- **Missing Location Data**: Hide map or show text-only locations
- **Missing Certificates**: Show "No certificates available" message
- **Network Errors**: Retry mechanism with exponential backoff

### Validation

- **Product ID Validation**: UUID format validation before database query
- **Data Integrity**: Null checks for all optional fields
- **Type Safety**: Comprehensive TypeScript interfaces

## Testing Strategy

### Unit Testing

- **Data Fetching**: Mock Supabase client responses
- **Component Rendering**: React Testing Library for UI components
- **QR Code Generation**: Verify correct URL construction
- **Error Handling**: Test all error scenarios

### Integration Testing

- **Database Queries**: Test with real Supabase instance
- **Page Rendering**: End-to-end page load testing
- **QR Code Scanning**: Physical QR code testing

### Performance Testing

- **Page Load Speed**: Target <2s initial load
- **Database Query Performance**: Monitor query execution time
- **Image Loading**: Optimize with Next.js Image component
- **Bundle Size**: Monitor JavaScript bundle size

### Accessibility Testing

- **Screen Reader Compatibility**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliance
- **Mobile Responsiveness**: Touch-friendly interface

## Security Considerations

### Row-Level Security (RLS)

- **Read-Only Access**: Public policies only allow SELECT operations
- **Data Isolation**: No user-specific data exposure
- **Query Injection Prevention**: Parameterized queries only

### Content Security

- **XSS Prevention**: Sanitize all user-generated content
- **Image Security**: Validate image URLs and use Next.js Image optimization
- **Rate Limiting**: Implement request throttling for public endpoints

### Privacy

- **No Personal Data**: DPP pages contain only product/supplier information
- **Analytics**: Privacy-compliant tracking if implemented
- **GDPR Compliance**: No personal data collection or cookies

## Performance Optimizations

### Server-Side Rendering

- **Static Generation**: Consider ISR for frequently accessed products
- **Edge Caching**: Leverage Vercel Edge Network
- **Database Connection Pooling**: Optimize Supabase connections

### Client-Side Optimizations

- **Code Splitting**: Lazy load map components
- **Image Optimization**: Next.js Image with proper sizing
- **Bundle Analysis**: Regular bundle size monitoring

### Caching Strategy

- **Database Caching**: Supabase built-in caching
- **CDN Caching**: Static assets via Vercel CDN
- **Browser Caching**: Appropriate cache headers

This design provides a comprehensive foundation for implementing the Digital Product Passport feature while maintaining performance, security, and user experience standards.