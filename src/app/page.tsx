
import Header from '<ecolens>/components/landing/Header'
import Footer from '<ecolens>/components/landing/Footer'
import Hero from '<ecolens>/components/landing/sections/Hero'
import LazyProblem from '<ecolens>/components/landing/sections/LazyProblem'
import LazySolution from '<ecolens>/components/landing/sections/LazySolution'
import LazyDifferentiator from '<ecolens>/components/landing/sections/LazyDifferentiator'
import { LandingErrorBoundary } from '<ecolens>/components/landing/ui/LandingErrorBoundary'
import { validateLandingConfig } from '<ecolens>/lib/landing-config'
import { initializePerformanceMonitoring } from '<ecolens>/lib/bundle-analyzer'

// Initialize configuration validation and performance monitoring
if (typeof window !== 'undefined') {
  validateLandingConfig()
  initializePerformanceMonitoring()
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      {/* Header - Fixed positioning handled within component */}
      <LandingErrorBoundary sectionName="Header">
        <Header />
      </LandingErrorBoundary>
      
      {/* Main Content Sections */}
      <main id="main-content" role="main" aria-label="Main content">
        <LandingErrorBoundary sectionName="Hero">
          <Hero />
        </LandingErrorBoundary>
        
        {/* Below-the-fold sections are lazy loaded */}
        <LazyProblem />
        <LazySolution />
        <LazyDifferentiator />
      </main>
      
      {/* Footer */}
      <LandingErrorBoundary sectionName="Footer">
        <Footer />
      </LandingErrorBoundary>
    </div>
  );
}
