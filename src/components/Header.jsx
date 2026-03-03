import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Header = memo(function Header({ backendHealth }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`app-header ${scrolled ? 'app-header--scrolled' : ''}`} role="banner">
      <div className="app-header__inner">
        <div className="app-header__left">
          <Link to="/" className="app-header__back" aria-label="Back to home">
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>

          <div className="app-logo">
            <div className="app-logo-icon" aria-hidden="true">
              <Shield size={20} />
            </div>
            <div>
              <h1>VoiceGuard</h1>
              <div className="app-logo-sub">AI Voice Authentication</div>
            </div>
          </div>
        </div>

        <div className="header-status" aria-live="polite">
          <span className={`status-dot ${statusClass}`} aria-hidden="true" />
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{statusText}</span>
          {backendHealth?.status === 'degraded' && (
            <span style={{ color: 'var(--color-warning)', fontSize: '0.62rem' }}>
              {!backendHealth.model_loaded ? '(model not loaded)' : '(store issue)'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
