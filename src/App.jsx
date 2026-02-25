import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import { Download, Shield } from 'lucide-react';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ModeTabs, { MODES } from './components/ModeTabs';
import InputControls from './components/InputControls';
import ResultCard from './components/ResultCard';
import RealtimeSessionPanel from './components/RealtimeSessionPanel';
import DebugDrawer from './components/DebugDrawer';
import { useToast } from './components/Toast';
import useMicRecorder from './hooks/useMicRecorder';
import {
  detectVoice,
  startRealtimeSession,
  analyzeRealtimeChunk,
  getRealtimeSummary,
  getRealtimeAlerts,
  endRealtimeSession,
  getRetentionPolicy,
  checkHealth,
  createRealtimeWebSocket,
  isRealtimeWebSocketEnabled,
} from './services/api';
import {
  HISTORY_LIMIT,
  REALTIME_CHUNK_DURATION_SEC,
  REALTIME_STREAM_INTERVAL_MS,
  REALTIME_TIMELINE_LIMIT,
  REALTIME_ALERTS_LIMIT,
} from './constants';
import { createRealtimeChunksFromFile } from './utils/realtimeAudio';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mergeAlerts(existing, incoming) {
  const merged = [...incoming, ...existing];
  const deduped = [];
  const seen = new Set();
  for (const item of merged) {
    const key = `${item.alert_type || ''}-${item.severity || ''}-${item.call_label || ''}-${item.risk_level || ''}-${item.reason_summary || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped.slice(0, REALTIME_ALERTS_LIMIT);
}

function App() {
  const toast = useToast();
  const { startRecording, stopRecording, isRecording, error: micError } = useMicRecorder();

  // ─── Core state ───
  const [mode, setMode] = useState(MODES.REALTIME);
  const [inputSource, setInputSource] = useState('mic');
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('Auto');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [history, setHistory] = useState([]);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: 'SYSTEM_READY' },
    { time: new Date().toLocaleTimeString(), msg: 'AWAITING_INPUT' },
  ]);

  // ─── Realtime session state ───
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
  const [backendHealth, setBackendHealth] = useState(null);

  // ─── Refs ───
  const stopRequestedRef = useRef(false);
  const analyzeShortcutRef = useRef(null);
  const micSessionRef = useRef(null);
  const micStartTimeRef = useRef(null);
  const wsRef = useRef(null);
  const httpQueueRef = useRef(Promise.resolve());
  const httpInflightRef = useRef(0);
  const resultAreaRef = useRef(null);

  // ─── Derived ───
  const isRealtime = mode === MODES.REALTIME;
  const isMicMode = isRealtime && inputSource === 'mic';
  const canStartAnalysis = isMicMode ? !loading : (!!file && !loading);

  // ─── Helpers ───
  const addLog = useCallback((msg) => {
    setLogs((prev) => [...prev.slice(-6), { time: new Date().toLocaleTimeString(), msg }]);
  }, []);

  const scrollToResults = useCallback(() => {
    requestAnimationFrame(() => {
      resultAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

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

  const appendHistory = useCallback((entry) => {
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  // ─── Effects ───

  // Keyboard shortcut Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && canStartAnalysis) {
        event.preventDefault();
        const runAnalyze = analyzeShortcutRef.current;
        if (typeof runAnalyze === 'function') void runAnalyze();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canStartAnalysis]);

  // Load retention policy once
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const policy = await getRetentionPolicy();
        if (!cancelled) setRetentionPolicy(policy);
      } catch {
        if (!cancelled) setRetentionPolicy(null);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  // Health check polling
  useEffect(() => {
    const poll = async () => {
      try {
        setBackendHealth(await checkHealth());
      } catch {
        setBackendHealth({ status: 'unreachable', model_loaded: false });
      }
    };
    void poll();
    const timer = setInterval(poll, 30000);
    return () => clearInterval(timer);
  }, []);

  // ─── Handlers ───

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
    if (loading) return;
    setMode(nextMode);
    setError(null);
    setResponseTime(null);
    setResult(null);
    resetRealtimeState();
    addLog(`MODE: ${nextMode.toUpperCase()}`);
  };

  // --- Legacy analysis ---
  const handleLegacyAnalyze = async () => {
    if (!file) {
      setError('Please select an audio file first.');
      addLog('ERROR: NO_FILE');
      return;
    }
    setLoading(true);
    setError(null);
    setRealtimeError(null);
    setResponseTime(null);
    addLog('LEGACY_STARTED');
    const startTime = performance.now();
    try {
      const data = await detectVoice(file, language);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setResult(data);
      setResponseTime(elapsed);
      addLog(`LEGACY_DONE: ${data.classification} (${elapsed}s)`);
      scrollToResults();
      appendHistory({ id: Date.now(), fileName: file.name, language, mode: MODES.LEGACY, classification: data.classification, confidence: data.confidenceScore, time: new Date().toLocaleTimeString(), responseTime: elapsed });
    } catch (err) {
      const msg = err?.message || 'Analysis failed.';
      setError(msg);
      addLog(`ERROR: ${msg}`);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Finalize realtime session ---
  const finalizeRealtimeSession = useCallback(async (activeSessionId, startTime) => {
    const [summaryResult, alertsResult, endResult] = await Promise.allSettled([
      getRealtimeSummary(activeSessionId),
      getRealtimeAlerts(activeSessionId, REALTIME_ALERTS_LIMIT),
      endRealtimeSession(activeSessionId),
    ]);
    const summary = endResult.status === 'fulfilled'
      ? endResult.value
      : summaryResult.status === 'fulfilled'
        ? summaryResult.value
        : null;
    if (summary) setRealtimeSummary(summary);
    if (alertsResult.status === 'fulfilled') {
      const fetched = Array.isArray(alertsResult.value?.alerts) ? alertsResult.value.alerts : [];
      setRealtimeAlerts((prev) => mergeAlerts(prev, fetched));
    }
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    setResponseTime(elapsed);
    scrollToResults();
    if (summary) {
      appendHistory({ id: Date.now(), fileName: file?.name || 'Live Mic', language, mode: MODES.REALTIME, classification: summary.final_call_label, confidence: Number(summary.max_risk_score || 0) / 100, time: new Date().toLocaleTimeString(), responseTime: elapsed });
      addLog(`RT_DONE: ${summary.final_call_label} (${elapsed}s)`);
    } else {
      addLog(`RT_DONE: NO_SUMMARY (${elapsed}s)`);
    }
  }, [addLog, language, file, scrollToResults, appendHistory]);  // --- Realtime file analysis ---
  const handleRealtimeAnalyze = async () => {
    if (!file) {
      setRealtimeError('Please select an audio file first.');
      addLog('ERROR: NO_FILE');
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
      addLog('RT_STARTING');

      void detectVoice(file, language)
        .then((probe) => {
          setRealtimeVoiceProbe(probe);
          addLog('PROBE: ' + probe.classification + ' (' + Math.round((probe.confidenceScore || 0) * 100) + '%)');
          if (probe.classification === 'AI_GENERATED' && Number(probe.confidenceScore || 0) >= 0.75) {
            toast.warning('AI-generated voice signature detected.');
          }
          return probe;
        })
        .catch(() => null);

      const session = await startRealtimeSession(language);
      activeSessionId = session.session_id;
      setSessionId(session.session_id);
      setSessionStatus('streaming');
      addLog(`SESSION: ${String(session.session_id).slice(0, 8).toUpperCase()}`);

      const chunks = await createRealtimeChunksFromFile(file, REALTIME_CHUNK_DURATION_SEC);
      setChunkProgress({ current: 0, total: chunks.length });
      addLog(`CHUNKS: ${chunks.length} ready`);

      for (let i = 0; i < chunks.length; i += 1) {
        if (stopRequestedRef.current) break;
        const chunk = chunks[i];
        const update = await analyzeRealtimeChunk(activeSessionId, { audioFormat: chunk.audioFormat, audioBase64: chunk.audioBase64, language, source: 'file' });
        setRealtimeLatest(update);
        setChunkProgress({ current: i + 1, total: chunks.length });
        setRealtimeTimeline((prev) => [...prev, update].slice(-REALTIME_TIMELINE_LIMIT));
        if (update.alert?.triggered) {
          setRealtimeAlerts((prev) => mergeAlerts(prev, [{ timestamp: update.timestamp, risk_score: update.risk_score, risk_level: update.risk_level, call_label: update.call_label, alert_type: update.alert.alert_type, severity: update.alert.severity, reason_summary: update.alert.reason_summary, recommended_action: update.alert.recommended_action }]));
          addLog(`ALERT: ${update.alert.alert_type || 'LIVE'}`);
        } else {
          addLog(`C${i + 1}: ${update.risk_level} (${update.risk_score})`);
        }
        if (i < chunks.length - 1) await wait(REALTIME_STREAM_INTERVAL_MS);
      }

      setSessionStatus('ending');
      await finalizeRealtimeSession(activeSessionId, startTime);
      setSessionStatus('ended');
      toast.success(stopRequestedRef.current ? 'Session stopped.' : 'Session completed.');
    } catch (err) {
      const msg = err?.message || 'Realtime analysis failed.';
      setRealtimeError(msg);
      setError(msg);
      setSessionStatus('error');
      addLog(`ERROR: ${msg}`);
      toast.error(msg);
      if (activeSessionId) await endRealtimeSession(activeSessionId).catch(() => {});
    } finally {
      stopRequestedRef.current = false;
      setLoading(false);
    }
  };

  // --- Live mic realtime analysis ---
  const handleMicRealtimeAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setResponseTime(null);
    setRealtimeError(null);
    resetRealtimeState();
    stopRequestedRef.current = false;
    micStartTimeRef.current = performance.now();
    let activeSessionId = null;
    let wsFailed = false;
    let chunkIndex = 0;
    httpQueueRef.current = Promise.resolve();

    const handleChunkUpdate = (update) => {
      chunkIndex += 1;
      setRealtimeLatest(update);
      setChunkProgress((prev) => ({ current: prev.current + 1, total: 0 }));
      setRealtimeTimeline((prev) => [...prev, update].slice(-REALTIME_TIMELINE_LIMIT));
      if (update.alert?.triggered) {
        setRealtimeAlerts((prev) => mergeAlerts(prev, [{ timestamp: update.timestamp, risk_score: update.risk_score, risk_level: update.risk_level, call_label: update.call_label, alert_type: update.alert.alert_type, severity: update.alert.severity, reason_summary: update.alert.reason_summary, recommended_action: update.alert.recommended_action }]));
        addLog(`ALERT: ${update.alert.alert_type || 'LIVE'}`);
      } else {
        addLog(`MIC_${chunkIndex}: ${update.risk_level} (${update.risk_score})`);
      }
    };

    try {
      setSessionStatus('starting');
      addLog('MIC_STARTING');
      const session = await startRealtimeSession(language);
      activeSessionId = session.session_id;
      micSessionRef.current = activeSessionId;
      setSessionId(session.session_id);
      setSessionStatus('streaming');
      addLog(`SESSION: ${String(session.session_id).slice(0, 8).toUpperCase()}`);
      setChunkProgress({ current: 0, total: 0 });

      const wsEnabled = isRealtimeWebSocketEnabled();
      let wsHandle = null;
      if (wsEnabled) {
        wsHandle = createRealtimeWebSocket(activeSessionId, {
          onUpdate: handleChunkUpdate,
          onError(err) {
            if (import.meta.env.DEV) console.warn('WS error:', err);
            const m = err?.message || '';
            if (m.includes('Idle timeout') || m.includes('max duration')) {
              setRealtimeError(m);
              addLog(`WS_TIMEOUT: ${m}`);
            }
            if (wsHandle && !wsFailed) { wsFailed = true; addLog('WS_FAILED → HTTP'); }
          },
          onClose() { if (wsHandle && !wsFailed) { wsFailed = true; addLog('WS_CLOSED → HTTP'); } },
          onOpen() { addLog('WS_CONNECTED'); },
        });
        wsRef.current = wsHandle;
        try { await wsHandle.ready; } catch { wsFailed = true; addLog('WS_FAIL → HTTP'); }
      } else {
        wsFailed = true;
        addLog('WS_DISABLED → HTTP');
      }

      await startRecording((wavBase64) => {
        if (stopRequestedRef.current || !micSessionRef.current) return;
        if (wsHandle && !wsFailed) {
          wsHandle.send({ audioFormat: 'wav', audioBase64: wavBase64, language, source: 'mic' });
        } else {
          if (httpInflightRef.current >= 3) { addLog('CHUNK_SKIPPED'); return; }
          httpInflightRef.current += 1;
          httpQueueRef.current = httpQueueRef.current.then(async () => {
            if (stopRequestedRef.current || !micSessionRef.current) { httpInflightRef.current = Math.max(0, httpInflightRef.current - 1); return; }
            try {
              const update = await analyzeRealtimeChunk(micSessionRef.current, { audioFormat: 'wav', audioBase64: wavBase64, language, source: 'mic' });
              handleChunkUpdate(update);
            } catch (chunkErr) {
              if (import.meta.env.DEV) console.warn('HTTP chunk failed:', chunkErr);
              addLog(`CHUNK_ERR: ${chunkErr?.message || 'unknown'}`);
            } finally {
              httpInflightRef.current = Math.max(0, httpInflightRef.current - 1);
            }
          });
        }
      });
    } catch (err) {
      const msg = err?.message || 'Mic recording failed.';
      setRealtimeError(msg);
      setError(msg);
      setSessionStatus('error');
      addLog(`ERROR: ${msg}`);
      toast.error(msg);
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      if (activeSessionId) await endRealtimeSession(activeSessionId).catch(() => {});
      micSessionRef.current = null;
      micStartTimeRef.current = null;
      setLoading(false);
    }
  }, [language, startRecording, addLog, toast]);

  const handleStopMicRealtime = useCallback(async () => {
    const activeSessionId = micSessionRef.current;
    const sessionStartTime = micStartTimeRef.current || performance.now();
    stopRecording();
    micSessionRef.current = null;
    micStartTimeRef.current = null;
    stopRequestedRef.current = true;
    setSessionStatus('ending');
    addLog('MIC_STOP');
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    try { await httpQueueRef.current; } catch { /* logged individually */ }
    if (activeSessionId) {
      try {
        await finalizeRealtimeSession(activeSessionId, sessionStartTime);
        setSessionStatus('ended');
        toast.success('Mic session completed.');
      } catch {
        setSessionStatus('error');
        toast.error('Failed to finalize session.');
      }
    } else {
      setSessionStatus('ended');
    }
    setLoading(false);
  }, [stopRecording, addLog, toast, finalizeRealtimeSession]);

  // --- Unified analyze dispatcher ---
  async function handleAnalyze() {
    if (isRealtime) {
      if (isMicMode) await handleMicRealtimeAnalyze();
      else await handleRealtimeAnalyze();
    } else {
      await handleLegacyAnalyze();
    }
  }
  analyzeShortcutRef.current = handleAnalyze;

  const handleStopRealtime = () => {
    if (isMicMode) { void handleStopMicRealtime(); return; }
    if (!loading || sessionStatus !== 'streaming') return;
    stopRequestedRef.current = true;
    setSessionStatus('ending');
    addLog('STOP_REQUESTED');
    toast.info('Stopping after current chunk…');
  };

  // --- Export ---
  const exportPayload = () => {
    if (!isRealtime && result) return result;
    if (isRealtime && (realtimeLatest || realtimeSummary)) {
      return { mode: MODES.REALTIME, session_id: sessionId, latest: realtimeLatest, summary: realtimeSummary, alerts: realtimeAlerts, timeline: realtimeTimeline, voice_probe: realtimeVoiceProbe, retention_policy: retentionPolicy };
    }
    return null;
  };

  const handleExport = () => {
    const payload = exportPayload();
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isRealtime ? 'realtime' : 'legacy'}-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('EXPORTED');
  };

  const canExport = Boolean(exportPayload());

  // ─── Render ───
  return (
    <div className="app-root">
      <Header backendHealth={backendHealth} />
      <HeroSection />

      <main id="main-content">
        <ModeTabs mode={mode} onModeChange={handleModeChange} loading={loading} />

        <InputControls
          mode={mode}
          inputSource={inputSource}
          onInputSourceChange={setInputSource}
          file={file}
          loading={loading}
          isRecording={isRecording}
          micError={micError}
          language={language}
          onLanguageChange={setLanguage}
          onFileSelect={handleFileSelect}
          onAnalyze={() => { void handleAnalyze(); }}
          onStopRealtime={handleStopRealtime}
          onStopMic={() => { void handleStopMicRealtime(); }}
          sessionStatus={sessionStatus}
          chunkProgress={chunkProgress}
        />

        {/* Results */}
        <div ref={resultAreaRef} />
        {!isRealtime && !result && !loading && !error && (
          <div className="empty-state">
            <Shield size={40} strokeWidth={1.2} className="empty-state-icon" aria-hidden="true" />
            <p className="empty-state-title">No Analysis Yet</p>
            <p className="empty-state-text">
              Upload an audio file and click Analyze to detect AI-generated voice patterns.
            </p>
          </div>
        )}

        {!isRealtime && (result || loading || error) && (
          <ResultCard
            result={result}
            loading={loading}
            error={error}
            onRetry={() => { setError(null); setResult(null); }}
          />
        )}

        {isRealtime && sessionStatus === 'idle' && !realtimeLatest && !realtimeSummary && (
          <div className="empty-state">
            <Shield size={40} strokeWidth={1.2} className="empty-state-icon" aria-hidden="true" />
            <p className="empty-state-title">Ready to Stream</p>
            <p className="empty-state-text">
              Start a live mic session or upload a file for real-time progressive risk analysis.
            </p>
          </div>
        )}

        {isRealtime && (sessionStatus !== 'idle' || realtimeLatest || realtimeSummary) && (
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

        {/* Export */}
        {canExport && (
          <button onClick={handleExport} className="export-button" aria-label="Export analysis results as JSON">
            <Download size={14} aria-hidden="true" />
            Export Analysis JSON
          </button>
        )}

        {/* Debug + History */}
        <DebugDrawer logs={logs} responseTime={responseTime} history={history} />
      </main>

      <footer className="app-footer">
        <p>VoiceGuard &middot; AI Voice Authentication &middot; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;

