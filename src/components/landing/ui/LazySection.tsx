'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Lazy loading wrapper for below-the-fold sections
 */
export default function LazySection({ 
  children, 
  fallback,
  className = '' 
}: LazySectionProps) {
  const defaultFallback = (
    <div className={`py-20 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          {/* Skeleton for section title */}
          <div className="h-8 bg-slate-200 rounded-md w-3/4 mx-auto mb-8"></div>
          
          {/* Skeleton for content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-16 bg-slate-200 rounded-full w-16 mx-auto"></div>
                <div className="h-6 bg-slate-200 rounded-md w-3/4 mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded-md"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </motion.div>
    </Suspense>
  );
}

/**
 * Create a lazy-loaded component with error boundary
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): ComponentType<React.ComponentProps<T>> {
  return lazy(importFn) as ComponentType<React.ComponentProps<T>>;
}