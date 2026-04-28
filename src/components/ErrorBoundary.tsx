import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Logo from './Logo';

interface ErrorBoundaryOwnProps {
  children: ReactNode;
  fallback?: ReactNode;
}

type ErrorBoundaryProps = ErrorBoundaryOwnProps & WithTranslation;

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
          <div className="w-full max-w-2xl">
            <div className="flex flex-col items-center gap-8 rounded-[2rem] border border-red-500/20 bg-red-950/10 px-8 py-12 backdrop-blur-xl">
              <div className="flex flex-col items-center gap-6">
                <Logo size="lg" withText={false} />
                
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>

              <div className="text-center">
                <h1 className="mb-4 text-3xl font-black uppercase tracking-tight text-white">
                  {this.props.t('errorBoundary.title')}
                </h1>
                <p className="mb-6 text-base leading-relaxed text-slate-300">
                  {this.props.t('errorBoundary.description')}
                </p>

                {import.meta.env.DEV && this.state.error && (
                  <details className="mb-6 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-400 hover:text-white">
                      {this.props.t('errorBoundary.errorDetails')}
                    </summary>
                    <div className="mt-4 space-y-2">
                      <p className="font-mono text-xs text-red-400">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="max-h-48 overflow-auto rounded-lg bg-black/60 p-3 font-mono text-xs text-slate-400">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{this.props.t('errorBoundary.tryAgain')}</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{this.props.t('errorBoundary.reloadPage')}</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
                >
                  <Home className="h-4 w-4" />
                  <span>{this.props.t('errorBoundary.goHome')}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
