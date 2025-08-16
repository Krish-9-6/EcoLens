'use client';

import dynamic from 'next/dynamic';
import { LandingErrorBoundary } from '../ui/LandingErrorBoundary';

// Lazy load the Problem component with no SSR to reduce initial bundle
const Problem = dynamic(() => import('./Problem'), {
  ssr: false,
  loading: () => (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="text-center mb-12 sm:mb-16 px-4">
            <div className="h-12 bg-slate-200 rounded-md w-3/4 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="text-center px-4">
                <div className="h-20 bg-slate-200 rounded-md mb-4 w-32 mx-auto"></div>
                <div className="h-6 bg-slate-200 rounded-md w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  ),
});

export default function LazyProblem() {
  return (
    <LandingErrorBoundary sectionName="Problem Statement">
      <Problem />
    </LandingErrorBoundary>
  );
}