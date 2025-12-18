import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-6 text-red-500">
                            <AlertTriangle size={32} />
                            <h1 className="text-2xl font-bold">Something went wrong</h1>
                        </div>

                        <p className="text-slate-300 mb-6">
                            The application encountered an unexpected error. Please try refreshing the page.
                        </p>

                        {this.state.error && (
                            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-red-400 overflow-auto max-h-48 mb-6 border border-red-900/20">
                                {this.state.error.toString()}
                                <br />
                                {this.state.errorInfo?.componentStack}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
