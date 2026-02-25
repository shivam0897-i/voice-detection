import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, History } from 'lucide-react';

function getHistoryView(item) {
  const c = String(item.classification || 'UNKNOWN').toUpperCase();
  if (c === 'AI_GENERATED' || c === 'FRAUD') return { color: 'var(--color-danger)', label: 'RISK' };
  if (c === 'UNCERTAIN') return { color: 'var(--color-warning)', label: 'UNSURE' };
  if (c === 'SPAM') return { color: 'var(--color-warning)', label: 'SPAM' };
  return { color: 'var(--color-success)', label: 'SAFE' };
}

const DebugDrawer = ({ logs, responseTime, history }) => {
  const [open, setOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);

  return (
    <div>
      {/* History section */}
      <div className="history-section">
        <button
          className="history-toggle"
          onClick={() => setHistOpen((p) => !p)}
          aria-expanded={histOpen}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <History size={14} aria-hidden="true" />
            Analysis History ({history.length})
          </span>
          {histOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {histOpen && (
          <div className="history-list">
            {history.length === 0 ? (
              <div style={{
                padding: 'var(--space-5)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
              }}>
                No analyses yet
              </div>
            ) : (
              history.map((item) => {
                const view = getHistoryView(item);
                return (
                  <div key={item.id} className="history-item">
                    <span
                      className="history-item-classification"
                      style={{ color: view.color }}
                    >
                      {view.label}
                    </span>
                    <span className="history-item-meta" title={item.fileName}>
                      {String(item.mode || 'legacy').toUpperCase()} · {item.responseTime}s · {item.fileName}
                    </span>
                    <span className="history-item-time">{item.time}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Debug toggle */}
      <button
        className="debug-toggle"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        {open ? 'Hide' : 'Show'} Debug Info
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="debug-panel">
          <span className="card-label">Live Logs</span>
          <div className="debug-log-list">
            {logs.map((log, index) => (
              <div key={`${log.time}-${index}`}>[{log.time}] {log.msg}</div>
            ))}
          </div>

          {responseTime && (
            <div className="debug-response-time">
              <div className="debug-rt-value">{responseTime}s</div>
              <div className="debug-rt-label">
                <Clock size={10} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Response Time
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugDrawer;
