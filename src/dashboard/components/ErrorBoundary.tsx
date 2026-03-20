import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';
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
            console.error('[ErrorBoundary] Capturo un error en el renderizado del modulo:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-6">
                    <div className="w-full max-w-2xl">
                        <StateCard
                            eyebrow={this.props.fallbackEyebrow ?? 'Error de renderizado'}
                            title={this.props.fallbackTitle ?? 'No se pudo mostrar esta seccion'}
                            description={this.state.error?.message ?? 'Ocurrio un error inesperado en la interfaz. Puedes reintentar o volver al inicio.'}
                            icon={AlertOctagon}
                            tone="danger"
                            actions={
                                <button
                                    type="button"
                                    onClick={this.handleReset}
                                    className="dashboard-primary-button"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Reintentar renderizado
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