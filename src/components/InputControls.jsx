import { Mic, FileAudio, MicOff, Zap, Square } from 'lucide-react';
import DragDropZone from './DragDropZone';
import AudioPlayer from './AudioPlayer';
import LanguageSelector from './LanguageSelector';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

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
            <Button
              variant={inputSource === 'mic' ? 'primary' : 'ghost'}
              size="md"
              onClick={() => onInputSourceChange('mic')}
              disabled={loading}
              aria-pressed={inputSource === 'mic'}
              className="flex-1"
            >
              <Mic size={15} aria-hidden="true" />
              Microphone
            </Button>
            <Button
              variant={inputSource === 'file' ? 'primary' : 'ghost'}
              size="md"
              onClick={() => onInputSourceChange('file')}
              disabled={loading}
              aria-pressed={inputSource === 'file'}
              className="flex-1"
            >
              <FileAudio size={15} aria-hidden="true" />
              File Upload
            </Button>
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
            <Button
              variant="primary"
              size="lg"
              onClick={onAnalyze}
              aria-label="Start live mic recording and analysis"
              className="w-full"
            >
              <Mic size={15} aria-hidden="true" />
              Start Live Analysis
            </Button>
          )}

          {isRecording && (
            <>
              <div className="mic-recording-indicator" aria-live="polite">
                <span className="mic-pulse" />
                Recording — {chunkProgress.current} chunks sent
              </div>
              <Button
                variant="danger"
                size="lg"
                onClick={onStopMic}
                aria-label="Stop mic recording and finalize session"
                className="w-full"
              >
                <Square size={15} aria-hidden="true" />
                Stop Recording
              </Button>
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
        <Button
          variant="primary"
          size="lg"
          onClick={onAnalyze}
          aria-label={isRealtime ? 'Start realtime session analysis' : 'Analyze audio file (Ctrl+Enter)'}
          className="w-full"
        >
          <Zap size={15} aria-hidden="true" />
          {isRealtime ? 'Start Realtime Session' : 'Analyze Audio'}
          <span className="text-xs opacity-60 ml-2">Ctrl+Enter</span>
        </Button>
      )}

      {loading && isRealtime && !isMicMode && sessionStatus === 'streaming' && (
        <Button
          variant="danger"
          size="lg"
          onClick={onStopRealtime}
          aria-label="Stop realtime session after current chunk"
          className="w-full"
        >
          <Square size={15} aria-hidden="true" />
          Stop Session
        </Button>
      )}
    </div>
  );
};

export default InputControls;
