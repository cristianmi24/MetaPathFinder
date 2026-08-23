import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Fallo al renderizar la aplicación:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white mb-6">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-2xl font-bold text-on-background mb-2">Algo salió mal</h1>
          <p className="text-sm text-on-surface-variant max-w-md mb-2">
            La aplicación tuvo un problema al cargar esta pantalla. Puede deberse a una pérdida de conexión con el servidor.
          </p>
          {this.state.message && (
            <p className="text-xs text-on-surface-variant/70 font-mono max-w-md mb-8 break-words">{this.state.message}</p>
          )}
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RotateCw size={16} /> Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
