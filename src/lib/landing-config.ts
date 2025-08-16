/**
 * Landing page configuration with graceful fallbacks
 */

export interface LandingConfig {
  demoProductId: string;
  enableAnimations: boolean;
  animationDuration: number;
  scrollThreshold: number;
}

/**
 * Get landing page configuration with fallbacks for missing values
 */
export function getLandingConfig(): LandingConfig {
  // Default demo product ID (fallback UUID)
  const DEFAULT_DEMO_PRODUCT_ID = '123e4567-e89b-12d3-a456-426614174000';
  
  // Get demo product ID from environment with validation
  let demoProductId = process.env.NEXT_PUBLIC_DEMO_PRODUCT_ID || DEFAULT_DEMO_PRODUCT_ID;
  
  // Validate UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(demoProductId)) {
    console.warn('Invalid demo product ID format, using fallback');
    demoProductId = DEFAULT_DEMO_PRODUCT_ID;
  }

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    demoProductId,
    enableAnimations: !prefersReducedMotion,
    animationDuration: prefersReducedMotion ? 0.1 : 0.6,
    scrollThreshold: 0.1,
  };
}

/**
 * Validate environment configuration and log warnings for missing values
 */
export function validateLandingConfig(): void {
  if (typeof window === 'undefined') return; // Skip on server side

  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_DEMO_PRODUCT_ID) {
    warnings.push('NEXT_PUBLIC_DEMO_PRODUCT_ID not set, using fallback demo product');
  }

  if (warnings.length > 0) {
    console.warn('Landing page configuration warnings:', warnings);
  }
}