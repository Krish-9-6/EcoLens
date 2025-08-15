/**
 * Performance monitoring utilities for DPP pages
 */

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
  imageLoadTime?: number;
}

// Track page load performance
export function trackPagePerformance(): PerformanceMetrics | null {
  if (typeof window === 'undefined') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;
  
  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
  };
}

// Track image loading performance
export function trackImageLoad(imageUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      resolve(loadTime);
    };
    
    img.onerror = () => {
      resolve(-1); // Error loading
    };
    
    img.src = imageUrl;
  });
}

// Log performance metrics (only in development)
export function logPerformanceMetrics(metrics: PerformanceMetrics, context: string) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚀 Performance Metrics - ${context}`);
    console.log(`Load Time: ${metrics.loadTime.toFixed(2)}ms`);
    console.log(`Render Time: ${metrics.renderTime.toFixed(2)}ms`);
    if (metrics.imageLoadTime) {
      console.log(`Image Load Time: ${metrics.imageLoadTime.toFixed(2)}ms`);
    }
    console.groupEnd();
  }
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('LCP:', lastEntry.startTime);
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // Track First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
      }
    });
  }).observe({ entryTypes: ['first-input'] });
  
  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('CLS:', clsValue);
    }
  }).observe({ entryTypes: ['layout-shift'] });
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  // Estimate bundle size from loaded scripts
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  let totalSize = 0;
  
  scripts.forEach(async (script) => {
    try {
      const response = await fetch((script as HTMLScriptElement).src, { method: 'HEAD' });
      const size = parseInt(response.headers.get('content-length') || '0');
      totalSize += size;
      
      console.log(`Script: ${(script as HTMLScriptElement).src.split('/').pop()} - ${(size / 1024).toFixed(2)}KB`);
    } catch (error) {
      console.warn('Could not fetch script size:', error);
    }
  });
  
  setTimeout(() => {
    console.log(`Total estimated bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
  }, 1000);
}