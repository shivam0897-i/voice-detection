import { Mic, FileAudio, MicOff, Zap, Square } from 'lucide-react';
import DragDropZone from './DragDropZone';
import AudioPlayer from './AudioPlayer';
import LanguageSelector from './LanguageSelector';

const InputControls = ({
  mode,
  inputSource,
  onInputSourceChange,
  file,
  loading,
  isRecording,
  micError,
  language,
  onLanguageChange,
  onFileSelect,
  onAnalyze,
  onStopRealtime,
  onStopMic,
  sessionStatus,
  chunkProgress,
}) => {
  const isRealtime = mode === 'realtime';
  const isMicMode = isRealtime && inputSource === 'mic';

  return (
    <div id="panel-main" role="tabpanel" aria-labelledby={isRealtime ? 'tab-realtime' : 'tab-legacy'}>
      {/* Language selector */}
      <div className="card">
        <LanguageSelector selectedLine={language} onSelect={onLanguageChange} />
      </div>

      {/* Input source toggle (realtime only) */}
      {isRealtime && (
        <div className="card">
          <span className="card-label">Input Source</span>
          <div className="input-toggle">
            <button
              type="button"
              onClick={() => onInputSourceChange('mic')}
              disabled={loading}
              className={`input-toggle-btn ${inputSource === 'mic' ? 'active' : ''}`}
              aria-pressed={inputSource === 'mic'}
            >
              <Mic size={15} aria-hidden="true" />
              Microphone
            </button>
            <button
              type="button"
              onClick={() => onInputSourceChange('file')}
              disabled={loading}
              className={`input-toggle-btn ${inputSource === 'file' ? 'active' : ''}`}
              aria-pressed={inputSource === 'file'}
            >
              <FileAudio size={15} aria-hidden="true" />
              File Upload
            </button>
          </div>
        </div>
      )}

      {/* Mic controls */}
      {isMicMode && (
        <div className="card mic-controls">
          {micError && (
            <div className="mic-error" role="alert">
              <MicOff size={14} aria-hidden="true" />
              {micError}
            </div>
          )}

          {!isRecording && !loading && (
            <button
              onClick={onAnalyze}
              aria-label="Start live mic recording and analysis"
              className="analyze-button"
            >
              <Mic size={15} aria-hidden="true" />
              Start Live Analysis
            </button>
          )}

          {isRecording && (
            <>
              <div className="mic-recording-indicator" aria-live="polite">
                <span className="mic-pulse" />
                Recording — {chunkProgress.current} chunks sent
              </div>
              <button
                type="button"
                className="stop-button"
                onClick={onStopMic}
                aria-label="Stop mic recording and finalize session"
              >
                <Square size={15} aria-hidden="true" />
                Stop Recording
              </button>
            </>
          )}
        </div>
      )}

      {/* File upload */}
      {!isMicMode && (
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <DragDropZone onFileSelect={onFileSelect} />
          <AudioPlayer file={file} />
        </div>
      )}

      {/* Analyze / Stop buttons */}
      {!isMicMode && file && !loading && (
        <button
          onClick={onAnalyze}
          aria-label={isRealtime ? 'Start realtime session analysis' : 'Analyze audio file (Ctrl+Enter)'}
          className="analyze-button"
        >
          <Zap size={15} aria-hidden="true" />
          {isRealtime ? 'Start Realtime Session' : 'Analyze Audio'}
          <span className="shortcut-hint">Ctrl+Enter</span>
        </button>
      )}

      {loading && isRealtime && !isMicMode && sessionStatus === 'streaming' && (
        <button
          type="button"
          className="stop-button"
          onClick={onStopRealtime}
          aria-label="Stop realtime session after current chunk"
        >
          <Square size={15} aria-hidden="true" />
          Stop Session
        </button>
      )}
    </div>
  );
};

export default InputControls;
