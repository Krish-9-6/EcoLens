# Requirements Document

## Introduction

The Digital Product Passport (DPP) feature transforms raw supply chain data into an interactive, consumer-facing story that builds trust and transparency. This feature serves as the public interface where consumers can scan a QR code on a physical product and access its complete supply chain journey, including supplier information, certifications, and verification status through an immutable ledger system.

## Requirements

### Requirement 1

**User Story:** As a consumer, I want to scan a QR code on a product and view its digital passport, so that I can understand the product's supply chain journey and verify its authenticity.

#### Acceptance Criteria

1. WHEN a consumer scans a QR code THEN the system SHALL redirect them to a public DPP page at `/dpp/[productId]`
2. WHEN the DPP page loads THEN the system SHALL display the product information without requiring user authentication
3. IF the product ID is invalid THEN the system SHALL display a "Product Not Found" message
4. WHEN the page loads THEN the system SHALL render within 2 seconds for optimal user experience

### Requirement 2

**User Story:** As a consumer, I want to see comprehensive product information including brand details and supply chain data, so that I can make informed purchasing decisions.

#### Acceptance Criteria

1. WHEN viewing a DPP page THEN the system SHALL display the product name, brand name, and product image in a header section
2. WHEN the page loads THEN the system SHALL fetch and display all related suppliers organized by tier (Tier 3 to Tier 1)
3. WHEN displaying supplier information THEN the system SHALL show supplier name, tier level, and location for each supplier
4. IF supplier data is missing THEN the system SHALL gracefully handle the absence without breaking the page layout

### Requirement 3

**User Story:** As a consumer, I want to see an interactive timeline of the product's journey through the supply chain, so that I can understand how the product was made.

#### Acceptance Criteria

1. WHEN viewing the DPP page THEN the system SHALL display a vertical timeline showing the product's journey
2. WHEN displaying the timeline THEN the system SHALL order suppliers from Tier 3 (raw materials) to Tier 1 (final assembly)
3. WHEN showing each timeline item THEN the system SHALL display supplier name, tier description, and location
4. WHEN the timeline renders THEN the system SHALL use visual indicators to connect the journey steps

### Requirement 4

**User Story:** As a consumer, I want to view certificates and their verification status, so that I can trust the authenticity of sustainability and quality claims.

#### Acceptance Criteria

1. WHEN viewing the DPP page THEN the system SHALL display all certificates associated with the product's suppliers
2. WHEN a certificate has been verified THEN the system SHALL display a verified badge with timestamp and immutable hash
3. WHEN a certificate is unverified THEN the system SHALL clearly indicate the unverified status
4. WHEN displaying verification details THEN the system SHALL show the verification date and data hash from the ledger

### Requirement 5

**User Story:** As a brand manager, I want to generate QR codes for my products, so that consumers can easily access the digital passport.

#### Acceptance Criteria

1. WHEN a brand manager requests a QR code THEN the system SHALL generate a scannable QR code linking to the DPP page
2. WHEN generating the QR code THEN the system SHALL use the full public URL format `https://domain.com/dpp/[productId]`
3. WHEN displaying the QR code THEN the system SHALL ensure proper contrast and sizing for reliable scanning
4. IF in development environment THEN the system SHALL use localhost URL for QR code generation

### Requirement 6

**User Story:** As a system administrator, I want to ensure public read access to product data, so that consumers can view DPP pages without authentication.

#### Acceptance Criteria

1. WHEN the system accesses product data THEN it SHALL use Row-Level Security policies that allow public read access
2. WHEN querying the database THEN the system SHALL access products, suppliers, certificates, and ledger tables without authentication
3. WHEN implementing security policies THEN the system SHALL only allow SELECT operations for public access
4. IF unauthorized operations are attempted THEN the system SHALL deny INSERT, UPDATE, and DELETE operations

### Requirement 7

**User Story:** As a developer, I want efficient data fetching for DPP pages, so that the pages load quickly and provide good SEO performance.

#### Acceptance Criteria

1. WHEN fetching DPP data THEN the system SHALL use a single database query with joins to minimize network requests
2. WHEN implementing the DPP page THEN the system SHALL use Next.js Server Components for optimal performance
3. WHEN querying related data THEN the system SHALL fetch product, brand, suppliers, certificates, and ledger data in one request
4. WHEN handling errors THEN the system SHALL log errors and return null for graceful error handling

### Requirement 8

**User Story:** As a consumer, I want to see a visual map of the supply chain locations, so that I can understand the geographic journey of the product.

#### Acceptance Criteria

1. WHEN viewing the DPP page THEN the system SHALL display an interactive map showing supplier locations
2. WHEN suppliers have location data THEN the system SHALL plot their positions on the map
3. WHEN displaying the map THEN the system SHALL use appropriate zoom levels to show all supplier locations
4. IF location data is unavailable THEN the system SHALL handle missing coordinates gracefully