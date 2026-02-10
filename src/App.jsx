import { useState, useEffect, useRef, useMemo } from 'react';
import './index.css';
import {
  Lock,
  Shield,
  BarChart3,
  Terminal,
  Clock,
  Download,
  Radio,
  Play,
  Square,
  CheckCircle2,
  Circle,
  Zap,
} from 'lucide-react';
import DragDropZone from './components/DragDropZone';
import LanguageSelector from './components/LanguageSelector';
import ResultCard from './components/ResultCard';
import RealtimeSessionPanel from './components/RealtimeSessionPanel';
import AudioPlayer from './components/AudioPlayer';
import { useToast } from './components/Toast';
import {
  detectVoice,
  startRealtimeSession,
  analyzeRealtimeChunk,
  getRealtimeSummary,
  getRealtimeAlerts,
  endRealtimeSession,
  getRetentionPolicy,
} from './services/api';
import {
  VIZ_INTERVAL_MS,
  VIZ_BAR_COUNT,
  HISTORY_LIMIT,
  REALTIME_CHUNK_DURATION_SEC,
  REALTIME_STREAM_INTERVAL_MS,
  REALTIME_TIMELINE_LIMIT,
  REALTIME_ALERTS_LIMIT,
} from './constants';
import { createRealtimeChunksFromFile } from './utils/realtimeAudio';

const MODES = {
  REALTIME: 'realtime',
  LEGACY: 'legacy',
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getHistoryView(item) {
  const classification = String(item.classification || 'UNKNOWN').toUpperCase();

  if (classification === 'AI_GENERATED' || classification === 'FRAUD') {
    return { color: '#ff3333', icon: '[RISK]' };
  }
  if (classification === 'UNCERTAIN') {
    return { color: '#eab308', icon: '[UNSURE]' };
  }
  if (classification === 'SPAM') {
    return { color: '#fb923c', icon: '[SPAM]' };
  }
  return { color: '#00ff00', icon: '[SAFE]' };
}

function mergeAlerts(existing, incoming) {
  const merged = [...incoming, ...existing];
  const deduped = [];
  const seen = new Set();

  for (const item of merged) {
    const key = `${item.timestamp || ''}-${item.alert_type || ''}-${item.reason_summary || ''}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(item);
  }

  return deduped.slice(0, REALTIME_ALERTS_LIMIT);
}

function App() {
  const toast = useToast();

  const [mode, setMode] = useState(MODES.REALTIME);
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('English');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [history, setHistory] = useState([]);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: 'SYSTEM_READY' },
    { time: new Date().toLocaleTimeString(), msg: 'API_CONNECTED' },
    { time: new Date().toLocaleTimeString(), msg: 'AWAITING_INPUT' },
  ]);
  const [vizData, setVizData] = useState([...Array(VIZ_BAR_COUNT)].map(() => Math.random()));

  const [sessionId, setSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('idle');
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0 });
  const [realtimeLatest, setRealtimeLatest] = useState(null);
  const [realtimeTimeline, setRealtimeTimeline] = useState([]);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const [realtimeSummary, setRealtimeSummary] = useState(null);
  const [retentionPolicy, setRetentionPolicy] = useState(null);
  const [realtimeError, setRealtimeError] = useState(null);
  const [realtimeVoiceProbe, setRealtimeVoiceProbe] = useState(null);

  const stopRequestedRef = useRef(false);
  const analyzeShortcutRef = useRef(null);

  const isRealtime = mode === MODES.REALTIME;
  const canStartAnalysis = !!file && !loading;

  const activeLabel = isRealtime
    ? realtimeLatest?.call_label || realtimeSummary?.final_call_label || 'PENDING'
    : result?.classification || 'PENDING';

  const activeRisk = realtimeLatest?.risk_level || (realtimeSummary ? 'ENDED' : 'IDLE');
  const chunkCurrent = chunkProgress.current;

  const addLog = (msg) => {
    setLogs((prev) => [...prev.slice(-6), { time: new Date().toLocaleTimeString(), msg }]);
  };

  const resetRealtimeState = () => {
    setSessionId(null);
    setSessionStatus('idle');
    setChunkProgress({ current: 0, total: 0 });
    setRealtimeLatest(null);
    setRealtimeTimeline([]);
    setRealtimeAlerts([]);
    setRealtimeSummary(null);
    setRealtimeError(null);
    setRealtimeVoiceProbe(null);
  };

  useEffect(() => {
    let interval = null;

    const startInterval = () => {
      if (interval) {
        return;
      }
      interval = setInterval(() => {
        setVizData((prev) => prev.map(() => Math.random()));
      }, VIZ_INTERVAL_MS);
    };

    const stopInterval = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
      } else if (!loading) {
        startInterval();
      }
    };

    if (!document.hidden && !loading) {
      startInterval();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && canStartAnalysis) {
        event.preventDefault();
        const runAnalyze = analyzeShortcutRef.current;
        if (typeof runAnalyze === 'function') {
          void runAnalyze();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canStartAnalysis]);

  useEffect(() => {
    let cancelled = false;

    const loadRetentionPolicy = async () => {
      try {
        const policy = await getRetentionPolicy();
        if (!cancelled) {
          setRetentionPolicy(policy);
        }
      } catch {
        if (!cancelled) {
          setRetentionPolicy(null);
        }
      }
    };

    void loadRetentionPolicy();

    return () => {
      cancelled = true;
    };
  }, []);

  const moduleStatus = useMemo(
    () => ({
      processing: loading,
      resultReady: Boolean(result) || Boolean(realtimeLatest) || Boolean(realtimeSummary),
    }),
    [loading, result, realtimeLatest, realtimeSummary],
  );

  const challengeChecklist = useMemo(() => {
    const hasRealtimeLifecycle = sessionStatus === 'streaming' || Boolean(realtimeSummary) || chunkCurrent > 0;
    const hasSignalFusion = Boolean(realtimeLatest?.evidence) && Boolean(realtimeLatest?.language_analysis);
    const hasInstantAlert = Boolean(realtimeLatest?.alert?.triggered) || realtimeAlerts.length > 0;
    const hasActionGuidance = Boolean(realtimeLatest?.alert?.recommended_action)
      || realtimeAlerts.some((item) => Boolean(item?.recommended_action));

    return [
      {
        id: 'realtime',
        title: 'Realtime fraud scoring',
        done: hasRealtimeLifecycle,
      },
      {
        id: 'fusion',
        title: 'Audio + language + behaviour signals',
        done: hasSignalFusion,
      },
      {
        id: 'alerts',
        title: 'Instant threat alerting',
        done: hasInstantAlert,
      },
      {
        id: 'actions',
        title: 'Actionable user guidance',
        done: hasActionGuidance,
      },
    ];
  }, [
    sessionStatus,
    realtimeSummary,
    chunkCurrent,
    realtimeLatest,
    realtimeAlerts,
  ]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setResponseTime(null);
    setRealtimeError(null);
    resetRealtimeState();
    addLog(`FILE_LOADED: ${selectedFile.name.toUpperCase()}`);
  };

  const handleModeChange = (nextMode) => {
    if (loading) {
      return;
    }

    setMode(nextMode);
    setError(null);
    setResponseTime(null);
    setResult(null);
    resetRealtimeState();
    addLog(`MODE_SWITCH: ${nextMode.toUpperCase()}`);
  };

  const appendHistory = (entry) => {
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT));
  };

  const handleLegacyAnalyze = async () => {
    if (!file) {
      setError('Please select an audio file first.');
      addLog('ERROR: NO_FILE_SELECTED');
      return;
    }

    setLoading(true);
    setError(null);
    setRealtimeError(null);
    setResponseTime(null);
    addLog('LEGACY_ANALYSIS_STARTED');

    const startTime = performance.now();

    try {
      const data = await detectVoice(file, language);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

      setResult(data);
      setResponseTime(elapsed);
      addLog(`LEGACY_COMPLETE: ${data.classification} (${elapsed}s)`);

      appendHistory({
        id: Date.now(),
        fileName: file.name,
        language,
        mode: MODES.LEGACY,
        classification: data.classification,
        confidence: data.confidenceScore,
        time: new Date().toLocaleTimeString(),
        responseTime: elapsed,
      });
    } catch (err) {
      const message = err?.message || 'Analysis failed. Please try again.';
      setError(message);
      addLog(`ERROR: ${message}`);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const finalizeRealtimeSession = async (activeSessionId, startTime) => {
    const [summaryResult, alertsResult, endResult] = await Promise.allSettled([
      getRealtimeSummary(activeSessionId),
      getRealtimeAlerts(activeSessionId, REALTIME_ALERTS_LIMIT),
      endRealtimeSession(activeSessionId),
    ]);

    const summary =
      endResult.status === 'fulfilled'
        ? endResult.value
        : summaryResult.status === 'fulfilled'
          ? summaryResult.value
          : null;

    if (summary) {
      setRealtimeSummary(summary);
    }

    if (alertsResult.status === 'fulfilled') {
      const fetched = Array.isArray(alertsResult.value?.alerts) ? alertsResult.value.alerts : [];
      setRealtimeAlerts((prev) => mergeAlerts(prev, fetched));
    }

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    setResponseTime(elapsed);

    if (summary) {
      appendHistory({
        id: Date.now(),
        fileName: file.name,
        language,
        mode: MODES.REALTIME,
        classification: summary.final_call_label,
        confidence: Number(summary.max_risk_score || 0) / 100,
        time: new Date().toLocaleTimeString(),
        responseTime: elapsed,
      });
      addLog(`REALTIME_COMPLETE: ${summary.final_call_label} (${elapsed}s)`);
    } else {
      addLog(`REALTIME_COMPLETE: NO_SUMMARY (${elapsed}s)`);
    }
  };

  const handleRealtimeAnalyze = async () => {
    if (!file) {
      setRealtimeError('Please select an audio file first.');
      addLog('ERROR: NO_FILE_SELECTED');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResponseTime(null);
    setRealtimeError(null);
    resetRealtimeState();
    stopRequestedRef.current = false;

    const startTime = performance.now();
    let activeSessionId = null;

    try {
      setSessionStatus('starting');
      addLog('REALTIME_SESSION_STARTING');

      void detectVoice(file, language)
        .then((probe) => {
          setRealtimeVoiceProbe(probe);
          addLog('VOICE_PROBE: ' + probe.classification + ' (' + Math.round((probe.confidenceScore || 0) * 100) + '%)');
          if (probe.classification === 'AI_GENERATED' && Number(probe.confidenceScore || 0) >= 0.75) {
            toast.warning('AI-generated voice signature detected. Treat the call as untrusted until verified.');
          }
          return probe;
        })
        .catch(() => null);

      const session = await startRealtimeSession(language);
      activeSessionId = session.session_id;
      setSessionId(session.session_id);
      setSessionStatus('streaming');
      addLog(`SESSION_ACTIVE: ${String(session.session_id).slice(0, 8).toUpperCase()}`);

      const chunks = await createRealtimeChunksFromFile(file, REALTIME_CHUNK_DURATION_SEC);
      setChunkProgress({ current: 0, total: chunks.length });
      addLog(`STREAM_READY: ${chunks.length} chunks`);

      for (let index = 0; index < chunks.length; index += 1) {
        if (stopRequestedRef.current) {
          break;
        }

        const chunk = chunks[index];
        const update = await analyzeRealtimeChunk(activeSessionId, {
          audioFormat: chunk.audioFormat,
          audioBase64: chunk.audioBase64,
          language,
        });

        setRealtimeLatest(update);
        setChunkProgress({ current: index + 1, total: chunks.length });

        setRealtimeTimeline((prev) => {
          const next = [...prev, update];
          return next.slice(-REALTIME_TIMELINE_LIMIT);
        });

        setVizData((prev) => {
          const value = Math.max(0, Math.min(1, Number(update.risk_score || 0) / 100));
          return [...prev.slice(1), value];
        });

        if (update.alert?.triggered) {
          const liveAlert = {
            timestamp: update.timestamp,
            risk_score: update.risk_score,
            risk_level: update.risk_level,
            call_label: update.call_label,
            alert_type: update.alert.alert_type,
            severity: update.alert.severity,
            reason_summary: update.alert.reason_summary,
            recommended_action: update.alert.recommended_action,
          };

          setRealtimeAlerts((prev) => mergeAlerts(prev, [liveAlert]));
          addLog(`ALERT: ${update.alert.alert_type || 'LIVE_ALERT'}`);
        } else {
          addLog(`CHUNK_${index + 1}: ${update.risk_level} (${update.risk_score})`);
        }

        if (index < chunks.length - 1) {
          await wait(REALTIME_STREAM_INTERVAL_MS);
        }
      }

      setSessionStatus('ending');
      addLog(stopRequestedRef.current ? 'STOP_REQUEST_ACCEPTED' : 'REALTIME_FINALIZING');

      await finalizeRealtimeSession(activeSessionId, startTime);

      setSessionStatus('ended');
      if (stopRequestedRef.current) {
        toast.info('Realtime session stopped and finalized.');
      } else {
        toast.success('Realtime session completed.');
      }
    } catch (err) {
      const message = err?.message || 'Realtime analysis failed. Please retry.';
      setRealtimeError(message);
      setError(message);
      setSessionStatus('error');
      addLog(`ERROR: ${message}`);
      toast.error(message);

      if (activeSessionId) {
        await endRealtimeSession(activeSessionId).catch(() => {});
      }
    } finally {
      stopRequestedRef.current = false;
      setLoading(false);
    }
  };

  async function handleAnalyze() {
    if (isRealtime) {
      await handleRealtimeAnalyze();
    } else {
      await handleLegacyAnalyze();
    }
  }

  analyzeShortcutRef.current = handleAnalyze;

  const handleStopRealtime = () => {
    if (!loading || sessionStatus !== 'streaming') {
      return;
    }

    stopRequestedRef.current = true;
    setSessionStatus('ending');
    addLog('STOP_REQUESTED_BY_USER');
    toast.info('Stopping stream after current chunk...');
  };

  const exportPayload = () => {
    if (!isRealtime && result) {
      return result;
    }

    if (isRealtime && (realtimeLatest || realtimeSummary)) {
      return {
        mode: MODES.REALTIME,
        session_id: sessionId,
        latest: realtimeLatest,
        summary: realtimeSummary,
        alerts: realtimeAlerts,
        timeline: realtimeTimeline,
        voice_probe: realtimeVoiceProbe,
        retention_policy: retentionPolicy,
      };
    }

    return null;
  };

  const canExport = Boolean(exportPayload());

  return (
    <div className="app-root">
      <header className="header-bar" role="banner">
        <div className="title-group">
          <h1>VOICEGUARD</h1>
          <p className="tagline">GUVI INDIA AI IMPACT BUILDATHON // CHALLENGE 1 // v2.1.0</p>
        </div>
        <div className="text-mono" style={{ textAlign: 'right', fontSize: '0.7rem' }}>
          <div style={{ color: 'var(--color-accent)' }}>SYSTEM_ONLINE</div>
          <div>SECURE_CONNECTION <Lock size={10} aria-hidden="true" /></div>
        </div>
      </header>

      <main id="main-content" className="bento-grid">
        <aside className="bento-panel">
          <span className="panel-label">Call Input Status</span>
          <div className="flex-between mt-20 text-mono" style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-dim)' }}>FILE:</span>
            <span style={{ color: file ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>
              {file ? 'READY' : 'NO_FILE'}
            </span>
          </div>
          <div className="flex-between mt-10 text-mono" style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-dim)' }}>SIZE:</span>
            <span style={{ color: file ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : '---'}
            </span>
          </div>
          <div className="flex-between mt-10 text-mono" style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-dim)' }}>MODE:</span>
            <span style={{ color: 'var(--color-accent)' }}>{isRealtime ? 'REALTIME' : 'LEGACY'}</span>
          </div>
          <div className="flex-between mt-10 text-mono" style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-dim)' }}>LABEL:</span>
            <span style={{ color: '#8ecae6' }}>{String(activeLabel).toUpperCase()}</span>
          </div>
          <div className="flex-between mt-10 text-mono" style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-dim)' }}>RISK:</span>
            <span style={{ color: '#f97316' }}>{String(activeRisk).toUpperCase()}</span>
          </div>

          <div style={{ marginTop: '40px' }}>
            <span className="panel-label">Active Modules</span>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div style={{ opacity: 1, transition: 'opacity 0.3s ease' }}>
                <Shield size={20} color="#22c55e" aria-hidden="true" />
              </div>

              <div
                style={{
                  opacity: moduleStatus.processing ? 1 : 0.3,
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  transform: moduleStatus.processing ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <Terminal
                  size={20}
                  color={moduleStatus.processing ? 'var(--color-accent)' : 'var(--color-text-dim)'}
                  aria-hidden="true"
                />
              </div>

              <div style={{ opacity: moduleStatus.resultReady ? 1 : 0.3, transition: 'opacity 0.3s ease' }}>
                <BarChart3 size={20} color={moduleStatus.resultReady ? '#33ccff' : 'var(--color-text-dim)'} aria-hidden="true" />
              </div>
            </div>
          </div>
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="bento-panel mission-panel">
            <div className="mission-chip">Challenge 1 Mission</div>
            <h2 className="mission-title">AI-Powered Audio Call Analyzer</h2>
            <p className="mission-subtitle">
              Detect spam and fraud calls in real time by combining audio patterns, spoken language cues, and behavior escalation,
              then alert users instantly with clear action guidance.
            </p>
            <div className="mission-grid">
              <div className="mission-card">
                <span>Current Call Label</span>
                <strong>{String(activeLabel).toUpperCase()}</strong>
              </div>
              <div className="mission-card">
                <span>Realtime Risk</span>
                <strong>{String(activeRisk).toUpperCase()}</strong>
              </div>
              <div className="mission-card">
                <span>Alert Events</span>
                <strong>{realtimeAlerts.length}</strong>
              </div>
              <div className="mission-card">
                <span>Session Chunks</span>
                <strong>{chunkProgress.current}/{chunkProgress.total || '--'}</strong>
              </div>
            </div>
          </div>

          <div className="bento-panel">
            <span className="panel-label">Analysis Mode</span>
            <div className="mode-switch">
              <button
                type="button"
                onClick={() => handleModeChange(MODES.REALTIME)}
                disabled={loading}
                className={`mode-button ${isRealtime ? 'active' : ''}`}
                aria-pressed={isRealtime}
              >
                <Radio size={14} aria-hidden="true" /> Realtime Session
              </button>
              <button
                type="button"
                onClick={() => handleModeChange(MODES.LEGACY)}
                disabled={loading}
                className={`mode-button ${!isRealtime ? 'active' : ''}`}
                aria-pressed={!isRealtime}
              >
                <Play size={14} aria-hidden="true" /> Legacy One-Shot
              </button>
            </div>
            <p className="mode-note">
              {isRealtime
                ? 'Realtime mode is the final-round demo path. It shows risk progression, CPI pressure, explainability, and live threat alerts.'
                : 'Legacy mode is kept for baseline comparison against your original challenge endpoint.'}
            </p>
          </div>

          <div className="bento-panel">
            <span className="panel-label">Select Language</span>
            <LanguageSelector selectedLine={language} onSelect={setLanguage} />
          </div>

          <div className="bento-panel" style={{ padding: '10px' }}>
            <DragDropZone onFileSelect={handleFileSelect} />
            <AudioPlayer file={file} />
          </div>

          {file && !loading && (
            <button
              onClick={() => {
                void handleAnalyze();
              }}
              aria-label={isRealtime ? 'Start realtime session analysis' : 'Analyze audio file for AI detection (Ctrl+Enter)'}
              className="analyze-button"
            >
              <Zap size={14} aria-hidden="true" /> {isRealtime ? 'Start Realtime Session' : 'Analyze Audio'}
              <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '12px' }}>Ctrl+Enter</span>
            </button>
          )}

          {loading && isRealtime && sessionStatus === 'streaming' && (
            <button
              type="button"
              className="stop-button"
              onClick={handleStopRealtime}
              aria-label="Stop realtime session after current chunk"
            >
              <Square size={14} aria-hidden="true" /> Stop Realtime Session
            </button>
          )}

          {!isRealtime && (
            <ResultCard
              result={result}
              loading={loading}
              error={error}
              responseTime={responseTime}
              onRetry={() => {
                setError(null);
                setResult(null);
              }}
            />
          )}

          {isRealtime && (
            <RealtimeSessionPanel
              sessionStatus={sessionStatus}
              sessionId={sessionId}
              chunkProgress={chunkProgress}
              latestUpdate={realtimeLatest}
              timeline={realtimeTimeline}
              alerts={realtimeAlerts}
              summary={realtimeSummary}
              voiceProbe={realtimeVoiceProbe}
              retentionPolicy={retentionPolicy}
              error={realtimeError}
            />
          )}

          {canExport && (
            <button
              onClick={() => {
                const payload = exportPayload();
                if (!payload) {
                  return;
                }

                const dataStr = JSON.stringify(payload, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `${isRealtime ? 'realtime' : 'legacy'}-analysis-${Date.now()}.json`;
                anchor.click();
                URL.revokeObjectURL(url);
                addLog('EXPORTED: RESULTS_JSON');
              }}
              aria-label="Export analysis results as JSON file"
              className="export-button"
            >
              <Download size={14} aria-hidden="true" /> Export Analysis JSON
            </button>
          )}
        </section>

        <aside className="bento-panel">
          <span className="panel-label">Live Logs</span>
          <div className="text-mono" style={{ fontSize: '0.7rem', lineHeight: '1.6', color: 'var(--color-text-dim)' }}>
            {logs.map((log, index) => (
              <div key={`${log.time}-${index}`}>[{log.time}] {log.msg}</div>
            ))}
          </div>

          {responseTime && (
            <div style={{ marginTop: '20px', padding: '12px', background: '#111', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={12} color="#ccff00" aria-hidden="true" />
                <span className="text-mono" style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>
                  Response_Time
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ccff00', fontFamily: 'var(--font-mono)' }}>
                {responseTime}s
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <span className="panel-label">Hackathon Fit Checklist</span>
            <div className="challenge-checklist">
              {challengeChecklist.map((item) => (
                <div key={item.id} className={`challenge-check-item ${item.done ? 'done' : ''}`}>
                  {item.done ? <CheckCircle2 size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <span className="panel-label">System Activity</span>
            <div
              style={{
                height: '80px',
                background: '#111',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '5px',
                gap: '1px',
              }}
            >
              {vizData.map((height, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    background: 'var(--color-accent)',
                    height: `${Math.max(2, height * 100)}%`,
                    opacity: 0.35,
                    transition: 'height 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <span className="panel-label">Analysis History</span>
            {history.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#444',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  border: '1px dashed #222',
                }}
              >
                No analyses yet
              </div>
            ) : (
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {history.map((item) => {
                  const view = getHistoryView(item);

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px',
                        marginBottom: '4px',
                        background: '#0a0a0a',
                        border: '1px solid #222',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: view.color }}>
                          {view.icon} {item.classification}
                        </span>
                        <span style={{ color: '#666' }}>{item.time}</span>
                      </div>
                      <div style={{ color: '#888', fontSize: '0.6rem', marginBottom: '4px' }}>
                        {String(item.mode || 'legacy').toUpperCase()} | {item.responseTime}s
                      </div>
                      <div
                        style={{
                          color: '#888',
                          fontSize: '0.6rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={item.fileName}
                      >
                        {item.fileName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;










