# Vercel Public Deployment Checklist

## Goal
Deploy the frontend publicly without exposing backend secrets in browser JavaScript.

## 1) Vercel Project Environment Variables (server-side)
Set these in Vercel Project Settings -> Environment Variables:

- `BACKEND_BASE_URL=https://shivam-2211-voice-detection-api.hf.space`
- `BACKEND_API_KEY=<your backend x-api-key>`

Do not put `BACKEND_API_KEY` in `VITE_*` variables.

## 2) Frontend Environment Variables (client-side)
In `voice_detection_ui/.env.local`:

```env
VITE_USE_SERVER_PROXY=true
```

Optional direct mode (private only, not recommended for public deploy):

```env
# VITE_API_BASE_URL=https://shivam-2211-voice-detection-api.hf.space
# VITE_API_KEY=<backend-api-key>
```

## 3) Proxy Path
Frontend now uses same-origin proxy routes:

- `/api/backend/health`
- `/api/backend/api/voice-detection`
- `/api/backend/v1/session/...`

Proxy implementation file:

- `voice_detection_ui/api/backend/[...path].js`

## 4) Security Notes
- Browser no longer needs backend API key in proxy mode.
- WebSocket realtime is disabled in proxy mode by design; mic realtime uses HTTP chunk fallback.
- `Permissions-Policy` now allows microphone on same origin (`microphone=(self)`).

## 5) Smoke Test
After deploy:

1. Open UI and run legacy file analysis.
2. Run realtime file mode (`start -> chunk updates -> summary`).
3. Run mic mode and verify chunk updates via HTTP fallback.
4. Confirm browser devtools does not show `x-api-key` in client requests.
