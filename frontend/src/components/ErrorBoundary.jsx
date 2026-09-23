import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F7F9FB] px-4">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6 text-red-500">
              <AlertTriangle size={64} className="opacity-80" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h2>
            <p className="text-gray-500 mb-8 text-sm">
              We encountered an unexpected error while loading this component. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              <RefreshCcw size={18} />
              <span>Refresh Page</span>
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 text-left bg-red-50 p-4 rounded-xl border border-red-100 overflow-x-auto">
                <p className="text-xs font-mono text-red-800 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
