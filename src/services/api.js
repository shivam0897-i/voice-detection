/**
 * Voice Detection API Service
 * Handles communication with the AI Voice Detection backend.
 */

import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_KEY: import.meta.env.VITE_API_KEY,
};

// Warn in development if required env vars are missing
if (import.meta.env.DEV) {
    if (!API_CONFIG.API_KEY) {
        console.warn('[VoiceGuard] Missing VITE_API_KEY. Create .env.local with your API key.');
    }
    if (!API_CONFIG.BASE_URL) {
        console.warn('[VoiceGuard] Missing VITE_API_BASE_URL. Create .env.local with your API endpoint.');
    }
} else {
    // Debug log for Production to verify environment variables
    console.log('[VoiceGuard] Production Config Loaded');
    console.log('[VoiceGuard] API Base URL:', API_CONFIG.BASE_URL);
    // Print only last 4 chars of API Key for verification
    const key = API_CONFIG.API_KEY || '';
    console.log('[VoiceGuard] API Key Suffix:', key.slice(-4));
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
            // robust split to handle various potential mime types
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

/**
 * Sends audio to the detection API.
 * @param {File} audioFile - The audio file to analyze.
 * @param {string} language - The language of the audio (default: "English").
 * @returns {Promise<Object>} API Response
 * @throws {Error} If the API call fails or returns an error status.
 */
export async function detectVoice(audioFile, language = "English") {
    try {
        // 0. Validate file size
        if (audioFile.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        }

        // 1. Get file format
        let audioFormat = audioFile.name.split('.').pop().toLowerCase();

        // Normalize format if needed (e.g., 'mpeg' -> 'mp3' if strictly required, 
        // but API docs say mp3, wav, flac, ogg, m4a, mp4 are supported)

        // 2. Convert to Base64
        const audioBase64 = await fileToBase64(audioFile);

        // 3. Make the Request
        const response = await fetch(API_CONFIG.BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_CONFIG.API_KEY
            },
            body: JSON.stringify({
                language: language,
                audioFormat: audioFormat,
                audioBase64: audioBase64
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        // Re-throw with better message for UI
        throw error;
    }
}
