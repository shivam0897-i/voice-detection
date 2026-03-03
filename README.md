<div align="center">

# 🛡️ VoiceGuard

### AI-Powered Voice Authentication Platform

**Detect AI-generated voices in real-time across 7 Indian languages**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)

[Live Demo](https://voice-detection-nu.vercel.app/) · [Documentation](/docs) · [API Reference](/api-reference) · [Report Bug](#)

</div>

---

## 🎯 Problem Statement

AI systems can now generate highly realistic human-like voices, making it increasingly difficult to distinguish between authentic human speech and AI-generated audio. VoiceGuard addresses this critical challenge by providing a real-time detection system for identifying synthetic voices across phone calls and audio streams.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **Multi-Language Support** | Auto, English, Hindi, Hinglish, Mixed, Tamil, Malayalam, Telugu |
| 🔊 **Real-Time Session Analysis** | Stream audio chunks with per-chunk risk scoring and CPI |
| 📊 **Risk Scoring (0–100)** | Fused score: audio (45%), keywords (20%), semantic (15%), behaviour (20%) |
| 🎵 **Voice Classification** | AI_GENERATED / HUMAN with majority-vote session verdict |
| 🔔 **Live Alerts** | Fraud risk alerts with severity, recommended actions |
| 🧠 **Forensic Metrics** | Authenticity, pitch, spectral, and temporal naturalness scores |
| 🔌 **WebSocket Streaming** | Real-time bidirectional audio analysis |
| 🎤 **Live Microphone** | Browser mic capture for real-time sessions |
| 📁 **Drag & Drop Upload** | File-based analysis with validation |
| 📜 **Analysis History** | Track and export analyses as JSON |
| ⌨️ **Keyboard Shortcuts** | Ctrl+Enter to analyze instantly |
| 📱 **Fully Responsive** | Mobile-first design with breakpoints |
| ♿ **Accessible** | WCAG 2.1 compliant with ARIA, keyboard navigation |
| 🔌 **PWA Support** | Installable app with offline caching |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/voiceguard.git
cd voiceguard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API URL + key

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=https://your-backend-url.hf.space
VITE_API_KEY=your_api_key_here
```

## 🏗️ Project Structure

```
voiceguard/
├── public/
│   ├── favicon.svg             # Branded favicon
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (Badge, Button, Card, Dialog, etc.)
│   │   ├── SiteNav.jsx         # Main navigation bar
│   │   ├── Footer.jsx          # Site footer with social links
│   │   ├── ErrorBoundary.jsx   # React error boundary
│   │   ├── ResultCard.jsx      # Legacy analysis result display
│   │   ├── RealtimeSessionPanel.jsx # Real-time session dashboard
│   │   ├── Toast.jsx           # Notification system
│   │   └── ...
│   ├── layouts/
│   │   ├── MarketingLayout.jsx # Marketing pages layout (nav + footer)
│   │   └── DashboardLayout.jsx # Dashboard compact layout
│   ├── pages/
│   │   ├── LandingPage.jsx     # Marketing landing page
│   │   ├── PricingPage.jsx     # Pricing tiers
│   │   ├── PrivacyPage.jsx     # Privacy policy
│   │   ├── DocsPage.jsx        # Documentation (Getting Started, Auth, Concepts)
│   │   ├── ApiReferencePage.jsx # API Reference (all 9 endpoints)
│   │   ├── DashboardPage.jsx   # Voice detection dashboard
│   │   └── NotFoundPage.jsx    # 404 page
│   ├── services/
│   │   └── api.js              # API communication layer (REST + WebSocket)
│   ├── hooks/
│   │   └── useMicRecorder.js   # Browser microphone recording hook
│   ├── styles/
│   │   ├── globals.css         # Theme tokens + design system
│   │   └── index.css           # Component styles
│   ├── router.jsx              # Route configuration
│   ├── main.jsx                # Entry point with providers
│   └── App.jsx                 # Dashboard application component
├── docs/                       # Additional documentation files
└── package.json
```

## 🔌 API Integration

VoiceGuard connects to a FastAPI backend for real-time voice fraud detection.

### Single Analysis

```bash
curl -X POST https://your-host/api/voice-detection \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"audioBase64": "...", "language": "Auto", "audioFormat": "wav"}'
```

### Real-Time Session

1. **Start Session** → `POST /api/voice-detection/v1/session/start`
2. **Send Chunks** → `POST /api/voice-detection/v1/session/{id}/chunk`
3. **Get Summary** → `GET /api/voice-detection/v1/session/{id}/summary`
4. **End Session** → `POST /api/voice-detection/v1/session/{id}/end`

Or use the **WebSocket** endpoint: `WS /api/voice-detection/v1/session/{id}/stream`

See the full [API Reference](/api-reference) for all 9 endpoints with schemas.

## 🎨 Design System

VoiceGuard uses an **Emerald-branded design system** with light/dark theme support:

| Element | Value |
|---------|-------|
| **Sans Font** | Geist |
| **Heading Font** | Sora |
| **Mono Font** | JetBrains Mono |
| **Brand Color** | Emerald (`#10b981` / `#059669`) |
| **UI Framework** | shadcn/ui |
| **Styling** | Tailwind CSS v4 |

## 🛠️ Built With

- **[React 19](https://react.dev/)** — UI Framework
- **[Vite 7](https://vite.dev/)** — Build Tool
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** — Component Library
- **[Lucide React](https://lucide.dev/)** — Icon Library
- **[React Router v7](https://reactrouter.com/)** — Client-side Routing
- **[Vercel Analytics](https://vercel.com/analytics)** — Usage Analytics

## 🔒 Security Features

- ✅ API key stored in environment variables (never client-exposed)
- ✅ File size validation (10MB max)
- ✅ Input sanitization and Base64 validation
- ✅ Error boundary for graceful failures
- ✅ Rate limiting (1,000 req/min per IP)
- ✅ Transcript masking for sensitive entities
- ✅ Strict CSP and security headers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built by the VoiceGuard team

---

<div align="center">

**[⬆ Back to Top](#-voiceguard)**

</div>
