import React from 'react';
import { AlertTriangle, CheckSquare, Cpu, Clock, RefreshCw } from 'lucide-react';
import '../styles/components.css';

const ResultCard = ({ result, loading, error, responseTime, onRetry }) => {
  if (loading) {
    return (
      <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', background: 'var(--color-bg-panel)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '16px', fontSize: '1.2rem' }}>ANALYZING…</div>
        <div style={{ width: '60%', height: '4px', background: '#333', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: 'var(--color-accent)', animation: 'scan 1.5s infinite linear', transform: 'translateX(-100%)' }}></div>
        </div>
        <div style={{ marginTop: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#666' }}>
          Analyzing audio patterns…
        </div>
        <style>{`
          @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-live="assertive" style={{ border: '1px solid #FF0000', padding: '2rem', textAlign: 'center', color: '#FF0000', background: 'rgba(255,0,0,0.05)' }}>
        <AlertTriangle size={48} style={{ marginBottom: '1rem' }} aria-hidden="true" />
        <div className="text-mono" style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {error}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid #FF0000',
              color: '#FF0000',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#FF0000'; e.target.style.color = '#000'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#FF0000'; }}
          >
            <RefreshCw size={14} aria-hidden="true" /> Try Again
          </button>
        )}
      </div>
    );
  }

  if (!result) return null;

  const isFake = result.classification === 'AI_GENERATED';
  const confidence = result.confidenceScore || 0;
  const confidencePercent = (confidence * 100).toFixed(0);

  // Design Logic
  const color = isFake ? '#FF3333' : '#00FF00'; // Red for Fake, Green for Real
  const label = isFake ? 'SYNTHETIC_DETECTED' : 'HUMAN_VERIFIED';
  const icon = isFake ? <Cpu size={64} aria-hidden="true" /> : <CheckSquare size={64} aria-hidden="true" />;

  const id = React.useMemo(() => Math.random().toString(36).substr(2, 9).toUpperCase(), [result]);

  return (
    <div 
      role="region"
      aria-live="polite"
      aria-label={`Analysis result: ${label}, confidence ${confidencePercent}%`}
      style={{ marginTop: '2rem', border: '1px solid var(--color-border)', background: '#050505', position: 'relative' }}
    >
      {/* Corner Decorations */}
      <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '20px', height: '20px', borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '20px', height: '20px', borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '0' }} className="result-grid">

        {/* Left: Verdict Panel */}
        <div style={{
          background: isFake ? 'rgba(255, 50, 50, 0.1)' : 'rgba(0, 255, 0, 0.1)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid var(--color-border)'
        }}>
          <div style={{ color: color, marginBottom: '20px' }}>{icon}</div>
          <h2 style={{ color: color, margin: '0', fontSize: '1.8rem', textAlign: 'center', lineHeight: '1.2' }}>{label}</h2>
          <div style={{ marginTop: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#888' }}>ID: {id}</div>
          
          {/* Response Time Badge */}
          {responseTime && (
            <div style={{ 
              marginTop: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(204, 255, 0, 0.1)',
              border: '1px solid #333',
            }}>
              <Clock size={12} color="#ccff00" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ccff00' }}>
                {responseTime}s
              </span>
            </div>
          )}
        </div>

        {/* Right: Analytics Panel */}
        <div style={{ padding: '40px' }}>

          {/* Confidence Meter */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#888' }}>CONFIDENCE_LEVEL</span>
              <span style={{ color: color, fontWeight: 'bold', fontSize: '1.5rem' }}>{confidencePercent}%</span>
            </div>
            <div style={{ height: '12px', background: '#222', width: '100%', position: 'relative' }}>
              {/* Ticks */}
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', justifyContent: 'space-between' }}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} style={{ width: '1px', background: '#111', height: '100%' }} />
                ))}
              </div>
              {/* Bar */}
              <div style={{
                height: '100%',
                width: `${confidencePercent}%`,
                background: color,
                boxShadow: `0 0 15px ${color}`,
                transition: 'width 1s ease-out'
              }} />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-mono)', color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>Analysis Details</h4>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', lineHeight: '1.6', color: '#EEE', borderLeft: '2px solid #333', paddingLeft: '20px' }}>
              {result.explanation}
            </p>
          </div>

          {/* Forensic Metrics */}
          {result.forensic_metrics && (
             <div style={{ marginTop: '40px', borderTop: '1px dashed #333', paddingTop: '30px' }}>
               <h4 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-mono)', color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>Forensic Telemetry</h4>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {Object.entries(result.forensic_metrics).map(([key, value]) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>
                          {key.replace('_', ' ')}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#AAA' }}>
                          {value.toFixed(1)}
                        </span>
                      </div>
                      <div style={{ height: '4px', background: '#222', width: '100%' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${Math.min(value, 100)}%`, 
                          background: value > 50 ? 'var(--color-accent)' : '#444',
                          borderRight: '1px solid #FFF' // Tech noir marker
                        }} />
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResultCard;
