import React, { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#fee2e2', color: '#991b1b', minHeight: '100vh' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Application Runtime Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171' }}>
            {this.state.error?.toString()}
          </pre>
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Stack Trace:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171' }}>
            {this.state.error?.stack}
          </pre>
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Component Stack:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>
  );
}
