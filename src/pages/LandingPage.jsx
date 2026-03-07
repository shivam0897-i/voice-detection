import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, AudioWaveform, MessageSquareText, Brain,
  Code2, Zap, Clock, Server,
  Lock, Globe, BarChart3, Check,
  Cpu, Languages, AlertTriangle, Activity,
  FileCode, Terminal, Webhook, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Particles from '@/components/ui/demo-particles';
import Hero from '@/components/ui/hero-button-expendable';
import { Badge } from '@/components/ui/Badge';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';
import CaseStudies from '@/components/ui/CaseStudies';
import Testimonials from '@/components/ui/testimonials';
import { CyberneticBentoGrid } from '@/components/ui/CyberneticBentoGrid';
import RuixenFeatureSection from '@/components/ui/RuixenFeatureSection';
import { cn } from '@/lib/utils';

const heroTransitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

const FEATURES = [
  {
    icon: <AudioWaveform className="h-5 w-5" />,
    title: 'Voice Biometrics',
    desc: 'Wav2Vec2 transformer models detect synthetic artifacts, pitch anomalies, and spectral irregularities invisible to human ears.',
    badge: '97%+ Accuracy',
  },
  {
    icon: <MessageSquareText className="h-5 w-5" />,
    title: 'Language Intelligence',
    desc: 'Real-time speech-to-text with fraud keyword detection. Identifies pressure tactics and social engineering scripts.',
    badge: '6+ Languages',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: 'Behavioral Analysis',
    desc: 'Session-level scoring tracks escalation patterns, repeated pressure, and conversational anomalies across full calls.',
    badge: 'Session-aware',
  },
];

const STATS = [
  { value: '<200ms', label: 'Latency', icon: <Zap className="h-4 w-4" /> },
  { value: '99.9%', label: 'Uptime SLA', icon: <Server className="h-4 w-4" /> },
  { value: '97%+', label: 'Accuracy', icon: <BarChart3 className="h-4 w-4" /> },
  { value: '24/7', label: 'Monitoring', icon: <Clock className="h-4 w-4" /> },
];

const INTEGRATION_FEATURES = [
  { icon: <FileCode className="h-4 w-4" />, text: 'REST API' },
  { icon: <Terminal className="h-4 w-4" />, text: 'WebSocket Streaming' },
  { icon: <Webhook className="h-4 w-4" />, text: 'Webhooks' },
  { icon: <Cpu className="h-4 w-4" />, text: 'Session Management' },
];

const CODE_SNIPPET = `// Analyze voice in real-time
const session = await voiceguard.sessions.create({
  language: 'English',
  webhookUrl: 'https://your-app.com/alerts'
});

// Stream audio chunks
const result = await session.analyzeChunk({
  audio: audioBase64,
  format: 'wav'
});

console.log(result);
// → { risk_score: 87, voice: 'AI_GENERATED',
//     alert: 'FRAUD_RISK_CRITICAL' }`;

const STAT_DESCRIPTIONS = {
  'Latency': 'Results before the sentence ends',
  'Uptime SLA': 'Built for zero-downtime operations',
  'Accuracy': 'Across all voice deepfake types',
  'Monitoring': 'Always-on threat detection',
};

function StatBentoCard({ stat }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={ref} className="bento-item">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
        {stat.icon}
      </div>
      <span className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
        {stat.value}
      </span>
      <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        {stat.label}
      </span>
      <p className="mt-2 text-[12px] text-muted-foreground/60">
        {STAT_DESCRIPTIONS[stat.label]}
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-background pt-24 pb-20 sm:pt-32">
        {/* Decorative background light beams — from hero-section-1 */}
        <div
          aria-hidden
          className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
          <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(160,60%,40%,.08)_0,hsla(160,40%,30%,.02)_50%,hsla(160,30%,25%,0)_80%)]" />
          <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(160,60%,40%,.06)_0,hsla(160,30%,25%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(160,60%,40%,.04)_0,hsla(160,30%,25%,.02)_80%,transparent_100%)]" />
        </div>
        {/* Radial vignette overlay */}
        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />

        <Hero>
          <div className="relative mx-auto max-w-6xl px-6 lg:px-8 w-full z-20">
            <div className="text-center">
              <AnimatedGroup variants={heroTransitionVariants}>
                <div className="flex justify-center">
                  <Link
                    to="/dashboard"
                    className="group mx-auto flex w-fit items-center gap-4 rounded-full border border-border bg-card/80 p-1 pl-4 shadow-md shadow-foreground/5 transition-all duration-300 hover:border-border">
                    <span className="text-[12px] font-medium text-muted-foreground">AI-Powered Voice Fraud Detection</span>
                    <span className="block h-4 w-0.5 bg-border" />
                    <div className="relative flex size-6 items-center justify-center overflow-hidden rounded-full bg-muted duration-500 group-hover:bg-primary/20">
                      <ArrowRight className="size-3 text-primary transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </div>

                <h1 className="mt-8 text-balance text-center font-heading text-[42px] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-[56px] md:text-[68px] lg:mt-16 lg:text-[76px]">
                  Detect Deepfakes
                  <br />
                  <span className="text-gradient">Before They Strike</span>
                </h1>

                <p className="mx-auto mt-8 max-w-xl text-balance text-center text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">
                  Real-time voice fraud detection API. Identify AI-generated
                  voices during live calls with{' '}
                  <span className="font-semibold text-primary">97%+ accuracy</span>{' '}
                  and <span className="font-semibold text-primary">&lt;200ms</span> latency.
                </p>
              </AnimatedGroup>
            </div>
          </div>
        </Hero>

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8 w-full z-20 mt-8">
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    delayChildren: 1,
                  },
                },
              },
              ...heroTransitionVariants,
            }}
            className="text-center">
            <p className="text-[12px] text-muted-foreground/60">
              No credit card required · 1,000 free API calls · Deploy in minutes
            </p>
          </AnimatedGroup>
        </div>

        {/* Product preview — bento-style cards */}
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.75,
                },
              },
            },
            ...heroTransitionVariants,
          }}>
          <div className="relative mt-12 sm:mt-16 md:mt-20">
            <div
              aria-hidden
              className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-75%"
            />
            <div className="mx-auto max-w-4xl px-4">
              <p className="mb-4 text-center font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
                Product Preview
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4">
                {/* Risk Score card — tall */}
                <div className="bento-item row-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Risk Score</p>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse" />
                      <span className="font-mono text-[10px] text-success-400/80">LIVE</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-heading text-6xl font-black text-danger-400">87</span>
                    <span className="mb-2 font-mono text-[13px] text-danger-400/50">/ 100</span>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-warning-400 to-danger-400" />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50">Voice</p>
                      <p className="mt-1 font-mono text-[13px] font-bold text-danger-400">AI_GEN</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50">Confidence</p>
                      <p className="mt-1 font-mono text-[13px] font-bold text-foreground/80">94.2%</p>
                    </div>
                  </div>
                </div>

                {/* Fraud Alert card */}
                <div className="bento-item" style={{ background: 'rgba(239,68,68,0.03)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-danger-400" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-danger-400">Fraud Alert</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    AI-generated voice detected with high-pressure tactics. Caller requesting sensitive credentials.
                  </p>
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning-500/[0.06] px-3 py-2">
                    <Shield size={12} className="text-warning-400" />
                    <span className="font-mono text-[11px] text-warning-400/80">
                      Do not share OTP, PIN, or payment info.
                    </span>
                  </div>
                </div>

                {/* Session Info card */}
                <div className="bento-item">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">Session</p>
                  <p className="font-mono text-[14px] font-bold text-foreground/70">A3F8D1B6</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                      <Lock size={10} /> Privacy-first
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                      <Globe size={10} /> English
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                      <Activity size={10} /> Streaming
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedGroup>

      </section>

      <section className="relative border-y border-border/50 bg-card py-16">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 80}>
                <StatBentoCard stat={stat} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-14" id="features">
        <AnimatedSection>
          <CyberneticBentoGrid />
        </AnimatedSection>
      </section>

      <section className="relative" id="how-it-works">
        <AnimatedSection>
          <RuixenFeatureSection />
        </AnimatedSection>
      </section>


      <AnimatedSection>
        <Testimonials />
      </AnimatedSection>

      <section className="relative overflow-hidden py-16">
        <AnimatedSection>
          <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
            <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
              Stop Deepfakes.
              <br />
              <span className="text-gradient">Start Shipping.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] text-muted-foreground">
              Deploy real-time voice fraud detection in your call center, banking app,
              or customer service platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 glass-backdrop">
              <Link to="/dashboard">
                <Particles>
                  Open Dashboard
                </Particles>
              </Link>
              <Link to="/pricing">
                <Button variant="secondary" size="lg" className="rounded-full h-[60px] px-8 text-[15px] font-semibold">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
