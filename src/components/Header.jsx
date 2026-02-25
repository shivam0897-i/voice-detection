import { Shield } from 'lucide-react';

const Header = ({ backendHealth }) => {
  const statusClass = !backendHealth
    ? 'checking'
    : backendHealth.status === 'healthy'
      ? 'online'
      : backendHealth.status === 'degraded'
        ? 'degraded'
        : 'offline';

  const statusText = !backendHealth
    ? 'Checking…'
    : backendHealth.status === 'healthy'
      ? 'Online'
      : backendHealth.status === 'degraded'
        ? 'Degraded'
        : 'Unreachable';

  return (
    <header className="app-header" role="banner">
      <div className="app-logo">
        <div className="app-logo-icon" aria-hidden="true">
          <Shield size={20} />
        </div>
        <div>
          <h1>VoiceGuard</h1>
          <div className="app-logo-sub">AI Voice Authentication</div>
        </div>
      </div>

      <div className="header-status" aria-live="polite">
        <span className={`status-dot ${statusClass}`} aria-hidden="true" />
        <span style={{ color: 'var(--color-text-secondary)' }}>{statusText}</span>
        {backendHealth?.status === 'degraded' && (
          <span style={{ color: 'var(--color-warning)', fontSize: '0.62rem' }}>
            {!backendHealth.model_loaded ? '(model not loaded)' : '(store issue)'}
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
