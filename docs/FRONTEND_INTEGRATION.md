# API Handoff: AI Call Shield Backend v2 for Frontend

## Business Context
This backend now supports two frontend integration modes: one-shot legacy voice detection and session-based real-time fraud risk analysis. The real-time flow is required for Challenge 1 because it continuously analyzes audio patterns, language signals, and behavior trends, then pushes actionable alerts. Frontend must expose risk progression, CPI (Conversational Pressure Index), explainability, and uncertainty-safe handling to avoid false confidence. This document is the frontend requirements source for integrating the current backend contract.

## Base Configuration
- Base URL (production): `https://shivam-2211-voice-detection-api.hf.space`
- Auth header (required on analysis/session endpoints): `x-api-key: <API_KEY>`
- Content type: `application/json`
- Supported languages: `Tamil`, `English`, `Hindi`, `Malayalam`, `Telugu`
- Supported formats: `mp3`, `wav`, `flac`, `ogg`, `m4a`, `mp4`
- Realtime route compatibility: both `/v1/...` and `/api/voice-detection/v1/...` are supported.

## Endpoints

### GET /health
- Purpose: Service liveness check and model readiness.
- Auth: public.
- Request: none.
- Response (success):
```json
{
  "status": "healthy",
  "model_loaded": true
}
```
- Response (error): standard HTTP error body if unavailable.
- Notes: do not use this for user-facing call analysis status; use only preflight/system checks.

### POST /api/voice-detection
- Purpose: One-shot legacy classification for uploaded audio.
- Auth: required (`x-api-key`).
- Request:
```json
{
  "language": "English",
  "audioFormat": "mp3",
  "audioBase64": "<base64>"
}
```
- Response (success):
```json
{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.91,
  "explanation": "Strong synthetic markers detected...",
  "forensic_metrics": {
    "authenticity_score": 23.1,
    "pitch_naturalness": 20.2,
    "spectral_naturalness": 31.5,
    "temporal_naturalness": 18.4
  },
  "modelUncertain": false,
  "recommendedAction": null
}
```
- Response (uncertain fallback success):
```json
{
  "status": "success",
  "language": "English",
  "classification": "UNCERTAIN",
  "confidenceScore": 0.5,
  "explanation": "Model uncertainty detected due fallback inference...",
  "forensic_metrics": {
    "authenticity_score": 50.0,
    "pitch_naturalness": 50.0,
    "spectral_naturalness": 50.0,
    "temporal_naturalness": 50.0
  },
  "modelUncertain": true,
  "recommendedAction": "Do not share OTP, PIN, passwords, or payment credentials. Verify caller identity through official support channels."
}
```
- Response (error):
  - `401`: `{"status":"error","message":"Missing API key. Include 'x-api-key' header."}` or `{"status":"error","message":"Invalid API key"}`
  - `400`: unsupported language/format or decode/load failures
  - `422`: request validation (for example audioBase64 too small)
  - `429`: rate limited
  - `500`: internal error
- Notes:
  - Rate limit: `1000/minute` per IP.
  - Legacy `classification` and realtime `call_label` are different concepts: legacy is voice authenticity, realtime label is fraud-risk severity. Use realtime `voice_classification` + `voice_confidence` for authenticity UI.

### POST /v1/session/start
- Purpose: Create realtime analysis session.
- Auth: required (`x-api-key`).
- Request:
```json
{
  "language": "English"
}
```
- Response (success):
```json
{
  "status": "success",
  "session_id": "uuid",
  "language": "English",
  "started_at": "2026-02-10T18:21:30Z",
  "message": "Session created. Send chunks using /v1/session/{session_id}/chunk or websocket stream."
}
```
- Response (error):
  - `400`: unsupported language
  - `401`: auth failure

### POST /v1/session/{session_id}/chunk
- Purpose: Analyze a single audio chunk (1-2 second cadence recommended).
- Auth: required (`x-api-key`).
- Request:
```json
{
  "audioFormat": "mp3",
  "audioBase64": "<base64>",
  "language": "English"
}
```
- Response (success):
```json
{
  "status": "success",
  "session_id": "uuid",
  "timestamp": "2026-02-10T18:21:31Z",
  "risk_score": 68,
  "cpi": 72.5,
  "risk_level": "HIGH",
  "call_label": "FRAUD",
  "model_uncertain": false,
  "voice_classification": "AI_GENERATED",
  "voice_confidence": 0.82,
  "evidence": {
    "audio_patterns": [
      "classification:ai_generated",
      "model_confidence:0.82",
      "authenticity_score:32.0",
      "acoustic_anomaly_score:61.0",
      "audio_score:82"
    ],
    "keywords": ["authentication:otp", "threat:blocked"],
    "behaviour": ["rapid_risk_escalation", "cpi_spike_detected"]
  },
  "language_analysis": {
    "transcript": "Your account is blocked. Share OTP now.",
    "transcript_confidence": 0.93,
    "asr_engine": "faster-whisper",
    "keyword_hits": ["authentication:otp", "threat:blocked"],
    "keyword_categories": ["authentication", "threat"],
    "semantic_flags": ["credential_request", "coercive_threat_language"],
    "keyword_score": 62,
    "semantic_score": 52,
    "behaviour_score": 30,
    "session_behaviour_signals": ["repetition_loop"]
  },
  "alert": {
    "triggered": true,
    "alert_type": "EARLY_PRESSURE_WARNING",
    "severity": "high",
    "reason_summary": "Fraud keywords detected. risk escalated rapidly across chunks. conversational pressure index spiked.",
    "recommended_action": "Fraud indicators detected. Do not share OTP, PIN, passwords, or UPI credentials."
  },
  "explainability": {
    "summary": "High risk classified as FRAUD. CPI at 72.5/100. Pressure escalation velocity is high; early warning triggered.",
    "top_indicators": ["rapid_risk_escalation", "cpi_spike_detected", "authentication:otp"],
    "signal_contributions": [
      {"signal": "audio", "raw_score": 82, "weight": 0.45, "weighted_score": 36.9},
      {"signal": "keywords", "raw_score": 62, "weight": 0.2, "weighted_score": 12.4},
      {"signal": "semantic_intent", "raw_score": 52, "weight": 0.15, "weighted_score": 7.8},
      {"signal": "behaviour", "raw_score": 30, "weight": 0.2, "weighted_score": 6.0}
    ],
    "uncertainty_note": null
  },
  "chunks_processed": 2
}
```
- Response (error):
  - `401`: auth failure
  - `404`: session not found or expired
  - `409`: session ended/inactive
  - `422`: request validation (for example short base64)
  - `400`: unsupported format/language
- Notes:
  - New field: `cpi` (0-100) for escalation velocity.
  - New block: `explainability` with weighted contributions.
  - Session stores alert history (max 100 in memory).

### WebSocket /v1/session/{session_id}/stream
- Purpose: Continuous realtime chunk processing over websocket.
- Auth: required via header `x-api-key` or query param `api_key`.
- Request payload per message:
```json
{
  "audioFormat": "mp3",
  "audioBase64": "<base64>",
  "language": "English"
}
```
- Response per message: same schema as `POST /v1/session/{session_id}/chunk` success.
- Response (error message over socket):
```json
{
  "status": "error",
  "message": "Invalid chunk payload",
  "details": []
}
```
- Notes:
  - Close reason examples: invalid API key, session not found/expired, session not active.
  - Use websocket for low-latency UI timelines; use HTTP chunk fallback if WS unavailable.

### GET /v1/session/{session_id}/summary
- Purpose: Read aggregate session summary.
- Auth: required.
- Request: optional none.
- Response (success):
```json
{
  "status": "success",
  "session_id": "uuid",
  "language": "English",
  "session_status": "active",
  "started_at": "2026-02-10T18:21:30Z",
  "last_update": "2026-02-10T18:21:40Z",
  "chunks_processed": 5,
  "alerts_triggered": 2,
  "max_risk_score": 86,
  "max_cpi": 91.2,
  "final_call_label": "FRAUD",
  "final_voice_classification": "AI_GENERATED",
  "final_voice_confidence": 0.88,
  "max_voice_ai_confidence": 0.92,
  "voice_ai_chunks": 3,
  "voice_human_chunks": 2
}
```
- Response (error): `401`, `404`.

### GET /v1/session/{session_id}/alerts?limit=20
- Purpose: Read recent alerts emitted in a session.
- Auth: required.
- Request params:
  - `limit`: integer, `1..100`, default `20`.
- Response (success):
```json
{
  "status": "success",
  "session_id": "uuid",
  "total_alerts": 2,
  "alerts": [
    {
      "timestamp": "2026-02-10T18:21:36Z",
      "risk_score": 82,
      "risk_level": "CRITICAL",
      "call_label": "FRAUD",
      "alert_type": "FRAUD_RISK_CRITICAL",
      "severity": "critical",
      "reason_summary": "Fraud keywords detected...",
      "recommended_action": "High fraud risk. End the call and verify through an official support number."
    }
  ]
}
```
- Response (error):
  - `400`: invalid limit
  - `401`: auth failure
  - `404`: session not found or expired

### POST /v1/session/{session_id}/end
- Purpose: End session explicitly.
- Auth: required.
- Request: none.
- Response (success): same schema as session summary with `session_status="ended"`.
- Response (error): `401`, `404`.

### GET /v1/privacy/retention-policy
- Purpose: Surface retention behavior for privacy/compliance display.
- Auth: required.
- Response (success):
```json
{
  "status": "success",
  "raw_audio_storage": "not_persisted",
  "active_session_retention_seconds": 1800,
  "ended_session_retention_seconds": 300,
  "stored_derived_fields": [
    "risk_history",
    "behaviour_score",
    "session_behaviour_signals",
    "transcript_counts",
    "semantic_flag_counts",
    "keyword_category_counts",
    "chunks_processed",
    "alerts_triggered",
    "max_risk_score",
    "final_call_label"
  ]
}
```
- Response (error): `401`.

## Data Models / DTOs

```typescript
export type Language = 'Tamil' | 'English' | 'Hindi' | 'Malayalam' | 'Telugu';
export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'ogg' | 'm4a' | 'mp4';

export interface ErrorResponse {
  status: 'error';
  message: string;
  details?: unknown[];
}

export interface ForensicMetrics {
  authenticity_score: number;
  pitch_naturalness: number;
  spectral_naturalness: number;
  temporal_naturalness: number;
}

export interface LegacyVoiceDetectionResponse {
  status: 'success';
  language: Language;
  classification: 'AI_GENERATED' | 'HUMAN' | 'UNCERTAIN';
  confidenceScore: number;
  explanation: string;
  forensic_metrics?: ForensicMetrics;
  modelUncertain: boolean;
  recommendedAction?: string | null;
}

export interface SessionStartResponse {
  status: 'success';
  session_id: string;
  language: Language;
  started_at: string;
  message: string;
}

export interface RiskEvidence {
  audio_patterns: string[];
  keywords: string[];
  behaviour: string[];
}

export interface RealTimeLanguageAnalysis {
  transcript: string;
  transcript_confidence: number;
  asr_engine: string;
  keyword_hits: string[];
  keyword_categories: string[];
  semantic_flags: string[];
  keyword_score: number;
  semantic_score: number;
  behaviour_score: number;
  session_behaviour_signals: string[];
}

export interface RealTimeAlert {
  triggered: boolean;
  alert_type?: 'FRAUD_RISK_CRITICAL' | 'EARLY_PRESSURE_WARNING' | 'RISK_ESCALATION' | 'FRAUD_RISK_HIGH' | null;
  severity?: 'low' | 'medium' | 'high' | 'critical' | null;
  reason_summary?: string | null;
  recommended_action?: string | null;
}

export interface ExplainabilitySignal {
  signal: 'audio' | 'keywords' | 'semantic_intent' | 'behaviour';
  raw_score: number;
  weight: number;
  weighted_score: number;
}

export interface RealTimeExplainability {
  summary: string;
  top_indicators: string[];
  signal_contributions: ExplainabilitySignal[];
  uncertainty_note?: string | null;
}

export interface RealTimeUpdateResponse {
  status: 'success';
  session_id: string;
  timestamp: string;
  risk_score: number;
  cpi: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  call_label: 'SAFE' | 'SPAM' | 'FRAUD' | 'UNCERTAIN';
  model_uncertain: boolean;
  evidence: RiskEvidence;
  language_analysis: RealTimeLanguageAnalysis;
  alert: RealTimeAlert;
  explainability: RealTimeExplainability;
  chunks_processed: number;
}

export interface SessionSummaryResponse {
  status: 'success';
  session_id: string;
  language: Language;
  session_status: 'active' | 'ended';
  started_at: string;
  last_update?: string | null;
  chunks_processed: number;
  alerts_triggered: number;
  max_risk_score: number;
  max_cpi: number;
  final_call_label: 'SAFE' | 'SPAM' | 'FRAUD' | 'UNCERTAIN';
}

export interface AlertHistoryItem {
  timestamp: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  call_label: 'SAFE' | 'SPAM' | 'FRAUD' | 'UNCERTAIN';
  alert_type: 'FRAUD_RISK_CRITICAL' | 'EARLY_PRESSURE_WARNING' | 'RISK_ESCALATION' | 'FRAUD_RISK_HIGH';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason_summary: string;
  recommended_action: string;
}

export interface AlertHistoryResponse {
  status: 'success';
  session_id: string;
  total_alerts: number;
  alerts: AlertHistoryItem[];
}

export interface RetentionPolicyResponse {
  status: 'success';
  raw_audio_storage: 'not_persisted';
  active_session_retention_seconds: number;
  ended_session_retention_seconds: number;
  stored_derived_fields: string[];
}
```

## Enums and Constants

| Value | Meaning | Display Label |
|---|---|---|
| `LOW` | low risk score (`<35`) | Low Risk |
| `MEDIUM` | moderate risk (`35-59`) | Medium Risk |
| `HIGH` | high risk (`60-79`) | High Risk |
| `CRITICAL` | critical risk (`>=80`) | Critical Risk |
| `SAFE` | non-suspicious call label | Safe |
| `SPAM` | medium-risk label | Spam |
| `FRAUD` | high/critical-risk label | Fraud |
| `UNCERTAIN` | fallback/uncertain model path | Uncertain |
| `FRAUD_RISK_CRITICAL` | critical immediate alert | Critical Fraud Alert |
| `EARLY_PRESSURE_WARNING` | CPI-based early pressure alert | Early Warning |
| `RISK_ESCALATION` | risk jump detected across chunks | Risk Escalation |
| `FRAUD_RISK_HIGH` | high-risk alert default | High Fraud Alert |

## Validation Rules
- Auth is mandatory on all `/api/voice-detection` and `/v1/*` analysis/session endpoints.
- `language` must be one of supported languages.
- `audioFormat` must be one of supported formats.
- `audioBase64` required.
- `audioBase64` minimum length: `100` characters.
- `audioBase64` maximum length: `13,981,013` characters (`10MB * 4/3`).
- Alerts history `limit` query param must be between `1` and `100`.
- Frontend should mirror these rules for immediate UX feedback before API call.

## Business Logic and Edge Cases
- Realtime call label mapping:
  - `risk LOW -> SAFE`
  - `risk MEDIUM -> SPAM`
  - `risk HIGH/CRITICAL -> FRAUD`
  - if model uncertain fallback -> `UNCERTAIN` regardless of risk.
- CPI is independent telemetry for pressure escalation and can trigger early warnings before a critical risk score.
- `alert.triggered` can be true even before `CRITICAL` because escalation/CPI rules can fire.
- Session expiration is in-memory and TTL-based:
  - active: 1800s since last update
  - ended: 300s since end
  - expired sessions return `404`.
- Sending chunk after end returns `409`.
- Transcript may be empty with `asr_engine="unavailable"` or `"error"`; frontend must still render risk/evidence gracefully.
- Sensitive entities in transcript output are masked by backend when masking is enabled.
- Legacy and realtime predictions can differ because realtime may run lightweight audio path for latency.

## Frontend Implementation Requirements
- Keep existing one-shot upload mode using `POST /api/voice-detection`.
- Add realtime mode with session lifecycle:
  1. `POST /v1/session/start`
  2. send audio chunks via websocket or HTTP chunk endpoint
  3. render risk timeline using `risk_score`, `risk_level`, `cpi`
  4. show live alert banner/cards from `alert`
  5. show explainability panel from `explainability`
  6. fetch `GET /v1/session/{id}/alerts` for alert history panel
  7. finalize with `POST /v1/session/{id}/end` and `GET /summary`.
- Add explicit UX treatment for uncertainty:
  - Legacy: `modelUncertain=true` and `classification=UNCERTAIN`
  - Realtime: `model_uncertain=true` and `call_label=UNCERTAIN`.
- Add privacy info panel fed by `/v1/privacy/retention-policy`.
- Update env config in frontend:
  - `VITE_API_BASE_URL` should be backend base URL (no endpoint suffix), then append endpoint paths in service layer.

## Integration Notes
- Recommended flow:
  - User chooses mode (`legacy` or `realtime`).
  - Realtime default for demo/final round.
- Optimistic UI:
  - Safe for local upload/progress indicators only.
  - Do not optimistic-render risk/alert decisions before backend response.
- Caching:
  - Do not cache analysis/chunk responses.
  - Cache static constants and language options client-side.
- Real-time transport:
  - Prefer websocket for continuous stream.
  - Fallback to HTTP chunk polling when websocket is unavailable.

## Test Scenarios
1. Happy path legacy: valid file -> `200`, render classification, confidence, explanation, forensic metrics.
2. Legacy uncertainty: fallback case -> classification `UNCERTAIN`, show conservative recommendation.
3. Legacy validation: too-small base64 -> `422` with validation message (not `500`).
4. Realtime happy path: start session, send chunk, render risk + cpi + explainability.
5. Realtime escalation: multi-chunk fraud simulation triggers alert and updates timeline.
6. Realtime early warning: alert type `EARLY_PRESSURE_WARNING` appears before session end.
7. Realtime summary: after end, summary shows `max_risk_score`, `max_cpi`, `alerts_triggered`.
8. Alert history: `GET /alerts` returns list with `reason_summary` and actions.
9. Expired/invalid session: chunk/summary returns `404`, frontend prompts restart.
10. Ended session chunk: returns `409`, frontend should block further chunk uploads.
11. Auth failure: missing/invalid key -> `401` and clear user/system message.
12. ASR unavailable: empty transcript path still renders risk/evidence without UI crash.

## Open Questions / TODOs
- Decide if frontend should expose both legacy and realtime modes in final demo, or keep legacy hidden as fallback/debug.
- Decide final chunk cadence and browser recording strategy (1s vs 2s) based on UX smoothness and device CPU.




