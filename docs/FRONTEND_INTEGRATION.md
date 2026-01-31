# Voice Detection API - Frontend Integration Guide

## 📋 Overview

This document provides all the information needed to integrate the **AI Voice Detection API** into a frontend application. The API detects whether a voice sample is AI-generated or spoken by a real human.

---

## 🌐 API Details

| Property | Value |
|----------|-------|
| **Base URL** | `https://shivam-2211-voice-detection-api.hf.space` |
| **Authentication** | API Key (Header) |
| **Content-Type** | `application/json` |

---

## 🔑 Authentication

Include the API key in the request header:

```
x-api-key: sk_test_voice_detection_2024
```

> ⚠️ **Note**: This is a test API key. For production, request a production key from the backend team.

---

## 📡 Endpoints

### 1. Health Check

**GET** `/`

Returns the service status and supported languages.

#### Response
```json
{
  "service": "AI Voice Detection API",
  "status": "running",
  "version": "1.0.0",
  "supported_languages": ["Tamil", "English", "Hindi", "Malayalam", "Telugu"]
}
```

---

### 2. Voice Detection

**POST** `/api/voice-detection`

Analyzes an audio file and returns classification results.

#### Request Headers
| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `x-api-key` | `sk_test_voice_detection_2024` |

#### Request Body
```json
{
  "language": "English",
  "audioFormat": "mp3",
  "audioBase64": "<base64-encoded-audio-data>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `language` | string | Yes | Language of the audio. Options: `English`, `Tamil`, `Hindi`, `Malayalam`, `Telugu` |
| `audioFormat` | string | Yes | Audio format: `mp3`, `wav`, `flac`, `ogg`, `m4a`, `mp4` |
| `audioBase64` | string | Yes | Base64-encoded audio file content |

#### Success Response (200)
```json
{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.98,
  "explanation": "Strong synthetic markers detected (confidence: 98%). Pitch analysis shows unusually consistent patterns (stability: 0.045, micro-variation: 0.0012) - typical of synthesized speech. Authenticity score: 23/100 (low)."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"success"` or `"error"` |
| `language` | string | Echoed language from request |
| `classification` | string | `"AI_GENERATED"` or `"HUMAN"` |
| `confidenceScore` | number | Confidence level (0.0 to 1.0) |
| `explanation` | string | Detailed forensic analysis of the audio |

#### Error Response (4xx/5xx)
```json
{
  "status": "error",
  "message": "Error message describing what went wrong"
}
```

---

## 🎨 Frontend Implementation

### Converting Audio File to Base64 (JavaScript)

```javascript
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
```

### Complete API Call Example

```javascript
async function detectVoice(audioFile, language = "English") {
  const API_URL = "https://shivam-2211-voice-detection-api.hf.space/api/voice-detection";
  const API_KEY = "sk_test_voice_detection_2024";

  // Get file extension
  const audioFormat = audioFile.name.split('.').pop().toLowerCase();
  
  // Convert to base64
  const audioBase64 = await fileToBase64(audioFile);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify({
      language: language,
      audioFormat: audioFormat,
      audioBase64: audioBase64
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}
```

### React Example

```jsx
import { useState } from 'react';

function VoiceDetector() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const response = await detectVoice(file, "English");
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      
      {loading && <p>Analyzing audio...</p>}
      
      {error && <p className="error">{error}</p>}
      
      {result && (
        <div className="result">
          <h3>Classification: {result.classification}</h3>
          <p>Confidence: {(result.confidenceScore * 100).toFixed(0)}%</p>
          <p>{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 UI/UX Recommendations

### Result Display

| Classification | Suggested Color | Icon |
|---------------|-----------------|------|
| `AI_GENERATED` | Red / Orange | ⚠️ 🤖 |
| `HUMAN` | Green | ✅ 👤 |

### Confidence Score Visualization

Consider displaying the confidence as:
- A circular progress indicator
- A horizontal progress bar
- Percentage text with color coding:
  - 90-100%: Strong confidence (bold)
  - 70-89%: Moderate confidence
  - Below 70%: Low confidence (show warning)

### Loading States

The API typically responds within **5-15 seconds** depending on audio length. Implement:
- Loading spinner
- "Analyzing audio..." message
- Cancel button for long-running requests

---

## 📏 Constraints & Limits

| Constraint | Value |
|------------|-------|
| Max audio file size | ~10 MB (after base64 encoding) |
| Supported formats | MP3, WAV, FLAC, OGG, M4A, MP4 |
| Recommended audio length | 3-30 seconds |
| Request timeout | 60 seconds |

---

## ❌ Error Handling

| Status Code | Meaning | Suggested Action |
|-------------|---------|------------------|
| 401 | Invalid API Key | Check `x-api-key` header |
| 400 | Bad Request | Validate audio format and base64 encoding |
| 413 | Payload Too Large | Reduce file size |
| 500 | Server Error | Retry after a few seconds |
| 503 | Service Unavailable | The model may be loading. Retry in 30s |

---

## 🧪 Test Audio Files

For testing, you can use:
- **AI Voice**: Generate samples using ElevenLabs, Google TTS, or other AI voice generators
- **Human Voice**: Record a voice memo or use any podcast/interview clip

---

## 🖥️ Recommended UI Features

Based on the hackathon problem statement requirements, here are the recommended UI components:

### Must-Have Features (Required for Demo)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Audio Upload** | Drag-and-drop zone + file picker for audio files | 🔴 Critical |
| **Language Selector** | Dropdown with: Tamil, English, Hindi, Malayalam, Telugu | 🔴 Critical |
| **Analyze Button** | Triggers API call with loading state | 🔴 Critical |
| **Classification Result** | Large badge showing `AI_GENERATED` 🤖 or `HUMAN` 👤 | 🔴 Critical |
| **Confidence Score** | Visual gauge/meter showing 0.0 - 1.0 (or 0-100%) | 🔴 Critical |
| **Explanation Display** | Text area showing forensic analysis details | 🔴 Critical |

### Nice-to-Have Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Audio Player** | Play/pause uploaded audio before analyzing | 🟡 Medium |
| **Response Time** | Show API latency (evaluation criteria: reliability) | 🟡 Medium |
| **API Key Input** | Field to enter custom API key for testing | 🟡 Medium |
| **File Info** | Show file name, size, duration | 🟢 Low |
| **History Panel** | Track past analyses for comparison | 🟢 Low |
| **Export Results** | Download JSON response | 🟢 Low |

### UI Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  🎤 AI Voice Detection                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │   📁 Drag & Drop audio file here                         │  │
│  │      or click to browse                                   │  │
│  │                                                           │  │
│  │   Supported: MP3, WAV, FLAC, OGG, M4A, MP4               │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Language: [Tamil ▼]  [English ▼]  [Hindi ▼]  [Malayalam ▼]     │
│            [Telugu ▼]                                           │
│                                                                 │
│            [ 🔍 ANALYZE VOICE ]                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  RESULT                                                         │
│  ┌─────────────────┐                                            │
│  │                 │     Confidence Score                       │
│  │  AI_GENERATED   │     ████████████░░░░  78%                 │
│  │      🤖         │     ─────────────────                      │
│  │                 │     Moderate confidence                    │
│  └─────────────────┘                                            │
│                                                                 │
│  Explanation:                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Synthetic markers detected (confidence: 78%). Pitch       │  │
│  │ analysis shows unusually consistent patterns (stability:  │  │
│  │ 0.045). Authenticity score: 34/100 (low).                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⚡ Response time: 2.3s                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Styling Guidelines

#### Classification Badge Colors

| Classification | Background | Text | Border |
|---------------|------------|------|--------|
| `AI_GENERATED` | `#FECACA` (red-200) | `#DC2626` (red-600) | `#EF4444` (red-500) |
| `HUMAN` | `#BBF7D0` (green-200) | `#16A34A` (green-600) | `#22C55E` (green-500) |

#### Confidence Score Colors

| Range | Color | Label |
|-------|-------|-------|
| 90-100% | `#16A34A` (green) | High confidence |
| 70-89% | `#EAB308` (yellow) | Moderate confidence |
| 50-69% | `#F97316` (orange) | Low confidence |
| Below 50% | `#DC2626` (red) | Very low confidence |

### Evaluation Criteria Alignment

The UI should help showcase these evaluation points:

| Criteria | How UI Can Help |
|----------|-----------------|
| 🎯 **Accuracy** | Clear display of classification and confidence |
| 🌍 **Multi-language** | Easy language switching, show language in results |
| 📦 **Correct format** | Validate file format before upload |
| ⚡ **Reliability** | Show response time, handle errors gracefully |
| 🧠 **Explanation quality** | Prominent display of explanation text |

---

## 🤖 AI Agent Skills (skills.sh)

### What is Skills.sh?

**[Skills.sh](https://skills.sh)** is a directory of "skills" launched by Vercel that extends AI coding assistants (like GitHub Copilot, Claude, Cursor, etc.) with specialized knowledge. These skills are Markdown-based instruction sets that teach AI assistants best practices for specific domains.

### Why We're Including This

If your team uses AI coding assistants to help build the UI, installing these skills will:
- **Improve code quality** - AI will follow established design patterns
- **Ensure consistency** - UI components will match modern standards
- **Speed up development** - AI knows best practices out of the box
- **Reduce revisions** - Code is production-ready from the start

> 💡 **Note**: Skills are optional. They enhance AI-assisted development but are not required if your team prefers manual coding.

### Recommended Skills

| Skill | Install Command | Description |
|-------|-----------------|-------------|
| **ui-ux-pro-max** | `npx skills add ui-ux-pro-max` | Comprehensive design intelligence with UI styles, color palettes, typography, and UX best practices |
| **frontend-design** | `npx skills add anthropics/frontend-design` | Creates distinctive, production-grade frontend interfaces with focus on typography, color, and motion |
| **web-design-guidelines** | `npx skills add vercel-labs/web-design-guidelines` | Reviews UI code against established guidelines for accessibility and best practices |
| **shadcn-ui** | `npx skills add shadcn-ui` | Guidelines for using the shadcn/ui component library |
| **tailwind-design-system** | `npx skills add tailwind-design-system` | Best practices for building design systems with Tailwind CSS |
| **vercel-react-best-practices** | `npx skills add vercel-labs/vercel-react-best-practices` | React development best practices from Vercel |

### Priority for This Project

1. 🥇 **ui-ux-pro-max** - Complete design system guidance for consistent UI
2. 🥈 **frontend-design** - Ensures polished, non-generic aesthetics
3. 🥉 **web-design-guidelines** - Accessibility compliance and UX audits

### What Skills.sh Does

Skills.sh provides "skill packages" that teach AI coding assistants best practices and design patterns. When installed, these skills enhance AI-generated code to be:
- More aligned with modern design standards
- Accessible and responsive
- Consistent with established UI/UX patterns
- Production-ready rather than prototype-quality

---

## 📞 Contact

For API issues or questions, contact the backend team.
