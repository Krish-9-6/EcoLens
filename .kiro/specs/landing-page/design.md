# Design Document

## Overview

The EcoLens landing page will serve as the primary marketing entry point, replacing the current placeholder homepage with a professional, animated, and conversion-focused experience. The design follows modern web standards with a bold, high-contrast aesthetic that communicates trust and sustainability while showcasing the platform's unique value proposition.

The landing page will be built using Next.js 14 App Router with TypeScript, leveraging the existing Shadcn/ui design system and introducing Framer Motion for smooth, performant animations. The design emphasizes progressive disclosure of information through scroll-triggered animations and clear visual hierarchy.

## Architecture

### Component Architecture

The landing page follows a modular, component-based architecture that separates concerns and enables maintainability:

```
src/
├── app/
│   ├── page.tsx                    # Main landing page (Server Component)
│   └── layout.tsx                  # Updated root layout
├── components/
│   └── landing/                    # Landing page specific components
│       ├── Header.tsx              # Navigation header (Client Component)
│       ├── Footer.tsx              # Site footer (Server Component)
│       ├── sections/               # Main content sections
│       │   ├── Hero.tsx           # Hero section (Client Component)
│       │   ├── Problem.tsx        # Problem statement (Client Component)
│       │   ├── Solution.tsx       # Solution process (Client Component)
│       │   └── Differentiator.tsx # USP section (Client Component)
│       └── ui/                     # Reusable animated components
│           ├── ScrollReveal.tsx    # Scroll-triggered animation wrapper
│           └── AnimatedText.tsx    # Text animation utilities
```

### Routing Integration

The landing page integrates seamlessly with the existing Next.js App Router structure:

- **Root Path (/)**: New landing page replaces current placeholder
- **Existing Routes**: All current routes (`/dashboard`, `/dpp/*`) remain unchanged
- **Navigation**: Header provides contextual navigation based on authentication state
- **Demo Integration**: "See it in Action" CTA links to configurable demo DPP

### State Management

The landing page uses minimal client-side state:

- **Header Scroll State**: Local useState for header background transition
- **Animation States**: Managed by Framer Motion's built-in state system
- **Authentication State**: Leverages existing auth context for header display logic

## Components and Interfaces

### Header Component

**Purpose**: Sticky navigation header with authentication-aware CTAs

**Interface**:
```typescript
interface HeaderProps {
  // No props needed - reads auth state from context
}
```

**Key Features**:
- Sticky positioning with z-index management
- Scroll-triggered background transition (transparent → blurred)
- Authentication-aware button display
- Responsive design with mobile considerations

**Animation Behavior**:
- Background opacity and blur transition on scroll
- Smooth color transitions for text and buttons

### Footer Component

**Purpose**: Simple site footer with branding and social links

**Interface**:
```typescript
interface FooterProps {
  // No props needed - static content
}
```

**Key Features**:
- Company branding and copyright
- Social media icon links (Twitter, LinkedIn)
- Responsive layout

### Hero Section

**Purpose**: Primary value proposition with compelling CTAs

**Interface**:
```typescript
interface HeroProps {
  demoProductId?: string; // From environment variable
}
```

**Key Features**:
- Full viewport height layout
- Cascading text animations on load
- Two primary CTAs with distinct styling
- Dark theme with subtle background pattern

**Animation Sequence**:
1. Headline fades in and slides up (delay: 0ms)
2. Sub-headline fades in and slides up (delay: 200ms)
3. CTA buttons fade in and slide up (delay: 400ms)

### Problem Section

**Purpose**: Industry statistics highlighting the need for transparency

**Interface**:
```typescript
interface ProblemProps {
  // No props needed - static content
}
```

**Key Features**:
- Centered title with impactful messaging
- Two-column statistics grid
- Large, bold numbers with descriptive text
- Scroll-triggered reveal animation

### Solution Section

**Purpose**: Three-step process explanation with visual icons

**Interface**:
```typescript
interface SolutionProps {
  // No props needed - static content
}
```

**Key Features**:
- Three-column responsive grid
- Lucide React icons for each step
- Sequential animation with staggered delays
- Clear process flow (MAP → VERIFY → REVEAL)

**Animation Sequence**:
1. MAP column animates in (delay: 0ms)
2. VERIFY column animates in (delay: 150ms)
3. REVEAL column animates in (delay: 300ms)

### Differentiator Section

**Purpose**: Pragmatic anchoring USP with comparison table

**Interface**:
```typescript
interface DifferentiatorProps {
  // No props needed - static content
}
```

**Key Features**:
- Two-column comparison layout
- Color-coded icons (red X vs green check)
- Clear pros/cons lists
- Unified scroll-triggered animation

### ScrollReveal Component

**Purpose**: Reusable scroll-triggered animation wrapper

**Interface**:
```typescript
interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
}
```

**Key Features**:
- Uses Framer Motion's useInView hook
- Configurable animation parameters
- Optimized for performance with transform/opacity only
- Respects prefers-reduced-motion settings

## Data Models

### Environment Configuration

```typescript
interface LandingPageConfig {
  NEXT_PUBLIC_DEMO_PRODUCT_ID: string; // Demo DPP UUID
}
```

### Animation Configuration

```typescript
interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
  threshold: number;
}

const defaultAnimationConfig: AnimationConfig = {
  duration: 0.6,
  delay: 0,
  easing: "easeOut",
  threshold: 0.1
};
```

## Error Handling

### Component Error Boundaries

Each major section will be wrapped in error boundaries to prevent cascading failures:

```typescript
// Reuse existing ErrorBoundary from components/ui
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
```

### Animation Fallbacks

- **Reduced Motion**: Respect `prefers-reduced-motion` media query
- **JavaScript Disabled**: Ensure content is accessible without animations
- **Performance Issues**: Graceful degradation for low-end devices

### Missing Configuration

- **Demo Product ID**: Fallback to hardcoded UUID if environment variable missing
- **Authentication Context**: Graceful handling if auth context unavailable

## Testing Strategy

### Unit Testing

**Component Testing**:
- Each section component tested in isolation
- Animation trigger testing with mocked intersection observer
- Responsive behavior testing with viewport simulation

**Test Files**:
```
src/components/landing/__tests__/
├── Header.test.tsx
├── Hero.test.tsx
├── Problem.test.tsx
├── Solution.test.tsx
├── Differentiator.test.tsx
└── ScrollReveal.test.tsx
```

### Integration Testing

**Page-Level Testing**:
- Full landing page rendering
- Navigation flow testing
- CTA button functionality
- Responsive layout verification

### Performance Testing

**Animation Performance**:
- Frame rate monitoring during animations
- Memory usage during scroll events
- Bundle size impact assessment

**Core Web Vitals**:
- Largest Contentful Paint (LCP) optimization
- Cumulative Layout Shift (CLS) prevention
- First Input Delay (FID) measurement

### Accessibility Testing

**WCAG Compliance**:
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast verification
- Focus management during animations

## Technical Implementation Details

### Framer Motion Integration

**Installation**:
```bash
npm install framer-motion
```

**Key Patterns**:
- Use `motion.div` for animated containers
- Leverage `useInView` hook for scroll triggers
- Implement `AnimatePresence` for conditional animations
- Optimize with `transform` and `opacity` only

### Tailwind CSS Patterns

**Color Scheme**:
- Primary: `slate-900` (dark backgrounds)
- Secondary: `slate-300` (muted text)
- Accent: `green-500` (sustainability theme)
- Interactive: `blue-600` (CTAs and links)

**Typography Scale**:
- Headlines: `text-4xl md:text-6xl font-extrabold`
- Sub-headlines: `text-xl md:text-2xl font-semibold`
- Body: `text-base md:text-lg`
- Captions: `text-sm text-slate-500`

### Performance Optimizations

**Code Splitting**:
- Framer Motion loaded only for animated components
- Lazy loading for below-the-fold sections
- Dynamic imports for heavy dependencies

**Image Optimization**:
- Next.js Image component for hero backgrounds
- WebP format with fallbacks
- Responsive image sizing

**Bundle Optimization**:
- Tree-shaking for unused Framer Motion features
- Selective Lucide icon imports
- CSS purging for unused Tailwind classes

### SEO and Metadata

**Meta Tags**:
```typescript
export const metadata: Metadata = {
  title: "EcoLens - Trust Engine for Fashion Supply Chains",
  description: "Transform fashion supply chains with blockchain-verified transparency. Map, verify, and reveal your product stories with EcoLens.",
  keywords: "fashion, supply chain, blockchain, transparency, sustainability",
  openGraph: {
    title: "EcoLens - From Black Box to Crystal Clear",
    description: "The trust engine for the new era of fashion",
    type: "website",
  }
};
```

**Structured Data**:
- Organization schema markup
- Product schema for demo DPPs
- BreadcrumbList for navigation

### Security Considerations

**Content Security Policy**:
- Restrict inline styles (Framer Motion uses CSS-in-JS)
- Allow necessary external resources
- Prevent XSS through proper sanitization

**Environment Variables**:
- Validate demo product ID format
- Secure handling of configuration values
- Runtime environment detection

## Design System Integration

### Shadcn/ui Components

**Reused Components**:
- `Button` for CTAs and navigation
- `Card` for feature highlights (if needed)
- Existing color tokens and spacing scale

**Custom Extensions**:
- Landing-specific button variants
- Extended color palette for marketing needs
- Custom animation utilities

### Typography System

**Font Stack**:
- Primary: Geist Sans (existing)
- Monospace: Geist Mono (for technical content)
- Fallbacks: System fonts for performance

**Responsive Typography**:
- Fluid scaling between breakpoints
- Optimal line heights for readability
- Consistent vertical rhythm

## Deployment Considerations

### Build Optimization

**Static Generation**:
- Landing page pre-rendered at build time
- Optimal performance for marketing content
- CDN-friendly static assets

**Bundle Analysis**:
- Monitor Framer Motion impact on bundle size
- Optimize critical rendering path
- Implement proper code splitting

### Environment Configuration

**Development**:
```env
NEXT_PUBLIC_DEMO_PRODUCT_ID=123e4567-e89b-12d3-a456-426614174000
```

**Production**:
- Validate environment variables at build time
- Implement fallback values for missing config
- Monitor configuration drift

This design provides a comprehensive foundation for implementing a professional, performant, and maintainable landing page that effectively communicates EcoLens's value proposition while integrating seamlessly with the existing application architecture.