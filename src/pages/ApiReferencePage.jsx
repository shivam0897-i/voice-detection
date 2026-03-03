import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
    Shield, ChevronRight, ChevronDown, Copy, Check,
    ArrowLeft, Zap
} from 'lucide-react';

const BASE_URL = 'https://shivam0897-i-voice-detection.hf.space';

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-background/80 text-muted-foreground/60 transition-colors hover:text-foreground hover:border-border"
            aria-label="Copy code"
        >
            {copied ? <Check size={13} className="text-brand-400" /> : <Copy size={13} />}
        </button>
    );
}

function CodeBlock({ code, language = 'json' }) {
    return (
        <div className="relative rounded-lg border border-border/50 bg-card/50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40">{language}</span>
            </div>
            <CopyButton text={code} />
            <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed">
                <code className="text-muted-foreground/90 font-mono">{code}</code>
            </pre>
        </div>
    );
}

const METHOD_COLORS = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    WS: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

function ParamTable({ params }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border/30">
            <table className="w-full text-[12px]">
                <thead className="border-b border-border/30 bg-card/50">
                    <tr>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Parameter</th>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Type</th>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Required</th>
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                    {params.map(p => (
                        <tr key={p.name}>
                            <td className="px-3 py-2"><code className="text-[11px] font-mono text-brand-400">{p.name}</code></td>
                            <td className="px-3 py-2 text-muted-foreground/60 font-mono text-[11px]">{p.type}</td>
                            <td className="px-3 py-2">{p.required ? <span className="text-red-400 text-[11px]">Yes</span> : <span className="text-muted-foreground/40 text-[11px]">No</span>}</td>
                            <td className="px-3 py-2 text-muted-foreground/70">{p.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EndpointCard({ endpoint }) {
    const [expanded, setExpanded] = useState(false);
    const colorClass = METHOD_COLORS[endpoint.method] || METHOD_COLORS.GET;

    return (
        <Card className="overflow-hidden hover:border-brand-400/10 transition-colors">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
                <Badge className={`${colorClass} text-[10px] font-mono shrink-0`}>{endpoint.method}</Badge>
                <code className="text-[13px] font-mono text-foreground/80 flex-1 min-w-0 truncate">{endpoint.path}</code>
                <span className="text-[12px] text-muted-foreground/50 hidden sm:block shrink-0">{endpoint.summary}</span>
                <ChevronDown
                    size={14}
                    className={`text-muted-foreground/40 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {expanded && (
                <CardContent className="border-t border-border/30 pt-5 space-y-5">
                    <p className="text-[13px] text-muted-foreground/80 leading-relaxed">{endpoint.description}</p>

                    {endpoint.auth && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] text-yellow-400 border-yellow-500/20">Auth Required</Badge>
                            <span className="text-[11px] text-muted-foreground/50">x-api-key header</span>
                        </div>
                    )}

                    {endpoint.params && endpoint.params.length > 0 && (
                        <div>
                            <h5 className="text-[12px] font-semibold text-foreground mb-2">
                                {endpoint.method === 'GET' ? 'Query Parameters' : 'Request Body'}
                            </h5>
                            <ParamTable params={endpoint.params} />
                        </div>
                    )}

                    {endpoint.exampleRequest && (
                        <div>
                            <h5 className="text-[12px] font-semibold text-foreground mb-2">Example Request</h5>
                            <CodeBlock code={endpoint.exampleRequest} language={endpoint.requestLang || 'json'} />
                        </div>
                    )}

                    {endpoint.exampleResponse && (
                        <div>
                            <h5 className="text-[12px] font-semibold text-foreground mb-2">Response</h5>
                            <CodeBlock code={endpoint.exampleResponse} />
                        </div>
                    )}

                    {endpoint.errors && (
                        <div>
                            <h5 className="text-[12px] font-semibold text-foreground mb-2">Error Codes</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {endpoint.errors.map(e => (
                                    <Badge key={e} variant="outline" className="text-[10px] font-mono text-muted-foreground/50 border-border">{e}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

const ENDPOINTS = [
    {
        method: 'GET',
        path: '/health',
        summary: 'Health Check',
        description: 'Check if the API is running and the ML model is loaded. Does not require authentication.',
        auth: false,
        exampleResponse: `{
  "status": "healthy",
  "model_loaded": true,
  "session_store_backend": "memory"
}`,
    },
    {
        method: 'POST',
        path: '/api/voice-detection',
        summary: 'Single Audio Analysis',
        description: 'Analyze a single audio sample. Accepts Base64-encoded audio and returns AI/HUMAN classification with confidence score, forensic metrics, and recommended action. Rate limited to 1,000 requests per minute.',
        auth: true,
        params: [
            { name: 'audioBase64', type: 'string', required: true, desc: 'Base64-encoded audio data (min 100 chars, max ~10MB)' },
            { name: 'language', type: 'string', required: false, desc: 'Language hint: Auto, English, Hindi, Hinglish, Mixed, Tamil, Malayalam, Telugu. Default: Auto' },
            { name: 'audioFormat', type: 'string', required: false, desc: 'Audio format: wav, mp3, flac, ogg, m4a, mp4, webm. Default: wav' },
        ],
        exampleRequest: `{
  "audioBase64": "UklGRiQAAABXQVZF...",
  "language": "Auto",
  "audioFormat": "wav"
}`,
        exampleResponse: `{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.94,
  "explanation": "Voice exhibits synthetic spectral patterns consistent with AI generation...",
  "forensic_metrics": {
    "authenticity_score": 23.5,
    "pitch_naturalness": 31.2,
    "spectral_naturalness": 18.8,
    "temporal_naturalness": 45.1
  },
  "modelUncertain": false,
  "recommendedAction": "High fraud risk. End the call and verify through an official support number."
}`,
        errors: ['400', '401', '429', '500'],
    },
    {
        method: 'POST',
        path: '/api/voice-detection/v1/session/start',
        summary: 'Start Session',
        description: 'Create a new real-time fraud analysis session. Returns a session_id used for subsequent chunk submissions.',
        auth: true,
        params: [
            { name: 'language', type: 'string', required: false, desc: 'Language hint for the session. Default: Auto' },
        ],
        exampleRequest: `{
  "language": "English"
}`,
        exampleResponse: `{
  "status": "success",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "language": "English",
  "started_at": "2026-03-03T18:00:00Z",
  "message": "Session created. Send chunks using /api/voice-detection/v1/session/{session_id}/chunk"
}`,
        errors: ['401'],
    },
    {
        method: 'POST',
        path: '/api/voice-detection/v1/session/{session_id}/chunk',
        summary: 'Analyze Chunk',
        description: 'Submit an audio chunk to an active session. Returns per-chunk risk assessment with score, CPI, voice classification, language analysis, alerts, and explainability signals. The risk engine fuses audio patterns, keyword detection, semantic intent, and behavioral trends.',
        auth: true,
        params: [
            { name: 'audioBase64', type: 'string', required: true, desc: 'Base64-encoded audio chunk' },
            { name: 'audioFormat', type: 'string', required: false, desc: 'Audio format. Default: wav' },
            { name: 'language', type: 'string', required: false, desc: 'Override session language for this chunk' },
            { name: 'source', type: 'string', required: false, desc: '"mic" for browser microphone, "file" for upload. Default: file' },
        ],
        exampleResponse: `{
  "status": "success",
  "session_id": "a1b2c3d4-...",
  "timestamp": "2026-03-03T18:00:12Z",
  "risk_score": 72,
  "cpi": 45.3,
  "risk_level": "HIGH",
  "call_label": "FRAUD",
  "model_uncertain": false,
  "voice_classification": "AI_GENERATED",
  "voice_confidence": 0.94,
  "evidence": {
    "audio_patterns": ["classification:ai_generated", "model_confidence:0.94", "authenticity_score:23.5"],
    "keywords": ["OTP", "bank_transfer"],
    "behaviour": ["semantic_coercion_detected", "acoustic_anomaly_detected"]
  },
  "language_analysis": {
    "transcript": "Please share your OTP immediately...",
    "transcript_confidence": 0.91,
    "asr_engine": "vosk-small",
    "keyword_hits": ["OTP", "bank_transfer"],
    "keyword_categories": ["credential_request", "payment_redirection"],
    "semantic_flags": ["urgency_language", "authority_impersonation"],
    "keyword_score": 65,
    "semantic_score": 58,
    "behaviour_score": 40,
    "session_behaviour_signals": ["sustained_urgency"],
    "llm_semantic_used": false
  },
  "alert": {
    "triggered": true,
    "alert_type": "FRAUD_RISK_HIGH",
    "severity": "high",
    "reason_summary": "Fraud keywords detected (OTP, bank_transfer). Coercive intent patterns detected.",
    "recommended_action": "Fraud indicators detected. Do not share OTP, PIN, passwords, or UPI credentials."
  },
  "explainability": {
    "summary": "High risk classified as FRAUD. CPI at 45.3/100. Fraud-related keywords contribute to the score.",
    "top_indicators": ["ai_voice_detected", "high_confidence_synthetic", "sustained_urgency"],
    "signal_contributions": [
      {"signal": "audio", "raw_score": 85, "weight": 0.45, "weighted_score": 38.25},
      {"signal": "keywords", "raw_score": 65, "weight": 0.20, "weighted_score": 13.0},
      {"signal": "semantic_intent", "raw_score": 58, "weight": 0.15, "weighted_score": 8.7},
      {"signal": "behaviour", "raw_score": 40, "weight": 0.20, "weighted_score": 8.0}
    ]
  },
  "chunks_processed": 5,
  "risk_policy_version": "v1.2"
}`,
        errors: ['401', '404', '409'],
    },
    {
        method: 'GET',
        path: '/api/voice-detection/v1/session/{session_id}/summary',
        summary: 'Session Summary',
        description: 'Retrieve the current cumulative summary for any session (active or ended). Includes aggregated risk, voice classification via majority voting, and alert history.',
        auth: true,
        exampleResponse: `{
  "status": "success",
  "session_id": "a1b2c3d4-...",
  "language": "English",
  "session_status": "active",
  "started_at": "2026-03-03T18:00:00Z",
  "last_update": "2026-03-03T18:02:45Z",
  "chunks_processed": 12,
  "alerts_triggered": 3,
  "max_risk_score": 82,
  "max_cpi": 71.5,
  "risk_level": "CRITICAL",
  "risk_label": "FRAUD",
  "final_call_label": "FRAUD",
  "final_voice_classification": "AI_GENERATED",
  "final_voice_confidence": 0.96,
  "max_voice_ai_confidence": 0.96,
  "voice_ai_chunks": 9,
  "voice_human_chunks": 3,
  "llm_checks_performed": 2,
  "risk_policy_version": "v1.2",
  "alert_history": [...]
}`,
        errors: ['401', '404'],
    },
    {
        method: 'GET',
        path: '/api/voice-detection/v1/session/{session_id}/alerts',
        summary: 'Alert History',
        description: 'Retrieve paginated alert history for a session. Each alert includes timestamp, risk score, severity, and recommended action. Use the limit query parameter (1–100, default 20).',
        auth: true,
        params: [
            { name: 'limit', type: 'integer', required: false, desc: 'Number of alerts to return (1–100). Default: 20' },
        ],
        exampleResponse: `{
  "status": "success",
  "session_id": "a1b2c3d4-...",
  "total_alerts": 3,
  "alerts": [
    {
      "timestamp": "2026-03-03T18:01:30Z",
      "risk_score": 72,
      "risk_level": "HIGH",
      "call_label": "FRAUD",
      "alert_type": "FRAUD_RISK_HIGH",
      "severity": "high",
      "reason_summary": "Fraud keywords detected (OTP). Coercive intent patterns detected.",
      "recommended_action": "Do not share OTP, PIN, passwords, or UPI credentials."
    }
  ]
}`,
        errors: ['400', '401', '404'],
    },
    {
        method: 'POST',
        path: '/api/voice-detection/v1/session/{session_id}/end',
        summary: 'End Session',
        description: 'Mark a session as ended. Returns the final summary with majority-vote voice classification. Sessions auto-expire based on the retention policy.',
        auth: true,
        exampleResponse: `{
  "status": "success",
  "session_id": "a1b2c3d4-...",
  "session_status": "ended",
  "final_call_label": "FRAUD",
  "final_voice_classification": "AI_GENERATED",
  "final_voice_confidence": 0.96,
  "chunks_processed": 12,
  "alerts_triggered": 3,
  "max_risk_score": 82,
  "..."
}`,
        errors: ['401', '404'],
    },
    {
        method: 'GET',
        path: '/api/voice-detection/v1/privacy/retention-policy',
        summary: 'Retention Policy',
        description: 'Returns the explicit privacy and data retention configuration. Raw audio is never persisted — only derived analytical fields are stored in-session.',
        auth: true,
        exampleResponse: `{
  "status": "success",
  "raw_audio_storage": "not_persisted",
  "active_session_retention_seconds": 1800,
  "ended_session_retention_seconds": 300,
  "stored_derived_fields": [
    "risk_history", "behaviour_score", "session_behaviour_signals",
    "transcript_counts", "semantic_flag_counts", "keyword_category_counts",
    "chunks_processed", "alerts_triggered", "max_risk_score",
    "final_call_label", "voice_ai_chunks", "voice_human_chunks",
    "max_voice_ai_confidence", "final_voice_classification", "llm_checks_performed"
  ]
}`,
        errors: ['401'],
    },
    {
        method: 'WS',
        path: '/api/voice-detection/v1/session/{session_id}/stream',
        summary: 'WebSocket Stream',
        description: 'Continuous chunk-based analysis over WebSocket. Authenticate via query parameter (?api_key=KEY) or send an auth message first. Send audio chunks as JSON; receive real-time risk updates for each. Enforces idle timeout and max connection duration.',
        auth: true,
        params: [
            { name: 'api_key', type: 'string (query)', required: false, desc: 'API key as query param (alternative to first-message auth)' },
        ],
        exampleRequest: `// First-message authentication (if not using query param)
{"type": "auth", "api_key": "YOUR_API_KEY"}

// Audio chunk message
{
  "audioBase64": "UklGRiQAAABXQVZF...",
  "audioFormat": "wav",
  "source": "mic"
}`,
        requestLang: 'json',
        exampleResponse: `// Same schema as POST /session/{id}/chunk response
{
  "status": "success",
  "session_id": "...",
  "risk_score": 72,
  "risk_level": "HIGH",
  "voice_classification": "AI_GENERATED",
  "alert": { "triggered": true, ... },
  "explainability": { ... },
  "chunks_processed": 5
}`,
    },
];

const SIDEBAR_NAV = [
    { id: 'overview', label: 'Overview' },
    { id: 'health', label: 'Health Check' },
    { id: 'voice-detection', label: 'Voice Detection' },
    { id: 'session-start', label: 'Start Session' },
    { id: 'session-chunk', label: 'Analyze Chunk' },
    { id: 'session-summary', label: 'Session Summary' },
    { id: 'session-alerts', label: 'Alert History' },
    { id: 'session-end', label: 'End Session' },
    { id: 'retention', label: 'Retention Policy' },
    { id: 'websocket', label: 'WebSocket Stream' },
];

const SECTION_IDS = [
    'overview', 'health', 'voice-detection', 'session-start',
    'session-chunk', 'session-summary', 'session-alerts',
    'session-end', 'retention', 'websocket',
];

export default function ApiReferencePage() {
    const [activeSection, setActiveSection] = useState('overview');

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
                            <ArrowLeft size={16} />
                            <span className="text-[13px]">Back</span>
                        </Link>
                        <div className="h-4 w-px bg-border/50" />
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10">
                                <Shield size={14} className="text-brand-400" />
                            </div>
                            <span className="font-heading text-[13px] font-bold tracking-[0.12em] text-foreground/80">
                                API REFERENCE
                            </span>
                        </div>
                    </div>
                    <Link to="/docs">
                        <Badge variant="outline" className="text-[11px] text-muted-foreground/60 border-border hover:border-brand-400/30 hover:text-brand-400 cursor-pointer transition-colors">
                            ← Docs
                        </Badge>
                    </Link>
                </div>
            </header>

            {/* Mobile section nav — visible below lg */}
            <div className="lg:hidden sticky top-[49px] z-40 border-b border-border/30 bg-background/90 backdrop-blur-lg">
                <div className="mx-auto max-w-7xl overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1 px-4 py-2 min-w-max">
                        {SIDEBAR_NAV.map(item => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={() => setActiveSection(item.id)}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap ${activeSection === item.id
                                        ? 'bg-brand-500/10 text-brand-400'
                                        : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/50'
                                    }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
                <div className="flex gap-10">
                    {/* Desktop sidebar */}
                    <nav className="hidden lg:block w-52 shrink-0">
                        <div className="sticky top-20 space-y-0.5">
                            {SIDEBAR_NAV.map(item => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`block rounded-lg px-3 py-1.5 text-[12px] transition-colors ${activeSection === item.id
                                        ? 'bg-brand-500/5 text-brand-400 font-medium'
                                        : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/50'
                                        }`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </nav>

                    {/* Content */}
                    <main className="min-w-0 flex-1 max-w-4xl">
                        {/* Hero */}
                        <section id="overview" className="mb-12 scroll-mt-20">
                            <Badge variant="outline" className="mb-4 text-[10px] text-muted-foreground/50 border-border">
                                REST + WebSocket
                            </Badge>
                            <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                                API Reference
                            </h1>
                            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground/80 max-w-2xl">
                                Complete endpoint reference for the VoiceGuard API. All endpoints use JSON request/response bodies
                                and require the <code className="rounded bg-accent/50 px-1.5 py-0.5 text-[12px] font-mono text-foreground/80">x-api-key</code> header unless noted.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-4">
                                <div className="rounded-lg border border-border/30 px-4 py-3">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-1">Base URL</div>
                                    <code className="text-[12px] font-mono text-foreground/80 break-all">{BASE_URL}</code>
                                </div>
                                <div className="rounded-lg border border-border/30 px-4 py-3">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-1">Rate Limit</div>
                                    <span className="text-[12px] text-foreground/80">1,000 req/min per IP</span>
                                </div>
                                <div className="rounded-lg border border-border/30 px-4 py-3">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-1">Auth</div>
                                    <code className="text-[12px] font-mono text-foreground/80">x-api-key</code>
                                </div>
                            </div>

                            {/* Quick overview counts */}
                            <div className="mt-6 flex gap-2 flex-wrap">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                    {ENDPOINTS.filter(e => e.method === 'POST').length} POST
                                </Badge>
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                                    {ENDPOINTS.filter(e => e.method === 'GET').length} GET
                                </Badge>
                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                                    {ENDPOINTS.filter(e => e.method === 'WS').length} WebSocket
                                </Badge>
                            </div>
                        </section>

                        {/* Endpoints */}
                        <div className="space-y-4">
                            {ENDPOINTS.map((endpoint, idx) => (
                                <section key={endpoint.path} id={SECTION_IDS[idx + 1]} className="scroll-mt-20">
                                    <EndpointCard endpoint={endpoint} />
                                </section>
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-12 rounded-xl border border-brand-400/10 bg-brand-500/[0.02] p-8 text-center">
                            <Zap size={24} className="mx-auto text-brand-400 mb-3" />
                            <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                                Need help integrating?
                            </h3>
                            <p className="text-[13px] text-muted-foreground/70 mb-5">
                                Check the documentation for guides, code examples, and architecture overview.
                            </p>
                            <Link
                                to="/docs"
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600"
                            >
                                Read the Docs <ChevronRight size={14} />
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
