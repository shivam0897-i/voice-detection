import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Siren,
  Timer,
  Radar,
  Info,
  MessageSquareText,
  AudioWaveform,
  Sparkles,
} from 'lucide-react';

const RISK_COLORS = {
  LOW: 'var(--color-success)',
  MEDIUM: 'var(--color-warning)',
  HIGH: '#fb923c',
  CRITICAL: 'var(--color-danger)',
};

const LABEL_COLORS = {
  SAFE: 'var(--color-success)',
  SPAM: 'var(--color-warning)',
  FRAUD: 'var(--color-danger)',
  UNCERTAIN: 'var(--color-info)',
};

const VOICE_LABEL_COLORS = {
  AI_GENERATED: 'var(--color-danger)',
  HUMAN: 'var(--color-success)',
  UNCERTAIN: 'var(--color-info)',
};

const SEVERITY_MAP = {
  low: { color: 'var(--color-success)', cls: 'success' },
  medium: { color: 'var(--color-warning)', cls: 'warning' },
  high: { color: '#fb923c', cls: 'warning' },
  critical: { color: 'var(--color-danger)', cls: 'danger' },
};

function getRiskColor(level) { return RISK_COLORS[level] || 'var(--color-text-muted)'; }
function getLabelColor(label) { return LABEL_COLORS[label] || 'var(--color-text-muted)'; }
function getVoiceColor(label) { return VOICE_LABEL_COLORS[label] || 'var(--color-text-muted)'; }
function getSeverity(sev) { return SEVERITY_MAP[String(sev || '').toLowerCase()] || SEVERITY_MAP.high; }

function formatTime(value) {
  if (!value) return '--';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleTimeString();
}

function asList(v) { return Array.isArray(v) ? v : []; }

/** Horizontal metric bar */
function MetricBar({ label, value, color }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="metric-card">
      <div className="metric-bar-label">
        <span>{label}</span>
        <span style={{ color }}>{v.toFixed(1)}</span>
      </div>
      <div className="metric-bar-track">
        <div className="metric-bar-fill" style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  );
}

/** Tag pill */
function Tag({ children, variant = '' }) {
  return <span className={`tag ${variant}`}>{children}</span>;
}

/** Contribution list for explainability */
function ContributionList({ contributions = [] }) {
  if (!Array.isArray(contributions) || contributions.length === 0) return null;

  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      <div className="metric-label">Signal Contributions</div>
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        {contributions.map((item) => (
          <div
            key={`${item.signal}-${item.weight}`}
            className="metric-card"
            style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3)' }}
          >
            <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              {String(item.signal || '').toUpperCase()}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
              w:{Number(item.weight || 0).toFixed(2)}
            </span>
            <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
              {Number(item.weighted_score || 0).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RealtimeSessionPanel = ({
  sessionStatus,
  sessionId,
  chunkProgress,
  latestUpdate,
  timeline,
  alerts,
  summary,
  voiceProbe,
  retentionPolicy,
  error,
}) => {
  const riskLevel = latestUpdate?.risk_level || 'LOW';
  const riskColor = getRiskColor(riskLevel);
  const callLabel = latestUpdate?.call_label || 'SAFE';
  const callLabelColor = getLabelColor(callLabel);

  const voiceClassification = latestUpdate?.voice_classification
    || summary?.final_voice_classification
    || voiceProbe?.classification
    || 'UNCERTAIN';
  const voiceConfidenceRaw = latestUpdate?.voice_confidence
    ?? summary?.final_voice_confidence
    ?? voiceProbe?.confidenceScore
    ?? 0;
  const voiceConfidence = Math.max(0, Math.min(1, Number(voiceConfidenceRaw || 0)));
  const voiceColor = getVoiceColor(voiceClassification);

  const statusLabel = String(sessionStatus || 'idle').toUpperCase();
  const statusColor =
    sessionStatus === 'streaming'
      ? 'var(--color-success)'
      : sessionStatus === 'starting' || sessionStatus === 'ending'
        ? 'var(--color-warning)'
        : sessionStatus === 'error'
          ? 'var(--color-danger)'
          : 'var(--color-text-muted)';

  const headerIcon =
    callLabel === 'FRAUD'
      ? <ShieldAlert size={20} aria-hidden="true" />
      : callLabel === 'SAFE'
        ? <ShieldCheck size={20} aria-hidden="true" />
        : <ShieldQuestion size={20} aria-hidden="true" />;

  const liveAlert = latestUpdate?.alert?.triggered
    ? { ...latestUpdate.alert, timestamp: latestUpdate.timestamp, risk_score: latestUpdate.risk_score, risk_level: latestUpdate.risk_level }
    : alerts[0] || null;

  const langAnalysis = latestUpdate?.language_analysis;
  const keywordHits = asList(langAnalysis?.keyword_hits).slice(0, 6);
  const semanticFlags = asList(langAnalysis?.semantic_flags).slice(0, 6);
  const behaviourSignals = asList(langAnalysis?.session_behaviour_signals).slice(0, 6);
  const transcript = String(langAnalysis?.transcript || '').trim();

  return (
    <div className="rt-panel" role="region" aria-label="Realtime session analysis" aria-live="polite">
      {/* ─── Header ─── */}
      <div className="rt-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: callLabelColor }}>
          {headerIcon}
          <div>
            <div className="metric-label" style={{ marginBottom: 0 }}>Call Label</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{callLabel}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div>
            <div className="metric-label" style={{ marginBottom: 2 }}>Session</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text)' }}>
              {sessionId ? String(sessionId).slice(0, 8).toUpperCase() : '--'}
            </span>
          </div>
          <div>
            <div className="metric-label" style={{ marginBottom: 2 }}>Status</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: statusColor }}>{statusLabel}</span>
          </div>
          <div>
            <div className="metric-label" style={{ marginBottom: 2 }}>Chunks</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text)' }}>
              {chunkProgress.total > 0 ? `${chunkProgress.current}/${chunkProgress.total}` : chunkProgress.current > 0 ? `${chunkProgress.current} (live)` : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="rt-panel-body">
        {/* Voice Authenticity */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div>
              <div className="metric-label">Voice Authenticity</div>
              <div className="metric-value" style={{ color: voiceColor }}>{voiceClassification}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="metric-label">Confidence</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: voiceColor }}>
                {(voiceConfidence * 100).toFixed(0)}%
              </div>
            </div>
            {summary && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                AI chunks: {summary.voice_ai_chunks ?? '--'} · Human: {summary.voice_human_chunks ?? '--'}
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mic-error" role="alert">
            <AlertTriangle size={14} aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Live Alert */}
        {liveAlert && (() => {
          const sev = getSeverity(liveAlert.severity);
          return (
            <div className="alert-item" style={{ borderColor: sev.color, background: `linear-gradient(120deg, ${sev.color}18 0%, var(--color-surface) 60%)` }}>
              <Siren size={16} aria-hidden="true" style={{ color: sev.color, marginTop: 2, flexShrink: 0 }} />
              <div className="alert-content">
                <div className="alert-title" style={{ color: sev.color }}>
                  Threat Alert {liveAlert.alert_type ? `· ${liveAlert.alert_type}` : ''}
                </div>
                <div className="alert-detail" style={{ color: 'var(--color-text)' }}>
                  {liveAlert.reason_summary || 'Suspicious escalation detected. Verify caller identity.'}
                </div>
                {liveAlert.recommended_action && (
                  <div className="alert-detail" style={{ marginTop: 'var(--space-2)', color: 'var(--color-info)' }}>
                    ▸ {liveAlert.recommended_action}
                  </div>
                )}
              </div>
              <span className="alert-time">{formatTime(liveAlert.timestamp)}</span>
            </div>
          );
        })()}

        {/* Risk Metrics Grid */}
        <div className="metric-grid">
          <MetricBar label="RISK SCORE" value={latestUpdate?.risk_score || 0} color={riskColor} />
          <MetricBar label="CPI" value={latestUpdate?.cpi || 0} color="var(--color-info)" />
          <div className="metric-card">
            <div className="metric-label">Risk Level</div>
            <div className="metric-value" style={{ color: riskColor, marginBottom: 'var(--space-2)' }}>{riskLevel}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span><Timer size={11} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />{formatTime(latestUpdate?.timestamp)}</span>
              <span><Radar size={11} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />{latestUpdate?.model_uncertain ? 'Uncertainty active' : 'Normal confidence'}</span>
            </div>
          </div>
        </div>

        {/* Risk Timeline */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <span className="metric-label" style={{ marginBottom: 0 }}>Risk Timeline</span>
            <span className="metric-label" style={{ marginBottom: 0 }}>{timeline.length} points</span>
          </div>
          {timeline.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: 'var(--space-3) 0' }}>
              Waiting for first chunk…
            </div>
          ) : (
            <div className="timeline-bar-container" style={{ height: '80px' }}>
              {timeline.map((point, i) => {
                const c = getRiskColor(point.risk_level);
                return (
                  <div
                    key={`${point.timestamp || i}-${point.chunks_processed || i}`}
                    className="timeline-bar"
                    title={`Chunk ${point.chunks_processed}: risk ${point.risk_score}, cpi ${Number(point.cpi || 0).toFixed(1)}`}
                    style={{ height: `${Math.max(8, Number(point.risk_score || 0))}%`, background: c }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Conversational Intelligence */}
        {langAnalysis && (
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <MessageSquareText size={14} aria-hidden="true" color="var(--color-data)" />
              <span className="metric-label" style={{ marginBottom: 0 }}>Conversational Intelligence</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
                ASR: {langAnalysis.asr_engine || 'n/a'}
                {langAnalysis.transcript_confidence > 0 && (
                  <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-success)' }}>
                    ({(langAnalysis.transcript_confidence * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>

            {/* Transcript */}
            <div className="transcript-text">
              {transcript || 'Transcript unavailable. Risk model evaluated acoustic + behavioral signals.'}
            </div>

            {/* LLM badge */}
            {langAnalysis.llm_semantic_used && (
              <div style={{ marginTop: 'var(--space-3)', display: 'inline-flex' }}>
                <Tag variant="info">
                  LLM {langAnalysis.llm_semantic_model || ''}
                  {langAnalysis.llm_semantic_confidence > 0 && ` (${(langAnalysis.llm_semantic_confidence * 100).toFixed(0)}%)`}
                </Tag>
              </div>
            )}

            {/* Signal scores */}
            {(langAnalysis.keyword_score > 0 || langAnalysis.semantic_score > 0 || langAnalysis.behaviour_score > 0) && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div className="metric-label">Signal Scores</div>
                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  {[
                    { label: 'Keyword', val: langAnalysis.keyword_score, color: 'var(--color-info)' },
                    { label: 'Semantic', val: langAnalysis.semantic_score, color: 'var(--color-data)' },
                    { label: 'Behaviour', val: langAnalysis.behaviour_score, color: 'var(--color-success)' },
                  ]
                    .filter((s) => s.val > 0)
                    .map((s) => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                        <span style={{ width: 64, color: 'var(--color-text-muted)' }}>{s.label}</span>
                        <div className="metric-bar-track" style={{ flex: 1, height: 4 }}>
                          <div className="metric-bar-fill" style={{ width: `${Math.min(s.val, 100)}%`, background: s.color }} />
                        </div>
                        <span style={{ width: 28, textAlign: 'right', color: s.color }}>{s.val}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {(keywordHits.length > 0 || semanticFlags.length > 0 || behaviourSignals.length > 0) && (
              <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-3)' }}>
                {keywordHits.length > 0 && (
                  <div>
                    <div className="metric-label">Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {keywordHits.map((k) => <Tag key={k}>{k}</Tag>)}
                    </div>
                    {Array.isArray(langAnalysis.keyword_categories) && langAnalysis.keyword_categories.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                        {langAnalysis.keyword_categories.map((cat) => <Tag key={cat} variant="warning">{cat}</Tag>)}
                      </div>
                    )}
                  </div>
                )}

                {semanticFlags.length > 0 && (
                  <div>
                    <div className="metric-label">Semantic Flags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {semanticFlags.map((f) => <Tag key={f} variant="info">{f}</Tag>)}
                    </div>
                  </div>
                )}

                {behaviourSignals.length > 0 && (
                  <div>
                    <div className="metric-label">Behaviour Signals</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {behaviourSignals.map((b) => <Tag key={b} variant="success">{b}</Tag>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Alerts Feed */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Siren size={14} aria-hidden="true" color="var(--color-warning)" />
            <span className="metric-label" style={{ marginBottom: 0 }}>Live Alerts</span>
          </div>
          {alerts.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              No alerts in this session.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-2)', maxHeight: 200, overflowY: 'auto' }}>
              {alerts.map((a, i) => {
                const sev = getSeverity(a.severity);
                return (
                  <div key={`${a.timestamp || i}-${a.alert_type || 'alert'}`} className="alert-item">
                    <div className="alert-severity-dot" style={{ background: sev.color }} />
                    <div className="alert-content">
                      <div className="alert-title">
                        {a.alert_type || 'ALERT'}
                        {a.severity && <Tag variant={sev.cls} style={{ marginLeft: 'var(--space-2)' }}>{a.severity}</Tag>}
                      </div>
                      {(a.risk_score != null || a.risk_level || a.call_label) && (
                        <div className="alert-detail">
                          {a.risk_score != null && `Risk: ${a.risk_score} `}
                          {a.risk_level && `· ${a.risk_level} `}
                          {a.call_label && `· ${a.call_label}`}
                        </div>
                      )}
                      <div className="alert-detail" style={{ color: 'var(--color-text-secondary)' }}>
                        {a.reason_summary || 'No details.'}
                      </div>
                      {a.recommended_action && (
                        <div className="alert-detail" style={{ color: 'var(--color-info)', marginTop: 2 }}>▸ {a.recommended_action}</div>
                      )}
                    </div>
                    <span className="alert-time">{formatTime(a.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Explainability */}
        {latestUpdate?.explainability && (
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <Activity size={14} aria-hidden="true" color="var(--color-info)" />
              <span className="metric-label" style={{ marginBottom: 0 }}>Explainability</span>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: 'var(--color-text)', margin: '0 0 var(--space-3)' }}>
              {latestUpdate.explainability.summary || 'No summary provided.'}
            </p>

            {Array.isArray(latestUpdate.explainability.top_indicators) && latestUpdate.explainability.top_indicators.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {latestUpdate.explainability.top_indicators.slice(0, 5).map((ind) => (
                  <Tag key={ind} variant="accent">{ind}</Tag>
                ))}
              </div>
            )}

            <ContributionList contributions={latestUpdate.explainability.signal_contributions} />

            {latestUpdate.explainability.uncertainty_note && (
              <div className="result-guidance" style={{ marginTop: 'var(--space-3)' }}>
                <div className="result-guidance-text">⚠ {latestUpdate.explainability.uncertainty_note}</div>
              </div>
            )}
          </div>
        )}

        {/* Audio Evidence */}
        {latestUpdate?.evidence && (
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <AudioWaveform size={14} aria-hidden="true" color="var(--color-success)" />
              <span className="metric-label" style={{ marginBottom: 0 }}>Audio Evidence</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {asList(latestUpdate.evidence.audio_patterns).slice(0, 5).map((p) => (
                <Tag key={p} variant="success">{p}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Summary + Retention */}
        {(summary || retentionPolicy) && (
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {summary && (
              <div className="summary-card">
                <div className="summary-card-title">
                  <Sparkles size={14} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 'var(--space-2)' }} />
                  Session Summary
                </div>
                <div style={{ display: 'grid', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  <div>Final: <span style={{ color: getLabelColor(summary.final_call_label) }}>{summary.final_call_label}</span></div>
                  <div>Voice: <span style={{ color: getVoiceColor(summary.final_voice_classification || 'UNCERTAIN') }}>{summary.final_voice_classification || 'UNCERTAIN'}</span> ({(Number(summary.final_voice_confidence || 0) * 100).toFixed(0)}%)</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Max AI Conf: {(Number(summary.max_voice_ai_confidence || 0) * 100).toFixed(0)}%</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Chunks: {summary.chunks_processed} · Alerts: {summary.alerts_triggered}</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Max Risk: {summary.max_risk_score} · Max CPI: {Number(summary.max_cpi || 0).toFixed(1)}</div>
                  {summary.language && <div style={{ color: 'var(--color-text-muted)' }}>Language: {summary.language}</div>}
                  {summary.llm_checks_performed > 0 && <div style={{ color: 'var(--color-data)' }}>LLM Checks: {summary.llm_checks_performed}</div>}
                </div>
              </div>
            )}

            {retentionPolicy && (
              <div className="metric-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <Info size={14} aria-hidden="true" color="var(--color-info)" />
                  <span className="metric-label" style={{ marginBottom: 0 }}>Retention Policy</span>
                </div>
                <div style={{ display: 'grid', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  <div>Raw audio: {retentionPolicy.raw_audio_storage || 'not_persisted'}</div>
                  <div>Active TTL: {retentionPolicy.active_session_retention_seconds}s</div>
                  <div>Ended TTL: {retentionPolicy.ended_session_retention_seconds}s</div>
                  {Array.isArray(retentionPolicy.stored_derived_fields) && retentionPolicy.stored_derived_fields.length > 0 && (
                    <div style={{ color: 'var(--color-text-muted)' }}>Stored: {retentionPolicy.stored_derived_fields.join(', ')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeSessionPanel;

