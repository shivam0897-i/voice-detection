import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    Shield, BookOpen, Code2, Zap, Lock, Globe, Terminal,
    ChevronRight, Copy, Check, ArrowLeft
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

function CodeBlock({ code, language = 'bash' }) {
    return (
        <div className="relative group rounded-lg border border-border/50 bg-card/50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40">{language}</span>
            </div>
            <CopyButton text={code} />
            <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                <code className="text-muted-foreground/90 font-mono">{code}</code>
            </pre>
        </div>
    );
}

const SIDEBAR_SECTIONS = [
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'authentication', label: 'Authentication', icon: Lock },
    { id: 'quick-start', label: 'Quick Start', icon: Terminal },
    { id: 'core-concepts', label: 'Core Concepts', icon: BookOpen },
    { id: 'session-flow', label: 'Session Flow', icon: Globe },
    { id: 'error-handling', label: 'Error Handling', icon: Code2 },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState('getting-started');

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
                                DOCS
                            </span>
                        </div>
                    </div>
                    <Link to="/api-reference">
                        <Badge variant="outline" className="text-[11px] text-muted-foreground/60 border-border hover:border-brand-400/30 hover:text-brand-400 cursor-pointer transition-colors">
                            API Reference <ChevronRight size={12} className="ml-1" />
                        </Badge>
                    </Link>
                </div>
            </header>

            {/* Mobile section nav — visible below lg */}
            <div className="lg:hidden sticky top-[49px] z-40 border-b border-border/30 bg-background/90 backdrop-blur-lg">
                <div className="mx-auto max-w-7xl overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1 px-4 py-2 min-w-max">
                        {SIDEBAR_SECTIONS.map(section => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                onClick={() => setActiveSection(section.id)}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap ${activeSection === section.id
                                        ? 'bg-brand-500/10 text-brand-400'
                                        : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/50'
                                    }`}
                            >
                                {section.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
                <div className="flex gap-10">
                    {/* Desktop sidebar */}
                    <nav className="hidden lg:block w-56 shrink-0">
                        <div className="sticky top-20 space-y-1">
                            {SIDEBAR_SECTIONS.map(section => {
                                const Icon = section.icon;
                                return (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${activeSection === section.id
                                            ? 'bg-brand-500/5 text-brand-400 font-medium'
                                            : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/50'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {section.label}
                                    </a>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Content */}
                    <main className="min-w-0 flex-1 max-w-3xl">
                        {/* Hero */}
                        <div className="mb-12">
                            <Badge variant="outline" className="mb-4 text-[10px] text-muted-foreground/50 border-border">
                                v1.0
                            </Badge>
                            <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                                VoiceGuard Documentation
                            </h1>
                            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground/80">
                                Real-time AI voice fraud detection API. Detect deepfakes, analyze call risk,
                                and protect customers — all through a simple REST + WebSocket interface.
                            </p>
                        </div>

                        {/* Getting Started */}
                        <section id="getting-started" className="mb-16 scroll-mt-20">
                            <h2 className="font-heading text-xl font-bold text-foreground mb-6">Getting Started</h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Card className="group hover:border-brand-400/20 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[14px] flex items-center gap-2">
                                            <Zap size={15} className="text-brand-400" />
                                            Base URL
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <code className="text-[12px] font-mono text-muted-foreground break-all">
                                            {BASE_URL}
                                        </code>
                                    </CardContent>
                                </Card>
                                <Card className="group hover:border-brand-400/20 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[14px] flex items-center gap-2">
                                            <Globe size={15} className="text-brand-400" />
                                            Protocol
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-[13px] text-muted-foreground">
                                            REST API (JSON) + WebSocket for real-time streaming
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-6 rounded-lg border border-brand-400/10 bg-brand-500/[0.02] p-4">
                                <h4 className="text-[13px] font-semibold text-foreground mb-2">Supported Languages</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Auto', 'English', 'Hindi', 'Hinglish', 'Mixed', 'Tamil', 'Malayalam', 'Telugu'].map(lang => (
                                        <Badge key={lang} variant="outline" className="text-[10px] text-muted-foreground/60 border-border">{lang}</Badge>
                                    ))}
                                </div>
                                <h4 className="text-[13px] font-semibold text-foreground mt-4 mb-2">Supported Audio Formats</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {['wav', 'mp3', 'flac', 'ogg', 'm4a', 'mp4', 'webm'].map(fmt => (
                                        <Badge key={fmt} variant="outline" className="text-[10px] font-mono text-muted-foreground/60 border-border">{fmt}</Badge>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Authentication */}
                        <section id="authentication" className="mb-16 scroll-mt-20">
                            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Authentication</h2>
                            <p className="text-[14px] text-muted-foreground/80 mb-6 leading-relaxed">
                                All API endpoints require an API key passed via the <code className="rounded bg-accent/50 px-1.5 py-0.5 text-[12px] font-mono text-foreground/80">x-api-key</code> header.
                                For WebSocket connections, pass the key as a query parameter <code className="rounded bg-accent/50 px-1.5 py-0.5 text-[12px] font-mono text-foreground/80">?api_key=YOUR_KEY</code> or as the first message.
                            </p>

                            <CodeBlock
                                language="bash"
                                code={`curl -X POST ${BASE_URL}/api/voice-detection \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"audioBase64": "...", "language": "Auto", "audioFormat": "wav"}'`}
                            />

                            <div className="mt-4 rounded-lg border border-yellow-500/10 bg-yellow-500/[0.02] p-4">
                                <p className="text-[13px] text-muted-foreground/80">
                                    <span className="font-semibold text-yellow-500">⚠ Security:</span> Never expose your API key in client-side code.
                                    Use a backend proxy to forward requests.
                                </p>
                            </div>
                        </section>

                        {/* Quick Start */}
                        <section id="quick-start" className="mb-16 scroll-mt-20">
                            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Quick Start</h2>
                            <p className="text-[14px] text-muted-foreground/80 mb-6 leading-relaxed">
                                Analyze a single audio file in one request. Encode your audio as Base64 and send it to the detection endpoint.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[13px] font-semibold text-foreground mb-3">
                                        <Badge className="mr-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">POST</Badge>
                                        Single Audio Analysis
                                    </h4>
                                    <CodeBlock
                                        language="python"
                                        code={`import requests, base64

with open("call_recording.wav", "rb") as f:
    audio_b64 = base64.b64encode(f.read()).decode()

response = requests.post(
    "${BASE_URL}/api/voice-detection",
    headers={"x-api-key": "YOUR_API_KEY"},
    json={
        "audioBase64": audio_b64,
        "language": "Auto",       # Auto-detect language
        "audioFormat": "wav"
    }
)

result = response.json()
print(f"Classification: {result['classification']}")
print(f"Confidence: {result['confidenceScore']:.0%}")
print(f"Explanation: {result['explanation']}")`}
                                    />
                                </div>

                                <div>
                                    <h4 className="text-[13px] font-semibold text-foreground mb-3">Response</h4>
                                    <CodeBlock
                                        language="json"
                                        code={`{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.94,
  "explanation": "Voice exhibits synthetic spectral patterns...",
  "forensic_metrics": {
    "authenticity_score": 23.5,
    "pitch_naturalness": 31.2,
    "spectral_naturalness": 18.8,
    "temporal_naturalness": 45.1
  },
  "modelUncertain": false,
  "recommendedAction": "High fraud risk. End the call..."
}`}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Core Concepts */}
                        <section id="core-concepts" className="mb-16 scroll-mt-20">
                            <h2 className="font-heading text-xl font-bold text-foreground mb-6">Core Concepts</h2>

                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="text-[14px] font-semibold text-foreground mb-2">Risk Score (0–100)</h4>
                                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
                                            A fused score combining audio analysis, keyword detection, semantic intent, and behavioral patterns.
                                            Weighted fusion: audio 45%, keywords 20%, semantic 15%, behaviour 20%.
                                        </p>
                                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                            {[
                                                { label: 'LOW', range: '0–34', color: 'text-emerald-400' },
                                                { label: 'MEDIUM', range: '35–59', color: 'text-yellow-400' },
                                                { label: 'HIGH', range: '60–79', color: 'text-orange-400' },
                                                { label: 'CRITICAL', range: '80–100', color: 'text-red-400' },
                                            ].map(l => (
                                                <div key={l.label} className="rounded-lg border border-border/30 p-2">
                                                    <div className={`text-[11px] font-bold ${l.color}`}>{l.label}</div>
                                                    <div className="text-[10px] text-muted-foreground/50 mt-0.5">{l.range}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="text-[14px] font-semibold text-foreground mb-2">CPI — Conversational Pressure Index</h4>
                                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
                                            Measures how aggressively a caller is pressuring the victim. Combines behaviour score,
                                            semantic coercion, risk velocity, and AI voice ratio. A CPI ≥ 70 triggers an early warning alert
                                            even if the risk score hasn't reached HIGH.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="text-[14px] font-semibold text-foreground mb-2">Voice Classification</h4>
                                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
                                            Each chunk is classified as <code className="rounded bg-accent/50 px-1 py-0.5 text-[11px] font-mono">AI_GENERATED</code> or <code className="rounded bg-accent/50 px-1 py-0.5 text-[11px] font-mono">HUMAN</code>.
                                            Session-level classification uses majority voting across all chunks.
                                            Short chunks (&lt;2s) inherit the session's majority classification to avoid noise.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="text-[14px] font-semibold text-foreground mb-2">Forensic Metrics</h4>
                                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed mb-3">
                                            Four sub-scores (0–100) that break down voice naturalness:
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { name: 'authenticity_score', desc: 'Overall naturalness' },
                                                { name: 'pitch_naturalness', desc: 'Pitch stability & jitter' },
                                                { name: 'spectral_naturalness', desc: 'Spectral entropy & flatness' },
                                                { name: 'temporal_naturalness', desc: 'Rhythm & silence patterns' },
                                            ].map(m => (
                                                <div key={m.name} className="rounded border border-border/30 p-2">
                                                    <code className="text-[10px] font-mono text-brand-400">{m.name}</code>
                                                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{m.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Session Flow */}
                        <section id="session-flow" className="mb-16 scroll-mt-20">
                            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Session Flow</h2>
                            <p className="text-[14px] text-muted-foreground/80 mb-6 leading-relaxed">
                                For live calls, use the real-time session API. Create a session, stream audio chunks,
                                and receive per-chunk risk assessments with cumulative scoring.
                            </p>

                            <div className="space-y-3">
                                {[
                                    { step: '1', method: 'POST', name: 'Start Session', path: '/v1/session/start', desc: 'Create a new analysis session with language preference' },
                                    { step: '2', method: 'POST', name: 'Send Chunks', path: '/v1/session/{id}/chunk', desc: 'Stream Base64 audio chunks — returns risk score, CPI, alerts per chunk' },
                                    { step: '3', method: 'GET', name: 'Get Summary', path: '/v1/session/{id}/summary', desc: 'Fetch session summary with aggregated risk and voice classification' },
                                    { step: '4', method: 'POST', name: 'End Session', path: '/v1/session/{id}/end', desc: 'Mark session complete — returns final summary with majority-vote verdict' },
                                ].map(s => (
                                    <div key={s.step} className="flex items-start gap-4 rounded-lg border border-border/30 p-4 hover:border-brand-400/20 transition-colors">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[13px] font-bold text-brand-400">
                                            {s.step}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">{s.method}</Badge>
                                                <span className="text-[13px] font-semibold text-foreground">{s.name}</span>
                                            </div>
                                            <code className="text-[11px] font-mono text-muted-foreground/50">{s.path}</code>
                                            <p className="text-[12px] text-muted-foreground/60 mt-1">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h4 className="text-[13px] font-semibold text-foreground mb-3">WebSocket Alternative</h4>
                                <CodeBlock
                                    language="javascript"
                                    code={`const ws = new WebSocket(
  "wss://your-host/api/voice-detection/v1/session/{session_id}/stream?api_key=YOUR_KEY"
);

ws.onopen = () => {
  // Send audio chunks as JSON
  ws.send(JSON.stringify({
    audioBase64: chunk,
    audioFormat: "wav"
  }));
};

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log("Risk:", update.risk_score, update.risk_level);
  if (update.alert.triggered) {
    console.warn("ALERT:", update.alert.reason_summary);
  }
};`}
                                />
                            </div>
                        </section>

                        {/* Error Handling */}
                        <section id="error-handling" className="mb-16 scroll-mt-20">
                            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Error Handling</h2>
                            <p className="text-[14px] text-muted-foreground/80 mb-6 leading-relaxed">
                                All errors follow a consistent JSON structure. Rate limits are enforced at 1,000 requests/minute per IP.
                            </p>

                            <div className="overflow-x-auto rounded-lg border border-border/50">
                                <table className="w-full text-[13px]">
                                    <thead className="border-b border-border/30 bg-card/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">Code</th>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">Meaning</th>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">Common Cause</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {[
                                            { code: '400', meaning: 'Bad Request', cause: 'Invalid audio data, unsupported format, or malformed JSON' },
                                            { code: '401', meaning: 'Unauthorized', cause: 'Missing or invalid x-api-key header' },
                                            { code: '404', meaning: 'Not Found', cause: 'Session ID not found or expired' },
                                            { code: '409', meaning: 'Conflict', cause: 'Sending chunks to an ended session' },
                                            { code: '429', meaning: 'Rate Limited', cause: 'Exceeded 1,000 req/min per IP' },
                                            { code: '500', meaning: 'Server Error', cause: 'Internal processing failure' },
                                        ].map(e => (
                                            <tr key={e.code}>
                                                <td className="px-4 py-2.5">
                                                    <Badge variant="outline" className="text-[11px] font-mono border-border text-muted-foreground">{e.code}</Badge>
                                                </td>
                                                <td className="px-4 py-2.5 text-foreground/80">{e.meaning}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground/60">{e.cause}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <CodeBlock
                                language="json"
                                code={`// Error response shape
{
  "status": "error",
  "message": "Missing API key. Include 'x-api-key' header."
}`}
                            />
                        </section>

                        {/* CTA */}
                        <div className="rounded-xl border border-brand-400/10 bg-brand-500/[0.02] p-8 text-center">
                            <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                                Ready to integrate?
                            </h3>
                            <p className="text-[13px] text-muted-foreground/70 mb-5">
                                See every endpoint with full request & response schemas.
                            </p>
                            <Link
                                to="/api-reference"
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600"
                            >
                                API Reference <ChevronRight size={14} />
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
