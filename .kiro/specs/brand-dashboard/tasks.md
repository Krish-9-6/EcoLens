# Implementation Plan

- [x] 1. Database Schema Updates and Security Foundation





  - Create profiles table to link authenticated users to brands (if not using Supabase Auth metadata)
  - Add missing columns to suppliers table: brand_id (foreign key to brands) and parent_supplier_id (self-referencing for hierarchy)
  - Add constraints to ensure tier hierarchy logic (Tier 1 has no parent, Tier 2/3 must have parent)
  - Enable Row-Level Security (RLS) on products, suppliers, and product_suppliers tables
  - Create brand isolation policies for authenticated users and public read policies for DPP integration
  - Update TypeScript types in src/lib/types.ts to reflect new schema changes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.2, 5.3_

- [x] 2. Authentication Infrastructure Setup





  - Set up Supabase Auth configuration for authenticated brand users
  - Create server-side Supabase client functions for authenticated requests
  - Implement middleware or auth helpers for protecting dashboard routes
  - Create utility functions for extracting brand_id from authenticated user context
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Core Validation Schemas





  - Create Zod schemas for ProductSchema and SupplierSchema with comprehensive validation rules
  - Define FormState type for Server Action responses
  - Implement validation for product names (min 3 chars), supplier tiers (1-3), locations, and UUID fields
  - _Requirements: 4.1, 4.2, 2.2, 2.6_

- [x] 4. Server Actions Implementation





  - Implement createProduct Server Action with validation, brand_id extraction, and database insertion
  - Implement addSupplierToProduct Server Action with atomic supplier creation and product linking
  - Add comprehensive error handling, revalidation, and redirect logic for both actions
  - Include transaction-like operations for supplier-product relationship creation
  - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.4, 2.5, 3.1, 3.2, 4.3, 4.4_

- [x] 5. Products Dashboard Page




  - Create main products listing page as Server Component with automatic brand filtering
  - Implement Shadcn Table component to display products with navigation links
  - Add "Create New Product" button that opens CreateProductDialog
  - Include proper error handling for empty states and loading scenarios
  - _Requirements: 1.1, 6.1, 6.2, 6.5_

- [x] 6. Product Creation Form Components





  - Build CreateProductDialog component with Shadcn Dialog and state management
  - Implement CreateProductForm with React Hook Form, Zod validation, and useFormState integration
  - Add loading states, error display, and success handling with dialog closure
  - Include proper accessibility features and responsive design
  - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Dynamic Product Detail Page





  - Create product detail page with productId parameter and Server Component architecture
  - Implement complex data fetching for product and all associated suppliers with hierarchy processing
  - Build visual tier-based layout with separate columns for Tier 1, 2, and 3 suppliers
  - Add contextual "Add Supplier" buttons for each tier with proper parent-child relationships
  - _Requirements: 2.1, 2.2, 2.3, 6.3, 6.4_

- [x] 8. Supplier Management Form Components





  - Build AddSupplierDialog component with dynamic titles based on tier and parent context
  - Implement AddSupplierForm with props-based configuration (productId, tier, parentSupplierId)
  - Add hidden field management for context preservation and proper form submission
  - Include success callback integration for dialog management and UI updates
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Supply Chain Hierarchy Display





  - Implement supplier hierarchy processing logic to organize suppliers by tier
  - Create visual components to display parent-child relationships in supply chain
  - Add proper styling and layout for multi-tier supplier visualization
  - Include responsive design for mobile and desktop viewing
  - _Requirements: 2.1, 2.2, 2.3, 6.3, 6.4_

- [x] 10. Integration Testing and DPP Compatibility Audit





  - Verify existing DPP functionality works with updated suppliers table schema (new brand_id and parent_supplier_id columns)
  - Test public RLS policies allow DPP pages to fetch product and supplier data
  - Update DPP data fetching functions if needed to handle supplier hierarchy and brand relationships
  - Ensure TypeScript types compatibility across DPP and dashboard components after schema updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Error Handling and User Experience Polish





  - Implement comprehensive error boundaries for all dashboard components
  - Add proper loading states and optimistic UI updates for form submissions
  - Create user-friendly error messages for validation failures and database errors
  - Test and refine navigation flow between products list and detail pages
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 6.5_