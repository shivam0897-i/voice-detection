/**
 * Voice Detection API Service
 * Handles communication with the AI Voice Detection backend.
 */

import { API_TIMEOUT_MS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

const DEFAULT_BACKEND_BASE_URL = 'https://shivam-2211-voice-detection-api.hf.space';
const LEGACY_ENDPOINT_PATH = '/api/voice-detection';

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND_BASE_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
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

function buildEndpointUrl(path) {
  const base = normalizeUrl(API_CONFIG.BASE_URL);
  if (!base) {
    throw new Error('Missing VITE_API_BASE_URL. Set backend URL in .env.local.');
  }

  const normalizedPath = normalizePath(path);
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
  if (!API_CONFIG.API_KEY) {
    throw new Error('Missing VITE_API_KEY. Add API key in .env.local.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(buildEndpointUrl(path), {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_CONFIG.API_KEY,
        ...(options.headers || {}),
      },
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
  throw new Error('Realtime endpoint unavailable. Check VITE_API_BASE_URL and backend deployment routes.');
}

// Warn in development if required env vars are missing
if (import.meta.env.DEV) {
  if (!API_CONFIG.API_KEY) {
    console.warn('[VoiceGuard] Missing VITE_API_KEY. Create .env.local with your API key.');
  }
  if (!API_CONFIG.BASE_URL) {
    console.warn('[VoiceGuard] Missing VITE_API_BASE_URL. Create .env.local with your API endpoint.');
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
