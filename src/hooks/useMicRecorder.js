import { useState, useRef, useCallback, useEffect } from 'react';
import { MIC_CHUNK_DURATION_MS } from '../constants';
import { blobToWavBase64 } from '../utils/realtimeAudio';

/** RMS threshold below which a chunk is considered silence and skipped (M9 fix). */
const SILENCE_RMS_THRESHOLD = 0.01;

/**
 * Custom hook for live microphone recording with auto-chunking.
 *
 * Captures audio from the user's microphone using `getUserMedia` + `MediaRecorder`,
 * records in slices of `MIC_CHUNK_DURATION_MS`, and converts each slice to a
 * WAV base64 string ready for the backend API.
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

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const onChunkRef = useRef(null);
  const audioContextRef = useRef(null);

  /** Release all browser resources (stream tracks, AudioContext, MediaRecorder). */
  const stopAllTracks = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* MediaRecorder may already be stopped */
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  /** Stop recording, clear chunk callback, and release resources. */
  const stopRecording = useCallback(() => {
    onChunkRef.current = null;
    stopAllTracks();
    setIsRecording(false);
  }, [stopAllTracks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;
      onChunkRef.current = onChunk;

      // Determine a supported mimeType
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0 && onChunkRef.current) {
          try {
            // M9 fix: check RMS to skip silence chunks
            const arrayBuffer = await event.data.arrayBuffer();
            const checkCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            try {
              const audioBuffer = await checkCtx.decodeAudioData(arrayBuffer.slice(0));
              const samples = audioBuffer.getChannelData(0);
              let sumSq = 0;
              for (let i = 0; i < samples.length; i++) sumSq += samples[i] * samples[i];
              const rms = Math.sqrt(sumSq / samples.length);
              if (rms < SILENCE_RMS_THRESHOLD) {
                // Skip silent chunk — no useful audio
                return;
              }
            } catch {
              // If decoding fails, still send the chunk (non-blocking)
            } finally {
              checkCtx.close().catch(() => {});
            }

            const base64 = await blobToWavBase64(event.data);
            if (base64 && onChunkRef.current) {
              onChunkRef.current(base64);
            }
          } catch (conversionError) {
            console.warn('Chunk conversion failed, skipping:', conversionError);
          }
        }
      };

      recorder.onerror = () => {
        setError('Recording error occurred.');
        stopRecording();
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      // Start recording with timeslice for auto-chunking
      recorder.start(MIC_CHUNK_DURATION_MS);
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

