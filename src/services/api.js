/**
 * Voice Detection API Service
 * Handles communication with the AI Voice Detection backend.
 */

import { API_TIMEOUT_MS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

const DEFAULT_BACKEND_BASE_URL = 'https://shivam-2211-voice-detection-api.hf.space';
const LEGACY_ENDPOINT_PATH = '/api/voice-detection';
const PROXY_BASE_PATH = '/api/backend';

const API_CONFIG = {
  DIRECT_BASE_URL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND_BASE_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
  FORCE_PROXY: String(import.meta.env.VITE_USE_SERVER_PROXY || '').toLowerCase() === 'true',
};

function normalizeUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function normalizePath(path) {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

function shouldUseServerProxy() {
  return API_CONFIG.FORCE_PROXY || !API_CONFIG.API_KEY;
}

function buildEndpointUrl(path) {
  const normalizedPath = normalizePath(path);

  if (shouldUseServerProxy()) {
    const proxyPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
    return `${PROXY_BASE_PATH}?path=${encodeURIComponent(proxyPath)}`;
  }

  const base = normalizeUrl(API_CONFIG.DIRECT_BASE_URL);
  if (!base) {
    throw new Error('Unable to connect. Please check your configuration and try again.');
  }

  const baseHasLegacySuffix = base.endsWith(LEGACY_ENDPOINT_PATH);

  // If BASE_URL itself points to legacy endpoint, preserve that behavior only
  // for legacy requests. For all other endpoints, strip the legacy suffix.
  if (baseHasLegacySuffix) {
    if (normalizedPath === LEGACY_ENDPOINT_PATH) {
      return base;
    }

    const rootBase = base.slice(0, -LEGACY_ENDPOINT_PATH.length);
    return `${rootBase}${normalizedPath}`;
  }

  return `${base}${normalizedPath}`;
}

async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (!shouldUseServerProxy() && API_CONFIG.API_KEY) {
      headers['x-api-key'] = API_CONFIG.API_KEY;
    }

    const response = await fetch(buildEndpointUrl(path), {
      ...options,
      signal: controller.signal,
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(data.message || `API Error: ${response.status}`);
      err.statusCode = response.status;
      err.responseBody = data;
      throw err;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${API_TIMEOUT_MS / 1000}s.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildRealtimeCandidates(suffixPath) {
  const suffix = normalizePath(suffixPath).replace(/^\/v1\//, '/');
  return [`/v1${suffix}`, `/api/voice-detection/v1${suffix}`];
}

async function fetchRealtimeWithFallback(suffixPath, options = {}) {
  const candidates = buildRealtimeCandidates(suffixPath);
  let lastNotFoundError = null;

  for (const path of candidates) {
    try {
      return await fetchJson(path, options);
    } catch (error) {
      if (error?.statusCode === 404) {
        lastNotFoundError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastNotFoundError) {
    throw lastNotFoundError;
  }
  throw new Error('Analysis service is temporarily unavailable. Please try again shortly.');
}

// Warn in development for config shape issues.
if (import.meta.env.DEV) {
  if (shouldUseServerProxy()) {
    console.info('[VoiceGuard] Using server proxy mode for backend calls.');
  } else {
    if (!API_CONFIG.API_KEY) {
      console.warn('[VoiceGuard] Missing VITE_API_KEY. Create .env.local with your API key.');
    }
    if (!API_CONFIG.DIRECT_BASE_URL) {
      console.warn('[VoiceGuard] Missing VITE_API_BASE_URL. Create .env.local with your API endpoint.');
    }
  }
}

/**
 * Converts a File object to a Base64 string (without the data URL prefix).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Sends audio to the legacy detection API.
 * @param {File} audioFile - The audio file to analyze.
 * @param {string} language - The language of the audio (default: "English").
 * @returns {Promise<Object>} API Response
 * @throws {Error} If the API call fails or returns an error status.
 */
export async function detectVoice(audioFile, language = 'English') {
  if (audioFile.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
  }

  const audioFormat = audioFile.name.split('.').pop().toLowerCase();
  const audioBase64 = await fileToBase64(audioFile);

  return fetchJson(LEGACY_ENDPOINT_PATH, {
    method: 'POST',
    body: JSON.stringify({
      language,
      audioFormat,
      audioBase64,
    }),
  });
}

export async function startRealtimeSession(language = 'English') {
  return fetchRealtimeWithFallback('/session/start', {
    method: 'POST',
    body: JSON.stringify({ language }),
  });
}

export async function analyzeRealtimeChunk(sessionId, payload) {
  return fetchRealtimeWithFallback(`/session/${sessionId}/chunk`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getRealtimeSummary(sessionId) {
  return fetchRealtimeWithFallback(`/session/${sessionId}/summary`, { method: 'GET' });
}

export async function getRealtimeAlerts(sessionId, limit = 20) {
  return fetchRealtimeWithFallback(`/session/${sessionId}/alerts?limit=${limit}`, { method: 'GET' });
}

export async function endRealtimeSession(sessionId) {
  return fetchRealtimeWithFallback(`/session/${sessionId}/end`, { method: 'POST' });
}

export async function getRetentionPolicy() {
  return fetchRealtimeWithFallback('/privacy/retention-policy', { method: 'GET' });
}

/**
 * Health check.
 * @returns {{ status: 'healthy'|'degraded', model_loaded: boolean, session_store_backend: string }}
 */
export async function checkHealth() {
  const response = await fetch(buildEndpointUrl('/health'), { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Build a WebSocket URL for the realtime streaming endpoint.
 * Uses VITE_API_WS_BASE_URL if set, otherwise derives from VITE_API_BASE_URL (http->ws).
 */
function buildWsUrl(sessionId) {
  if (shouldUseServerProxy()) {
    throw new Error('WebSocket streaming is unavailable in proxy mode.');
  }

  if (!API_CONFIG.API_KEY) {
    throw new Error('WebSocket streaming requires VITE_API_KEY in direct mode.');
  }

  const wsEnv = import.meta.env.VITE_API_WS_BASE_URL;
  let wsBase;

  if (wsEnv) {
    wsBase = normalizeUrl(wsEnv);
  } else {
    const httpBase = normalizeUrl(API_CONFIG.DIRECT_BASE_URL);
    const rootBase = httpBase.endsWith(LEGACY_ENDPOINT_PATH)
      ? httpBase.slice(0, -LEGACY_ENDPOINT_PATH.length)
      : httpBase;
    wsBase = rootBase.replace(/^http/, 'ws');
  }

  return `${wsBase}/v1/session/${sessionId}/stream?api_key=${encodeURIComponent(API_CONFIG.API_KEY)}`;
}

export function isRealtimeWebSocketEnabled() {
  return !shouldUseServerProxy() && Boolean(API_CONFIG.API_KEY);
}

/**
 * Create a WebSocket connection to the backend realtime streaming endpoint.
 *
 * Includes onopen gating: chunks sent before the connection is open are
 * buffered in a pending queue and flushed automatically upon open.
 *
 * @param {string} sessionId - active session ID
 * @param {{ onUpdate?: Function, onError?: Function, onClose?: Function, onOpen?: Function }} handlers
 * @returns {{ send: (chunk: object) => void, close: () => void, ready: Promise<void>, ws: WebSocket }}
 */
export function createRealtimeWebSocket(sessionId, { onUpdate, onError, onClose, onOpen } = {}) {
  const url = buildWsUrl(sessionId);
  const ws = new WebSocket(url);
  const pendingQueue = [];
  let isOpen = false;
  let rejectReady = null;

  /** Promise that resolves when the WS connection is open, rejects on early failure or close. */
  const ready = new Promise((resolve, reject) => {
    rejectReady = reject;

    ws.onopen = () => {
      isOpen = true;
      rejectReady = null; // no longer needed
      // Flush any chunks that were queued before connection opened
      while (pendingQueue.length > 0) {
        ws.send(JSON.stringify(pendingQueue.shift()));
      }
      onOpen?.();
      resolve();
    };

    // If the socket errors before opening, reject the ready promise
    ws.onerror = () => {
      if (!isOpen) {
        reject(new Error('WebSocket failed to connect'));
        rejectReady = null;
      }
      onError?.(new Error('WebSocket connection error'));
    };
  });

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.status === 'error') {
        onError?.(new Error(data.message || 'WebSocket chunk error'));
      } else {
        onUpdate?.(data);
      }
    } catch (parseErr) {
      onError?.(parseErr);
    }
  };

  ws.onclose = (event) => {
    // If socket closes before open, reject the ready promise to prevent hangs
    if (rejectReady) {
      rejectReady(new Error('WebSocket closed before open'));
      rejectReady = null;
    }
    isOpen = false;
    onClose?.(event);
  };

  return {
    /**
      * Send a chunk payload (must match SessionChunkRequest schema).
      * If the connection is not yet open, the payload is queued and
      * will be flushed automatically when the connection opens.
      */
    send(chunkPayload) {
      if (isOpen && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(chunkPayload));
      } else if (ws.readyState === WebSocket.CONNECTING) {
        pendingQueue.push(chunkPayload);
      }
      // If CLOSING/CLOSED, drop silently - caller should handle via onClose/onError
    },
    /** Gracefully close the connection. */
    close() {
      isOpen = false;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    },
    /** Promise that resolves when the connection is open. */
    ready,
    /** Raw WebSocket instance (for readyState checks). */
    ws,
  };
}


