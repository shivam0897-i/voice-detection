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
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#fb923c',
  CRITICAL: '#ef4444',
};

const LABEL_COLORS = {
  SAFE: '#22c55e',
  SPAM: '#eab308',
  FRAUD: '#ef4444',
  UNCERTAIN: '#38bdf8',
};

const VOICE_LABEL_COLORS = {
  AI_GENERATED: '#ef4444',
  HUMAN: '#22c55e',
  UNCERTAIN: '#38bdf8',
};

const SEVERITY_COLORS = {
  low: '#84cc16',
  medium: '#eab308',
  high: '#fb923c',
  critical: '#ef4444',
};

function getRiskColor(riskLevel) {
  return RISK_COLORS[riskLevel] || '#888';
}

function getLabelColor(label) {
  return LABEL_COLORS[label] || '#888';
}

function getVoiceColor(label) {
  return VOICE_LABEL_COLORS[label] || '#888';
}

function getSeverityColor(severity) {
  if (!severity) {
    return '#f97316';
  }
  return SEVERITY_COLORS[String(severity).toLowerCase()] || '#f97316';
}

function formatTime(value) {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleTimeString();
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function MetricBar({ label, value, color }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color, fontWeight: 700 }}>
          {safeValue.toFixed(1)}
        </span>
      </div>
      <div style={{ height: '10px', background: '#111', border: '1px solid #1f1f1f' }}>
        <div
          style={{
            height: '100%',
            width: `${safeValue}%`,
            background: color,
            boxShadow: `0 0 10px ${color}66`,
            transition: 'width 0.25s ease-out',
          }}
        />
      </div>
    </div>
  );
}

function ContributionList({ contributions = [] }) {
  if (!Array.isArray(contributions) || contributions.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888', marginBottom: '8px' }}>
        SIGNAL CONTRIBUTIONS
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        {contributions.map((item) => (
          <div
            key={`${item.signal}-${item.weight}`}
            style={{
              border: '1px solid #222',
              background: '#0a0a0a',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#ddd', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              {String(item.signal || '').toUpperCase()}
            </span>
            <span style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              w:{Number(item.weight || 0).toFixed(2)}
            </span>
            <span style={{ color: '#ccff00', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
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
      ? '#22c55e'
      : sessionStatus === 'starting' || sessionStatus === 'ending'
        ? '#eab308'
        : sessionStatus === 'error'
          ? '#ef4444'
          : '#888';

  const icon =
    callLabel === 'FRAUD'
      ? <ShieldAlert size={22} aria-hidden="true" />
      : callLabel === 'SAFE'
        ? <ShieldCheck size={22} aria-hidden="true" />
        : <ShieldQuestion size={22} aria-hidden="true" />;

  const liveAlert = latestUpdate?.alert?.triggered
    ? {
      ...latestUpdate.alert,
      timestamp: latestUpdate.timestamp,
      risk_score: latestUpdate.risk_score,
      risk_level: latestUpdate.risk_level,
    }
    : alerts[0] || null;

  const severityColor = getSeverityColor(liveAlert?.severity);

  const languageAnalysis = latestUpdate?.language_analysis;
  const keywordHits = asList(languageAnalysis?.keyword_hits).slice(0, 6);
  const semanticFlags = asList(languageAnalysis?.semantic_flags).slice(0, 6);
  const behaviourSignals = asList(languageAnalysis?.session_behaviour_signals).slice(0, 6);
  const transcript = String(languageAnalysis?.transcript || '').trim();

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        background: '#030303',
        position: 'relative',
      }}
    >
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid #1f1f1f',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: callLabelColor }}>
          {icon}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>
              REALTIME CALL LABEL
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{callLabel}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888' }}>SESSION</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ddd' }}>
              {sessionId ? String(sessionId).slice(0, 8).toUpperCase() : '--'}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888' }}>STATUS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: statusColor }}>{statusLabel}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888' }}>CHUNKS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ddd' }}>
              {chunkProgress.total > 0 ? `${chunkProgress.current}/${chunkProgress.total}` : chunkProgress.current > 0 ? `${chunkProgress.current} (live)` : '0'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'grid', gap: '20px' }}>
        <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>VOICE AUTHENTICITY</div>
              <div style={{ color: voiceColor, fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700 }}>
                {voiceClassification}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>CONFIDENCE</div>
              <div style={{ color: voiceColor, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                {(voiceConfidence * 100).toFixed(0)}%
              </div>
            </div>
            {summary && (
              <div style={{ color: '#aaa', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                AI chunks: {summary.voice_ai_chunks ?? '--'} | Human chunks: {summary.voice_human_chunks ?? '--'}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              border: '1px solid #7f1d1d',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
            }}
          >
            <AlertTriangle size={14} aria-hidden="true" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        {liveAlert && (
          <div
            style={{
              border: `1px solid ${severityColor}`,
              background: `linear-gradient(120deg, ${severityColor}22 0%, #140b0b 60%, #070707 100%)`,
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Siren size={16} aria-hidden="true" color={severityColor} />
              <span style={{ color: severityColor, fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                INSTANT THREAT ALERT {liveAlert.alert_type ? `| ${liveAlert.alert_type}` : ''}
              </span>
              <span style={{ marginLeft: 'auto', color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                {formatTime(liveAlert.timestamp)}
              </span>
            </div>
            <div style={{ color: '#f5f5f5', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.5 }}>
              {liveAlert.reason_summary || 'Suspicious escalation detected. Please verify caller identity immediately.'}
            </div>
            {liveAlert.recommended_action && (
              <div
                style={{
                  marginTop: '8px',
                  borderTop: '1px dashed #613333',
                  paddingTop: '8px',
                  color: '#fecaca',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                }}
              >
                Recommended action: {liveAlert.recommended_action}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
          <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
            <MetricBar label="RISK SCORE" value={latestUpdate?.risk_score || 0} color={riskColor} />
          </div>
          <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
            <MetricBar label="CPI" value={latestUpdate?.cpi || 0} color="#38bdf8" />
          </div>
          <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>RISK LEVEL</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: riskColor }}>{riskLevel}</span>
            </div>
            <div style={{ color: '#bbb', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Timer size={12} aria-hidden="true" />
                {formatTime(latestUpdate?.timestamp)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Radar size={12} aria-hidden="true" />
                {latestUpdate?.model_uncertain ? 'UNCERTAINTY MODE ACTIVE' : 'MODEL CONFIDENCE NORMAL'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>RISK TIMELINE</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>
              {timeline.length} points
            </span>
          </div>
          {timeline.length === 0 ? (
            <div style={{ color: '#555', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '14px 0' }}>
              Waiting for first chunk result...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${timeline.length}, minmax(6px, 1fr))`, gap: '4px', alignItems: 'end', height: '84px' }}>
              {timeline.map((point, index) => {
                const color = getRiskColor(point.risk_level);
                return (
                  <div
                    key={`${point.timestamp || index}-${point.chunks_processed || index}`}
                    title={`Chunk ${point.chunks_processed}: risk ${point.risk_score}, cpi ${Number(point.cpi || 0).toFixed(1)}`}
                    style={{
                      height: `${Math.max(8, Number(point.risk_score || 0))}%`,
                      background: color,
                      boxShadow: `0 0 8px ${color}66`,
                      opacity: 0.85,
                      transition: 'height 0.2s ease-out',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {languageAnalysis && (
          <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MessageSquareText size={14} aria-hidden="true" color="#8ecae6" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>CONVERSATIONAL INTELLIGENCE</span>
              <span style={{ marginLeft: 'auto', color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                ASR: {languageAnalysis.asr_engine || 'unavailable'}
                {languageAnalysis.transcript_confidence > 0 && (
                  <span style={{ marginLeft: '8px', color: '#6ee7b7' }}>
                    ({(languageAnalysis.transcript_confidence * 100).toFixed(0)}% conf)
                  </span>
                )}
              </span>
            </div>

            <div style={{ color: '#d4d4d4', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.45 }}>
              {transcript || 'Transcript unavailable. Risk model still evaluated acoustic + behavioral signals.'}
            </div>

            {languageAnalysis.llm_semantic_used && (
              <div style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                border: '1px solid #7c3aed',
                background: 'rgba(124, 58, 237, 0.1)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                color: '#c4b5fd',
              }}>
                <span style={{ color: '#a78bfa' }}>LLM</span>
                {languageAnalysis.llm_semantic_model && <span>{languageAnalysis.llm_semantic_model}</span>}
                {languageAnalysis.llm_semantic_confidence > 0 && (
                  <span style={{ color: '#6ee7b7' }}>({(languageAnalysis.llm_semantic_confidence * 100).toFixed(0)}%)</span>
                )}
              </div>
            )}

            {(languageAnalysis.keyword_score > 0 || languageAnalysis.semantic_score > 0 || languageAnalysis.behaviour_score > 0) && (
              <div style={{ marginTop: '10px', display: 'grid', gap: '4px' }}>
                <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginBottom: '2px' }}>SIGNAL SCORES</div>
                {[{ label: 'Keyword', val: languageAnalysis.keyword_score, color: '#38bdf8' },
                { label: 'Semantic', val: languageAnalysis.semantic_score, color: '#c084fc' },
                { label: 'Behaviour', val: languageAnalysis.behaviour_score, color: '#4ade80' }]
                  .filter((s) => s.val > 0)
                  .map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                      <span style={{ color: '#888', width: '72px' }}>{s.label}</span>
                      <div style={{ flex: 1, height: '4px', background: '#222', position: 'relative' }}>
                        <div style={{ width: `${Math.min(s.val, 100)}%`, height: '100%', background: s.color, transition: 'width 0.3s ease' }} />
                      </div>
                      <span style={{ color: s.color, width: '30px', textAlign: 'right' }}>{s.val}</span>
                    </div>
                  ))
                }
              </div>
            )}

            {(keywordHits.length > 0 || semanticFlags.length > 0 || behaviourSignals.length > 0) && (
              <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                {keywordHits.length > 0 && (
                  <div>
                    <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginBottom: '6px' }}>
                      KEYWORDS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {keywordHits.map((item) => (
                        <span key={item} style={{ border: '1px solid #334155', padding: '3px 7px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: '#cbd5e1' }}>{item}</span>
                      ))}
                    </div>

                    {Array.isArray(languageAnalysis.keyword_categories) && languageAnalysis.keyword_categories.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {languageAnalysis.keyword_categories.map((cat) => (
                          <span key={cat} style={{
                            border: '1px solid #854d0e',
                            background: 'rgba(234, 179, 8, 0.08)',
                            padding: '2px 6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            color: '#fbbf24',
                            textTransform: 'uppercase',
                          }}>{cat}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {semanticFlags.length > 0 && (
                  <div>
                    <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginBottom: '6px' }}>
                      SEMANTIC FLAGS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {semanticFlags.map((item) => (
                        <span key={item} style={{ border: '1px solid #4c1d95', padding: '3px 7px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: '#ddd6fe' }}>{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                {behaviourSignals.length > 0 && (
                  <div>
                    <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginBottom: '6px' }}>
                      BEHAVIOUR SIGNALS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {behaviourSignals.map((item) => (
                        <span key={item} style={{ border: '1px solid #14532d', padding: '3px 7px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: '#bbf7d0' }}>{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
          <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Siren size={14} aria-hidden="true" color="#fb923c" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>LIVE ALERTS</span>
            </div>
            {alerts.length === 0 ? (
              <div style={{ color: '#555', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>No alerts in this session.</div>
            ) : (
              <div style={{ display: 'grid', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {alerts.map((alertItem, index) => (
                  <div
                    key={`${alertItem.timestamp || index}-${alertItem.alert_type || 'alert'}`}
                    style={{
                      border: '1px solid #2c2c2c',
                      background: '#0b0b0b',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#f97316', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                          {alertItem.alert_type || 'ALERT'}
                        </span>
                        {alertItem.severity && (
                          <span style={{
                            fontSize: '0.6rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 6px',
                            background: alertItem.severity === 'critical' ? 'rgba(239,68,68,0.2)' :
                              alertItem.severity === 'high' ? 'rgba(249,115,22,0.2)' :
                                alertItem.severity === 'medium' ? 'rgba(234,179,8,0.2)' :
                                  'rgba(100,116,139,0.2)',
                            color: alertItem.severity === 'critical' ? '#ef4444' :
                              alertItem.severity === 'high' ? '#f97316' :
                                alertItem.severity === 'medium' ? '#eab308' :
                                  '#94a3b8',
                            textTransform: 'uppercase',
                          }}>
                            {alertItem.severity}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#777', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                        {formatTime(alertItem.timestamp)}
                      </span>
                    </div>
                    {(alertItem.risk_score != null || alertItem.risk_level || alertItem.call_label) && (
                      <div style={{
                        display: 'flex', gap: '10px', marginBottom: '5px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#666',
                      }}>
                        {alertItem.risk_score != null && (
                          <span>RISK: <span style={{ color: alertItem.risk_score >= 75 ? '#ef4444' : alertItem.risk_score >= 50 ? '#f97316' : '#eab308' }}>{alertItem.risk_score}</span></span>
                        )}
                        {alertItem.risk_level && (
                          <span>LVL: <span style={{ color: '#8ecae6' }}>{alertItem.risk_level.toUpperCase()}</span></span>
                        )}
                        {alertItem.call_label && (
                          <span>LABEL: <span style={{ color: '#a78bfa' }}>{alertItem.call_label.toUpperCase()}</span></span>
                        )}
                      </div>
                    )}
                    <div style={{ color: '#bbb', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.45 }}>
                      {alertItem.reason_summary || 'No reason summary provided.'}
                    </div>
                    {alertItem.recommended_action && (
                      <div style={{
                        marginTop: '6px',
                        color: '#38bdf8',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        lineHeight: 1.4,
                        borderTop: '1px solid #1a1a1a',
                        paddingTop: '6px',
                      }}>
                        ▸ {alertItem.recommended_action}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {latestUpdate?.explainability && (
            <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Activity size={14} aria-hidden="true" color="#38bdf8" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>EXPLAINABILITY</span>
              </div>
              <div style={{ color: '#d4d4d4', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                {latestUpdate.explainability.summary || 'No summary provided.'}
              </div>

              {Array.isArray(latestUpdate.explainability.top_indicators) && latestUpdate.explainability.top_indicators.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {latestUpdate.explainability.top_indicators.slice(0, 5).map((item) => (
                    <span
                      key={item}
                      style={{
                        border: '1px solid #264653',
                        color: '#8ecae6',
                        background: '#07141a',
                        padding: '4px 8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <ContributionList contributions={latestUpdate.explainability.signal_contributions} />

              {latestUpdate.explainability.uncertainty_note && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  border: '1px solid #854d0e',
                  background: 'rgba(234, 179, 8, 0.06)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#fbbf24',
                  lineHeight: 1.4,
                }}>
                  ⚠ {latestUpdate.explainability.uncertainty_note}
                </div>
              )}
            </div>
          )}

          {latestUpdate?.evidence && (
            <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AudioWaveform size={14} aria-hidden="true" color="#84cc16" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>AUDIO EVIDENCE</span>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {asList(latestUpdate.evidence.audio_patterns).slice(0, 5).map((item) => (
                  <div key={item} style={{ border: '1px solid #273014', background: '#0b1106', padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#d9f99d' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(summary || retentionPolicy) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {summary && (
              <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={14} aria-hidden="true" color="#fbbf24" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>
                    SESSION SUMMARY
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  <div style={{ color: '#ddd' }}>
                    Final: <span style={{ color: getLabelColor(summary.final_call_label) }}>{summary.final_call_label}</span>
                  </div>
                  <div style={{ color: '#ddd' }}>
                    Voice: <span style={{ color: getVoiceColor(summary.final_voice_classification || 'UNCERTAIN') }}>{summary.final_voice_classification || 'UNCERTAIN'}</span> ({(Number(summary.final_voice_confidence || 0) * 100).toFixed(0)}%)
                  </div>
                  <div style={{ color: '#bbb' }}>Max AI Confidence: {(Number(summary.max_voice_ai_confidence || 0) * 100).toFixed(0)}%</div>
                  <div style={{ color: '#bbb' }}>Chunks: {summary.chunks_processed}</div>
                  <div style={{ color: '#bbb' }}>Alerts: {summary.alerts_triggered}</div>
                  <div style={{ color: '#bbb' }}>Max Risk: {summary.max_risk_score}</div>
                  <div style={{ color: '#bbb' }}>Max CPI: {Number(summary.max_cpi || 0).toFixed(1)}</div>
                  {summary.language && <div style={{ color: '#bbb' }}>Language: {summary.language}</div>}
                  {summary.llm_checks_performed > 0 && <div style={{ color: '#c4b5fd' }}>LLM Checks: {summary.llm_checks_performed}</div>}
                  {summary.started_at && <div style={{ color: '#666' }}>Started: {formatTime(summary.started_at)}</div>}
                  {summary.last_update && <div style={{ color: '#666' }}>Last Update: {formatTime(summary.last_update)}</div>}
                  {summary.risk_policy_version && <div style={{ color: '#555' }}>Policy: {summary.risk_policy_version}</div>}
                </div>
              </div>
            )}

            {retentionPolicy && (
              <div style={{ border: '1px solid #222', background: '#070707', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Info size={14} aria-hidden="true" color="#93c5fd" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888' }}>RETENTION POLICY</span>
                </div>
                <div style={{ display: 'grid', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#bbb' }}>
                  <div>Raw audio: {retentionPolicy.raw_audio_storage || 'not_persisted'}</div>
                  <div>Active TTL: {retentionPolicy.active_session_retention_seconds}s</div>
                  <div>Ended TTL: {retentionPolicy.ended_session_retention_seconds}s</div>
                  {Array.isArray(retentionPolicy.stored_derived_fields) && retentionPolicy.stored_derived_fields.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ color: '#666' }}>Stored fields: </span>
                      {retentionPolicy.stored_derived_fields.join(', ')}
                    </div>
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

