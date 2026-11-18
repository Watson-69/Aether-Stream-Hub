import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="alert"
        >
          <div className="max-w-md w-full bg-mantle border border-red/40 rounded-xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red/15 border border-red/40 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red" />
            </div>
            <h2 className="font-bold text-lg text-fg mb-2">Something went wrong</h2>
            <p className="text-sm text-subtext mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-subtext/70 cursor-pointer">Error details</summary>
                <pre className="mt-2 p-3 bg-crust border border-border rounded text-xs text-subtext overflow-auto max-h-40">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <button onClick={this.handleRetry} className="btn btn-primary w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
