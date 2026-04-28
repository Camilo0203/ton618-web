import { Component, type ReactNode, type ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import StateCard from './StateCard';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackEyebrow?: string;
  fallbackTitle?: string;
  moduleLabel?: string;
  guildId?: string | null;
  onRetry?: () => void;
} & WithTranslation;

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      tags: {
        area: 'dashboard-module',
        module: this.props.moduleLabel ?? 'unknown',
      },
      extra: {
        guildId: this.props.guildId ?? null,
        componentStack: errorInfo.componentStack,
      },
    });

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] Capturo un error en el renderizado del modulo:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      const moduleMessage = this.props.moduleLabel
        ? t('dashboard.errorBoundary.moduleMessage', { module: this.props.moduleLabel })
        : t('errorBoundary.description');

      return (
        <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <StateCard
              eyebrow={this.props.fallbackEyebrow ?? t('errorBoundary.title')}
              title={this.props.fallbackTitle ?? t('dashboard.errorBoundary.title')}
              description={this.state.error?.message ?? moduleMessage}
              icon={AlertOctagon}
              tone="danger"
              actions={(
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="dashboard-primary-button"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {t('dashboard.errorBoundary.retry')}
                </button>
              )}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
