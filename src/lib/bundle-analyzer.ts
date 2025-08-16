/**
 * Bundle analysis utilities for monitoring performance
 */

// Bundle metrics interface for future use
// interface BundleMetrics {
//   totalSize: number;
//   gzippedSize: number;
//   chunkCount: number;
//   largestChunks: Array<{ name: string; size: number }>;
// }

/**
 * Analyze bundle performance in development
 */
export function analyzeBundlePerformance(): void {
  if (process.env.NODE_ENV !== 'development') return;

  // Log bundle information for development monitoring
  console.group('🔍 Bundle Performance Analysis');
  
  // Check if Framer Motion is loaded
  const hasFramerMotion = typeof window !== 'undefined' && 
    window.performance && 
    window.performance.getEntriesByType('resource').some(
      (entry) => (entry as PerformanceResourceTiming).name.includes('framer-motion')
    );

  if (hasFramerMotion) {
    console.log('✅ Framer Motion loaded');
  } else {
    console.log('⚠️ Framer Motion not detected in bundle');
  }

  // Check for code splitting effectiveness
  const scriptTags = document.querySelectorAll('script[src]');
  const chunkCount = Array.from(scriptTags).filter(
    (script) => (script as HTMLScriptElement).src.includes('_next/static/chunks/')
  ).length;

  console.log(`📦 JavaScript chunks: ${chunkCount}`);
  
  if (chunkCount > 10) {
    console.log('✅ Good code splitting detected');
  } else if (chunkCount > 5) {
    console.log('⚠️ Moderate code splitting');
  } else {
    console.log('❌ Poor code splitting - consider lazy loading more components');
  }

  console.groupEnd();
}

/**
 * Monitor Core Web Vitals for landing page performance
 */
export function monitorCoreWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    console.log('🎯 LCP:', lastEntry.startTime.toFixed(2) + 'ms');
    
    if (lastEntry.startTime > 2500) {
      console.warn('⚠️ LCP is slow (>2.5s). Consider optimizing images or reducing bundle size.');
    } else if (lastEntry.startTime > 4000) {
      console.error('❌ LCP is very slow (>4s). Immediate optimization needed.');
    } else {
      console.log('✅ LCP is good (<2.5s)');
    }
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch {
    console.log('LCP monitoring not supported in this browser');
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value: number }
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value;
      }
    }
    
    console.log('📐 CLS:', clsValue.toFixed(4));
    
    if (clsValue > 0.25) {
      console.error('❌ CLS is poor (>0.25). Check for layout shifts in animations.');
    } else if (clsValue > 0.1) {
      console.warn('⚠️ CLS needs improvement (>0.1).');
    } else {
      console.log('✅ CLS is good (<0.1)');
    }
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch {
    console.log('CLS monitoring not supported in this browser');
  }

  // First Input Delay (FID) - replaced by Interaction to Next Paint (INP)
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as PerformanceEntry & { processingStart: number }
      const fid = fidEntry.processingStart - entry.startTime;
      console.log('⚡ FID:', fid.toFixed(2) + 'ms');
      
      if (fid > 300) {
        console.error('❌ FID is poor (>300ms). Optimize JavaScript execution.');
      } else if (fid > 100) {
        console.warn('⚠️ FID needs improvement (>100ms).');
      } else {
        console.log('✅ FID is good (<100ms)');
      }
    }
  });

  try {
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch {
    console.log('FID monitoring not supported in this browser');
  }
}

/**
 * Initialize performance monitoring for landing page
 */
export function initializePerformanceMonitoring(): void {
  if (process.env.NODE_ENV === 'development') {
    // Delay to ensure page is loaded
    setTimeout(() => {
      analyzeBundlePerformance();
      monitorCoreWebVitals();
    }, 1000);
  }
}