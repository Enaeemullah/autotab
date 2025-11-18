import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
          <div className="max-w-md rounded-lg border border-rose-500/50 bg-slate-900 p-6 text-slate-100">
            <h2 className="mb-4 text-xl font-semibold text-rose-400">Something went wrong</h2>
            <p className="mb-2 text-sm text-slate-300">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-slate-400">Error details</summary>
              <pre className="mt-2 overflow-auto rounded bg-slate-800 p-2 text-xs text-slate-300">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

