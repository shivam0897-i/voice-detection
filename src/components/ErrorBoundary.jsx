import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground"
        >
          <div className="relative max-w-[500px] overflow-hidden rounded-xl border border-danger-500/15 bg-card p-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-danger-400/40 to-transparent" />

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-500/[0.08] border border-danger-500/10">
              <AlertTriangle size={28} className="text-danger-400" aria-hidden="true" />
            </div>

            <h1 className="mb-3 font-heading text-xl font-bold text-foreground">
              Something went wrong
            </h1>

            <p className="mb-6 text-[13px] leading-relaxed text-muted-foreground/70">
              An unexpected error occurred. Your data has been preserved.
            </p>

            {this.state.error && (
              <div className="mb-6 overflow-auto rounded-xl border border-border/60 bg-muted/60 p-4 text-left font-mono text-[11px] max-h-[100px]">
                <span className="text-muted-foreground/30">// error </span>
                <span className="text-danger-400/80">{this.state.error.toString()}</span>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-brand-400 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
