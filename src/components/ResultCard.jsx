import { AlertTriangle, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

const ResultCard = ({ result, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="result-card">
        <div className="result-card-loading">
          <div className="result-card-loading-text">Analyzing…</div>
          <div className="result-card-loading-bar">
            <div className="result-card-loading-bar-inner" />
          </div>
          <div className="result-card-loading-hint">Processing audio patterns</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-error" role="alert" aria-live="assertive">
        <div className="result-error-icon">
          <AlertTriangle size={40} aria-hidden="true" />
        </div>
        <div className="result-error-text">{error}</div>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            <RefreshCw size={14} aria-hidden="true" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!result) return null;

  const classification = result.classification || 'UNCERTAIN';
  const isFake = classification === 'AI_GENERATED';
  const isUncertain = classification === 'UNCERTAIN' || !!result.modelUncertain;
  const confidence = Number(result.confidenceScore || 0);
  const confidencePercent = (confidence * 100).toFixed(0);

  const variant = isFake ? 'danger' : isUncertain ? 'uncertain' : 'safe';
  const label = isFake ? 'Synthetic Detected' : isUncertain ? 'Uncertain Result' : 'Human Verified';
  const colorVar = isFake
    ? 'var(--color-danger)'
    : isUncertain
      ? 'var(--color-warning)'
      : 'var(--color-success)';

  const icon = isFake
    ? <Cpu size={26} aria-hidden="true" />
    : isUncertain
      ? <AlertTriangle size={26} aria-hidden="true" />
      : <ShieldCheck size={26} aria-hidden="true" />;

  return (
    <div
      className="result-card"
      role="region"
      aria-live="polite"
      aria-label={`Analysis result: ${label}, confidence ${confidencePercent}%`}
    >
      {/* Header row */}
      <div className="result-header">
        <div className={`result-icon ${variant}`}>{icon}</div>
        <div className="result-header-info">
          <h3 className="result-label" style={{ color: colorVar }}>{label}</h3>
          <div className="result-sublabel">{classification}</div>
        </div>
        <span className={`result-badge ${variant}`}>{confidencePercent}%</span>
      </div>

      {/* Body */}
      <div className="result-body">
        {/* Confidence bar */}
        <div className="confidence-section">
          <div className="confidence-header">
            <span className="confidence-label">Confidence</span>
            <span className="confidence-value" style={{ color: colorVar }}>{confidencePercent}%</span>
          </div>
          <div className="confidence-bar">
            <div
              className="confidence-bar-fill"
              style={{ width: `${confidencePercent}%`, background: colorVar }}
            />
          </div>
        </div>

        {/* Explanation */}
        {result.explanation && (
          <p className="result-explanation">{result.explanation}</p>
        )}

        {/* Guidance for uncertain results */}
        {(result.modelUncertain || result.recommendedAction) && (
          <div className="result-guidance">
            <div className="result-guidance-title">Model Uncertainty Guidance</div>
            <div className="result-guidance-text">
              {result.recommendedAction || 'Treat this result conservatively and verify caller identity via trusted channels.'}
            </div>
          </div>
        )}

        {/* Forensic metrics */}
        {result.forensic_metrics && (
          <div className="forensic-section">
            <div className="forensic-title">Forensic Telemetry</div>
            <div className="forensic-grid">
              {Object.entries(result.forensic_metrics).map(([key, value]) => {
                const pct = Math.min(Number(value), 100);
                const barColor = pct > 50 ? 'var(--color-accent)' : 'var(--color-text-muted)';
                return (
                  <div key={key}>
                    <div className="forensic-item-label">
                      <span>{key.replace(/_/g, ' ')}</span>
                      <span>{Number(value).toFixed(1)}</span>
                    </div>
                    <div className="forensic-bar">
                      <div className="forensic-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
