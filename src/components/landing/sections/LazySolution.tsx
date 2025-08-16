'use client';

import dynamic from 'next/dynamic';
import { LandingErrorBoundary } from '../ui/LandingErrorBoundary';

// Lazy load the Solution component with no SSR to reduce initial bundle
const Solution = dynamic(() => import('./Solution'), {
  ssr: false,
  loading: () => (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="text-center mb-12 sm:mb-16 px-4">
            <div className="h-12 bg-slate-200 rounded-md w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-slate-200 rounded-md w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 h-full flex flex-col items-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-slate-200 rounded-full mb-4 sm:mb-6"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-16 mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-3 sm:mb-4"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-slate-200 rounded-md"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  ),
});

export default function LazySolution() {
  return (
    <LandingErrorBoundary sectionName="Solution Process">
      <Solution />
    </LandingErrorBoundary>
  );
}