import { useState, useRef, useCallback, useEffect } from 'react';
import { MIC_CHUNK_DURATION_MS } from '../constants';
import { pcmToWavBase64 } from '../utils/realtimeAudio';

/** RMS threshold below which a chunk is considered silence and skipped (M9 fix). */
const SILENCE_RMS_THRESHOLD = 0.01;

/**
 * Custom hook for live microphone recording with auto-chunking.
 *
 * Captures audio from the user's microphone using `getUserMedia` + Web Audio
 * ScriptProcessorNode, accumulates raw PCM samples, and converts each
 * chunk directly to a WAV base64 string ready for the backend API.
 *
 * WHY ScriptProcessorNode instead of MediaRecorder?
 *   MediaRecorder.start(timeslice) with WebM/Opus produces chunks where only
 *   the first has a valid container header. Subsequent chunks are continuation
 *   clusters that AudioContext.decodeAudioData() cannot decode, causing every
 *   chunk after the first to be silently dropped. ScriptProcessorNode gives us
 *   raw PCM samples directly, bypassing all codec issues.
 *
 * IMPORTANT: `startRecording` **throws** on any pre-recording failure
 * (insecure context, missing API, permission denied, no mic) so that callers
 * can rely on try/catch + finally for cleanup.
 *
 * @returns {{
 *   startRecording: (onChunk: (base64: string) => void) => Promise<void>,
 *   stopRecording: () => void,
 *   isRecording: boolean,
 *   error: string|null,
 * }}
 */
export default function useMicRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const onChunkRef = useRef(null);
  const pcmBufferRef = useRef([]);
  const pcmSampleCountRef = useRef(0);

  /** Release all browser resources (stream tracks, AudioContext, processor). */
  const stopAllTracks = useCallback(() => {
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch { /* ok */ }
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch { /* ok */ }
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    pcmBufferRef.current = [];
    pcmSampleCountRef.current = 0;
  }, []);

  /** Stop recording, clear chunk callback, and release resources. */
  const stopRecording = useCallback(() => {
    // Flush any remaining buffered samples before stopping
    if (onChunkRef.current && pcmSampleCountRef.current > 0 && audioContextRef.current) {
      const sampleRate = audioContextRef.current.sampleRate;
      const allSamples = new Float32Array(pcmSampleCountRef.current);
      let offset = 0;
      for (const buf of pcmBufferRef.current) {
        allSamples.set(buf, offset);
        offset += buf.length;
      }
      // Only send if not silence and long enough (>0.5s)
      if (allSamples.length > sampleRate * 0.5) {
        let sumSq = 0;
        for (let i = 0; i < allSamples.length; i += 1) sumSq += allSamples[i] * allSamples[i];
        const rms = Math.sqrt(sumSq / allSamples.length);
        if (rms >= SILENCE_RMS_THRESHOLD) {
          try {
            const base64 = pcmToWavBase64(allSamples, sampleRate);
            if (base64) onChunkRef.current(base64);
          } catch { /* non-critical */ }
        }
      }
    }
    onChunkRef.current = null;
    stopAllTracks();
    setIsRecording(false);
  }, [stopAllTracks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onChunkRef.current = null;
      stopAllTracks();
    };
  }, [stopAllTracks]);

  /**
   * Start recording from the microphone.
   * Throws on any failure (secure context, permission, etc.)
   * so callers can rely on try/catch + finally for loading state.
   *
   * @param {(base64: string) => void} onChunk - called with WAV base64 for every chunk
   */
  const startRecording = useCallback(async (onChunk) => {
    setError(null);

    // Check for HTTPS (getUserMedia requires secure context)
    if (window.isSecureContext === false) {
      const msg = 'Microphone requires HTTPS. Please use a secure connection.';
      setError(msg);
      throw new Error(msg);
    }

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Your browser does not support microphone access.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // hint — browser may use native rate
        },
      });
      streamRef.current = stream;
      onChunkRef.current = onChunk;

      // Create AudioContext — request 16kHz but accept whatever the browser gives
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const sampleRate = audioContext.sampleRate;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // ScriptProcessorNode for raw PCM capture
      // (deprecated but universally supported; AudioWorklet requires separate file)
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      const samplesPerChunk = Math.floor(sampleRate * (MIC_CHUNK_DURATION_MS / 1000));
      pcmBufferRef.current = [];
      pcmSampleCountRef.current = 0;

      processor.onaudioprocess = (e) => {
        if (!onChunkRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        pcmBufferRef.current.push(new Float32Array(inputData));
        pcmSampleCountRef.current += inputData.length;

        if (pcmSampleCountRef.current >= samplesPerChunk) {
          // Flatten accumulated buffers into one array
          const allSamples = new Float32Array(pcmSampleCountRef.current);
          let offset = 0;
          for (const buf of pcmBufferRef.current) {
            allSamples.set(buf, offset);
            offset += buf.length;
          }
          pcmBufferRef.current = [];
          pcmSampleCountRef.current = 0;

          // RMS silence check (M9 fix)
          let sumSq = 0;
          for (let i = 0; i < allSamples.length; i += 1) {
            sumSq += allSamples[i] * allSamples[i];
          }
          const rms = Math.sqrt(sumSq / allSamples.length);

          if (rms < SILENCE_RMS_THRESHOLD) {
            return; // Skip silent chunk — no useful audio
          }

          // Convert raw PCM directly to WAV base64 (no codec decode needed)
          try {
            const base64 = pcmToWavBase64(allSamples, sampleRate);
            if (base64 && onChunkRef.current) {
              onChunkRef.current(base64);
            }
          } catch (convErr) {
            console.warn('PCM→WAV conversion failed, skipping chunk:', convErr);
          }
        }
      };

      // Connect: source → processor → silent gain → destination
      // ScriptProcessorNode requires a path to destination for onaudioprocess to fire.
      // GainNode at 0 prevents mic audio from playing through speakers (feedback).
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;
      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);

      setIsRecording(true);
    } catch (err) {
      // Translate known error types to friendly messages
      let msg;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Microphone permission denied. Please allow mic access and try again.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No microphone found. Please connect a microphone.';
      } else {
        msg = `Microphone error: ${err.message || 'Unknown error'}`;
      }
      setError(msg);
      stopAllTracks();
      // Re-throw so callers (handleMicRealtimeAnalyze) can catch + cleanup
      throw new Error(msg);
    }
  }, [stopRecording, stopAllTracks]);

  return { startRecording, stopRecording, isRecording, error };
}

