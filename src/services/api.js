/**
 * Voice Detection API Service
 * Handles communication with the AI Voice Detection backend.
 */

const API_CONFIG = {
    BASE_URL: "https://shivam-2211-voice-detection-api.hf.space/api/voice-detection",
    API_KEY: "sk_test_voice_detection_2024", // Note: In production, this should be an env variable
};

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
        console.error("Voice Detection Error:", error);
        throw error;
    }
}
