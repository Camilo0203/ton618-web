import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import StateCard from './StateCard';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackEyebrow?: string;
    fallbackTitle?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error('[dashboard-error-boundary] Modulo fallo al renderizar:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex w-full items-center justify-center p-6">
                    <div className="w-full max-w-2xl">
                        <StateCard
                            eyebrow={this.props.fallbackEyebrow ?? 'Error del sistema'}
                            title={this.props.fallbackTitle ?? 'No se pudo cargar este modulo'}
                            description={this.state.error?.message ?? 'Ocurrio un error inesperado al mostrar la interfaz.'}
                            icon={AlertTriangle}
                            tone="danger"
                            actions={
                                <button
                                    type="button"
                                    onClick={() => this.setState({ hasError: false, error: null })}
                                    className="dashboard-primary-button"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Reintentar modulo
                                </button>
                            }
                        />
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}