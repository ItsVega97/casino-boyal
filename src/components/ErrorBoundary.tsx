import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-red-950 to-black border-4 border-red-600 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center gap-4 mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <h1 className="text-4xl font-black text-red-500">ERROR CRÍTICO</h1>
            </div>

            <div className="bg-black/50 border-2 border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-bold mb-2">Se ha producido un error:</p>
              <pre className="text-red-300 text-sm whitespace-pre-wrap break-words">
                {this.state.error?.message || 'Error desconocido'}
              </pre>
            </div>

            {import.meta.env.DEV && this.state.errorInfo && (
              <div className="bg-black/50 border-2 border-red-800 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
                <p className="text-red-400 font-bold mb-2">Stack trace (DEV):</p>
                <pre className="text-red-300 text-xs whitespace-pre-wrap break-words font-mono">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-black font-black text-xl rounded-lg transition-all active:scale-95 border-4 border-yellow-900 shadow-lg"
              >
                VOLVER AL MENÚ
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-lg transition-all active:scale-95 border-2 border-gray-900"
              >
                RECARGAR PÁGINA
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
