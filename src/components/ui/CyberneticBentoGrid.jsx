import React, { useEffect, useRef } from 'react';
import {
  AudioWaveform, MessageSquareText, Brain,
  Shield, Zap, Terminal, Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// Reusable BentoItem with mouse-tracking glow
const BentoItem = ({ className = '', children }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const handleMouseMove = (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      item.style.setProperty('--mouse-x', `${x}px`);
      item.style.setProperty('--mouse-y', `${y}px`);
    };

    item.addEventListener('mousemove', handleMouseMove);
    return () => item.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={itemRef} className={`bento-item ${className}`}>
      {children}
    </div>
  );
};

// Main Component
export const CyberneticBentoGrid = () => {
  return (
    <div className="bento-container">
      <div className="w-full max-w-6xl z-10">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mx-auto mb-5 text-[11px] text-muted-foreground/70 border-border">
            CAPABILITIES
          </Badge>
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
            Three Signals.{' '}
            <span className="text-gradient-static">One Verdict.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] text-muted-foreground">
            VoiceGuard fuses acoustic analysis, language intelligence, and behavioral
            patterns to deliver real-time fraud scores.
          </p>
        </div>

        <div className="bento-grid">
          {/* Large card: Voice Biometrics */}
          <BentoItem className="col-span-2 row-span-2 flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <AudioWaveform className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Voice Biometrics</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                Wav2Vec2 transformer models detect synthetic artifacts, pitch anomalies,
                and spectral irregularities invisible to human ears. Real-time spectral
                analysis across multiple frequency bands.
              </p>
              <Badge variant="default" size="sm" className="mt-4 text-[10px]">
                97%+ Accuracy
              </Badge>
            </div>
            <div className="mt-4 h-36 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden relative">
              {/* Animated waveform visualization */}
              <div className="flex items-end gap-[3px] h-16">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-primary/60"
                    style={{
                      height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`,
                      animationName: 'waveform-pulse',
                      animationDuration: `${0.8 + Math.random() * 0.8}s`,
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDirection: 'alternate',
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </BentoItem>

          {/* Language Intelligence */}
          <BentoItem>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Language Intelligence</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Real-time speech-to-text with fraud keyword detection. Identifies pressure tactics and social engineering scripts.
            </p>
            <Badge variant="default" size="sm" className="mt-3 text-[10px]">
              6+ Languages
            </Badge>
          </BentoItem>

          {/* Behavioral Analysis */}
          <BentoItem>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Behavioral Analysis</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Session-level scoring tracks escalation patterns, repeated pressure, and conversational anomalies across full calls.
            </p>
            <Badge variant="default" size="sm" className="mt-3 text-[10px]">
              Session-aware
            </Badge>
          </BentoItem>

          {/* Sub-200ms Latency — tall card */}
          <BentoItem className="row-span-2 flex flex-col justify-between">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Sub-200ms Latency</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Real-time streaming analysis with results before the sentence ends. Edge-optimized inference pipeline.
              </p>
            </div>
            <div className="mt-4 font-mono text-[11px] text-muted-foreground/70 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
                <span>p50: 87ms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>p95: 142ms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-warning-400" />
                <span>p99: 198ms</span>
              </div>
            </div>
          </BentoItem>

          {/* Privacy & Compliance — wide card */}
          <BentoItem className="col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Privacy-First Architecture</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  Zero audio storage. On-premise deployment option. SOC 2 Type II compliant.
                  Voice data processed in-memory and immediately discarded.
                </p>
              </div>
            </div>
          </BentoItem>

          {/* Global Coverage */}
          <BentoItem>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Global Coverage</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              6 languages supported with regional accent models. Deploy across all major cloud regions.
            </p>
          </BentoItem>
        </div>
      </div>
    </div>
  );
};
