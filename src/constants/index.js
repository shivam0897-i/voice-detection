/**
 * Application Constants
 * Centralized configuration for magic numbers and settings.
 *
 * Deploy-time overrides:  set the corresponding VITE_* env var in .env.local.
 * Example:  VITE_API_TIMEOUT_MS=60000
 */

/** Parse an env var as a positive integer, or return the fallback. */
function envInt(name, fallback) {
  const raw = import.meta.env[name];
  if (raw == null || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

// === Visualization Settings ===
export const VIZ_INTERVAL_MS = 200;
export const VIZ_BAR_COUNT = 30;
export const WAVEFORM_BARS = 50;

// === File Handling ===
export const MAX_FILE_SIZE_MB = envInt('VITE_MAX_FILE_SIZE_MB', 10);
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const SUPPORTED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'mp4', 'webm'];

// === History ===
export const HISTORY_LIMIT = 10;

// === Mic Recording ===
export const MIC_CHUNK_DURATION_MS = envInt('VITE_MIC_CHUNK_DURATION_MS', 3000);

// === API ===
export const API_TIMEOUT_MS = envInt('VITE_API_TIMEOUT_MS', 30000);

// === Realtime Session ===
// M11 fix: unified to 3.0s to match MIC_CHUNK_DURATION_MS (was 2.4)
export const REALTIME_CHUNK_DURATION_SEC = (() => {
  const raw = import.meta.env.VITE_REALTIME_CHUNK_DURATION_SEC;
  if (raw == null || raw === '') return 3.0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3.0;
})();
export const REALTIME_STREAM_INTERVAL_MS = envInt('VITE_REALTIME_STREAM_INTERVAL_MS', 900);
export const REALTIME_TIMELINE_LIMIT = envInt('VITE_REALTIME_TIMELINE_LIMIT', 40);
export const REALTIME_ALERTS_LIMIT = envInt('VITE_REALTIME_ALERTS_LIMIT', 20);

// === Toast Notifications ===
export const TOAST_DURATION_MS = 4000;
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
