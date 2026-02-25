import { memo } from 'react';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

const HeroSection = memo(function HeroSection() {
  return (
  <section className="hero-section">
    <h2 className="hero-title">
      Detect Voice Fraud<br />Before It&nbsp;Costs&nbsp;You
    </h2>
    <p className="hero-subtitle">
      Upload a call recording or stream live audio. Our AI analyzes voice patterns,
      language cues, and behavioral signals to identify fraud in real time.
    </p>
    <div className="hero-stats" aria-label="Platform capabilities">
      <span className="hero-stat">
        <ShieldCheck size={13} aria-hidden="true" />
        <strong>Wav2Vec2</strong> Model
      </span>
      <span className="hero-stat">
        <Zap size={13} aria-hidden="true" />
        <strong>Real-time</strong> Streaming
      </span>
      <span className="hero-stat">
        <Globe size={13} aria-hidden="true" />
        <strong>5</strong> Languages
      </span>
    </div>
  </section>
  );
});

export default HeroSection;
