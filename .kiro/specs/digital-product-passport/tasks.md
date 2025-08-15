# Implementation Plan

- [x] 1. Set up Supabase integration and type definitions





  - Install and configure Supabase client for Next.js App Router
  - Create Supabase client utility functions for server components
  - Generate TypeScript types from database schema
  - Set up environment variables for Supabase connection
  - _Requirements: 6.1, 6.2, 7.1_

- [x] 2. Create core data fetching infrastructure





  - Implement `fetchDppData` function in `lib/data.ts` with optimized single query
  - Add comprehensive error handling and logging for database operations
  - Create TypeScript interfaces for DPP data structure
  - Write unit tests for data fetching function with mocked Supabase responses
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 3. Build the main DPP page component





  - Create dynamic route at `app/dpp/[productId]/page.tsx` as Server Component
  - Implement async data fetching with productId parameter
  - Add error handling for invalid product IDs and missing data
  - Create "Product Not Found" error component
  - Generate metadata for SEO and social sharing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.4_

- [x] 4. Implement QR code generation component





  - Create `ProductQRCode` client component using `react-qr-code` library
  - Implement environment-aware URL construction (production vs development)
  - Add proper styling for scannable QR codes with white background and padding
  - Write tests for URL generation and QR code rendering
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Build product header presentation component





  - Create `ProductHeader` component using Shadcn Card and Avatar components
  - Implement responsive layout for product name, brand name, and image
  - Add fallback handling for missing product images
  - Style component with hero-style layout and proper typography
  - _Requirements: 2.1, 2.4_

- [x] 6. Create supply chain journey timeline component





  - Build `JourneyTimeline` component with vertical timeline design
  - Implement tier-based sorting (Tier 3 → Tier 2 → Tier 1) for suppliers
  - Create custom CSS with Tailwind for timeline connectors and visual flow
  - Add supplier information display (name, tier description, location)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_
-

- [x] 7. Implement interactive supply chain map component




  - Create `SupplyChainMap` component using React Leaflet
  - Add supplier location plotting with coordinate handling
  - Implement responsive zoom levels to show all supplier locations
  - Add graceful handling for missing location data
  - _Requirements: 8.1, 8.2, 8.3, 8.4_
-

- [x] 8. Build certificate gallery with verification display




  - Create `CertificateGallery` component iterating through supplier certificates
  - Implement certificate card layout using Shadcn Card components
  - Add conditional rendering for verified vs unverified certificates
  - Display certificate details (name, type, issued date)
  - _Requirements: 4.1, 4.3_

- [x] 9. Create verification badge component





  - Build `VerifiedBadge` component with BadgeCheck icon from Lucide React
  - Implement green success styling for verified certificates
  - Display formatted verification timestamp and immutable data hash
  - Use monospace font for hash display and proper date formatting
  - _Requirements: 4.2, 4.4_
-

- [x] 10. Integrate all components in main DPP page layout




  - Compose all presentational components in the main page component
  - Implement responsive grid layout for optimal viewing on all devices
  - Add proper spacing and visual hierarchy between sections
  - Pass fetched data as props to all child components
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 11. Add comprehensive error handling and loading states





  - Implement error boundaries for component-level error handling
  - Add loading states for async operations where needed
  - Create fallback components for various error scenarios
  - Add retry mechanisms for failed data fetching operations
  - _Requirements: 1.3, 2.4, 7.4_
-

- [x] 12. Write comprehensive tests for all components




  - Create unit tests for all presentational components using React Testing Library
  - Write integration tests for the main DPP page component
  - Add tests for QR code generation and URL construction
  - Test error handling scenarios and edge cases
  - _Requirements: 1.4, 5.3, 7.4_

- [ ] 13. Optimize performance and accessibility










  - Implement Next.js Image optimization for product and certificate images
  - Add proper ARIA labels and semantic HTML for screen reader compatibility
  - Ensure keyboard navigation works for all interactive elements
  - Optimize bundle size and implement code splitting where beneficial
  - _Requirements: 1.4, 7.2_



- [-] 14. Set up database Row-Level Security policies


  - Create RLS policies for public read access to products, suppliers, certificates, and ledger tables
  - Test public access without authentication requirements
  - Verify that only SELECT operations are allowed for public users
  - Document security policy implementation for team reference
  - _Requirements: 6.1, 6.2, 6.3, 6.4_