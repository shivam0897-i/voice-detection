/**
 * Application Constants
 * Centralized configuration for magic numbers and settings
 */

// === Visualization Settings ===
export const VIZ_INTERVAL_MS = 200;
export const VIZ_BAR_COUNT = 30;
export const WAVEFORM_BARS = 50;

// === File Handling ===
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const SUPPORTED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'mp4'];

// === History ===
export const HISTORY_LIMIT = 10;

// === API ===
export const API_TIMEOUT_MS = 30000;


// === Realtime Session ===
export const REALTIME_CHUNK_DURATION_SEC = 2.4;
export const REALTIME_STREAM_INTERVAL_MS = 900;
export const REALTIME_TIMELINE_LIMIT = 40;
export const REALTIME_ALERTS_LIMIT = 20;

// === Toast Notifications ===
export const TOAST_DURATION_MS = 4000;
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};


