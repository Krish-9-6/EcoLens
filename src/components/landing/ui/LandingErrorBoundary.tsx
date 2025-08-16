'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class LandingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Landing page error in ${this.props.sectionName || 'section'}:`, error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Minimal error UI for landing page sections
      return (
        <section className="py-12 px-4 bg-slate-50 border-l-4 border-red-500">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {this.props.sectionName ? `${this.props.sectionName} Section Unavailable` : 'Section Unavailable'}
            </h3>
            <p className="text-slate-600 mb-4">
              This section is temporarily unavailable. The rest of the page should work normally.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Retry loading this section"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Retry
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                aria-label="Go to dashboard"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}