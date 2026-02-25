const RIFF_HEADER_SIZE = 44;

function clampToInt16(sample) {
  const clamped = Math.max(-1, Math.min(1, sample));
  return clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
}

function writeString(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function audioBufferSegmentToWavBuffer(audioBuffer, startFrame, endFrame) {
  const frameCount = endFrame - startFrame;
  const channelCount = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const blockAlign = channelCount * 2;
  const byteRate = sampleRate * blockAlign;
  const dataByteLength = frameCount * blockAlign;

  const wavBuffer = new ArrayBuffer(RIFF_HEADER_SIZE + dataByteLength);
  const view = new DataView(wavBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  const channelData = [];
  for (let channel = 0; channel < channelCount; channel += 1) {
    channelData.push(audioBuffer.getChannelData(channel));
  }

  let byteOffset = RIFF_HEADER_SIZE;
  for (let frame = startFrame; frame < endFrame; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      view.setInt16(byteOffset, clampToInt16(channelData[channel][frame]), true);
      byteOffset += 2;
    }
  }

  return wavBuffer;
}

function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}

export async function createRealtimeChunksFromFile(file, chunkDurationSec = 3.0) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  // Force 16 kHz to match mic chunks
  const audioContext = new AudioContextClass({ sampleRate: 16000 });

  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const decodedAudio = await audioContext.decodeAudioData(fileArrayBuffer.slice(0));

    const framesPerChunk = Math.max(1, Math.floor(decodedAudio.sampleRate * chunkDurationSec));
    const chunks = [];

    for (let startFrame = 0; startFrame < decodedAudio.length; startFrame += framesPerChunk) {
      const endFrame = Math.min(startFrame + framesPerChunk, decodedAudio.length);
      const wavBuffer = audioBufferSegmentToWavBuffer(decodedAudio, startFrame, endFrame);
      const audioBase64 = arrayBufferToBase64(wavBuffer);

      if (audioBase64.length < 100) {
        continue;
      }

      chunks.push({
        audioBase64,
        audioFormat: 'wav',
        startSec: startFrame / decodedAudio.sampleRate,
        endSec: endFrame / decodedAudio.sampleRate,
      });
    }

    if (chunks.length === 0) {
      throw new Error('Audio is too short to create valid realtime chunks.');
    }

    return chunks;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to prepare realtime audio chunks.');
  } finally {
    await audioContext.close().catch(() => {});
  }
}

/**
 * Convert raw PCM Float32 mono samples to WAV base64 string.
 * Used by useMicRecorder for direct PCM → WAV conversion (no codec decode needed).
 *
 * @param {Float32Array} samples — mono PCM samples in [-1, 1]
 * @param {number} sampleRate — sample rate in Hz
 * @returns {string} — base64-encoded WAV
 */
export function pcmToWavBase64(samples, sampleRate) {
  const frameCount = samples.length;
  const channelCount = 1;
  const blockAlign = channelCount * 2;
  const byteRate = sampleRate * blockAlign;
  const dataByteLength = frameCount * blockAlign;

  const wavBuffer = new ArrayBuffer(RIFF_HEADER_SIZE + dataByteLength);
  const view = new DataView(wavBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  let byteOffset = RIFF_HEADER_SIZE;
  for (let i = 0; i < frameCount; i += 1) {
    view.setInt16(byteOffset, clampToInt16(samples[i]), true);
    byteOffset += 2;
  }

  return arrayBufferToBase64(wavBuffer);
}

/**
 * Convert a MediaRecorder Blob (webm/ogg) to WAV base64.
 * Used for file-based realtime analysis. NOT used by mic recording
 * (mic recording uses pcmToWavBase64 via ScriptProcessorNode).
 *
 * @param {Blob} blob — audio blob from MediaRecorder.ondataavailable
 * @returns {Promise<string>} — WAV base64 string
 */
export async function blobToWavBase64(blob) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioContext = new AudioContextClass({ sampleRate: 16000 });

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Convert entire blob to a single WAV chunk
    const wavBuffer = audioBufferSegmentToWavBuffer(audioBuffer, 0, audioBuffer.length);
    return arrayBufferToBase64(wavBuffer);
  } finally {
    await audioContext.close().catch(() => {});
  }
}

