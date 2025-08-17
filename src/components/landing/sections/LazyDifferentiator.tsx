'use client';

import dynamic from 'next/dynamic';
import { LandingErrorBoundary } from '../ui/LandingErrorBoundary';

// Lazy load the Differentiator component with no SSR to reduce initial bundle
const Differentiator = dynamic(() => import('./Differentiator'), {
  ssr: false,
  loading: () => (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="text-center mb-12 sm:mb-16 px-4">
            <div className="h-12 bg-slate-200 rounded-md w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-slate-200 rounded-md w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-slate-200 rounded-full mr-3"></div>
                  <div className="h-6 bg-slate-200 rounded-md w-32"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center">
                      <div className="w-5 h-5 bg-slate-200 rounded-full mr-3"></div>
                      <div className="h-4 bg-slate-200 rounded-md flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  ),
});

export default function LazyDifferentiator() {
  return (
    <LandingErrorBoundary sectionName="Differentiator">
      <Differentiator />
    </LandingErrorBoundary>
  );
}