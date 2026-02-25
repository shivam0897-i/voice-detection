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
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '60px',
              border: '1px solid #ff3333',
              background: 'rgba(255, 50, 50, 0.05)',
              maxWidth: '600px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-61px', left: '-61px', width: '20px', height: '20px', borderTop: '2px solid #ff3333', borderLeft: '2px solid #ff3333' }} />
              <div style={{ position: 'absolute', bottom: '-61px', right: '-61px', width: '20px', height: '20px', borderBottom: '2px solid #ff3333', borderRight: '2px solid #ff3333' }} />
            </div>

            <AlertTriangle size={64} color="#ff3333" style={{ marginBottom: '24px' }} aria-hidden="true" />
            
            <h1 style={{ 
              fontSize: '1.8rem', 
              margin: '0 0 16px 0',
              color: '#ff3333',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              System Error
            </h1>
            
            <p style={{ 
              color: '#888', 
              fontSize: '0.9rem',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              An unexpected error occurred.
              <br />
              Your data has been preserved.
            </p>

            {this.state.error && (
              <div style={{
                background: '#111',
                border: '1px solid #333',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '0.75rem',
                color: '#ff6666',
                overflow: 'auto',
                maxHeight: '120px',
              }}>
                <div style={{ color: '#666', marginBottom: '8px' }}>// ERROR_LOG</div>
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                background: '#ccff00',
                color: '#000',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ccff00';
              }}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Reinitialize System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
