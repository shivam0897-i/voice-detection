import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { Lock, Shield, BarChart3, Terminal, Clock, Download } from 'lucide-react';
import DragDropZone from './components/DragDropZone';
import LanguageSelector from './components/LanguageSelector';
import ResultCard from './components/ResultCard';
import AudioPlayer from './components/AudioPlayer';
import { detectVoice } from './services/api';
import { VIZ_INTERVAL_MS, VIZ_BAR_COUNT, HISTORY_LIMIT } from './constants';

function App() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Dynamic State
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: "SYSTEM_READY" },
    { time: new Date().toLocaleTimeString(), msg: "API_CONNECTED" },
    { time: new Date().toLocaleTimeString(), msg: "AWAITING_INPUT" }
  ]);
  const [vizData, setVizData] = useState([...Array(VIZ_BAR_COUNT)].map(() => Math.random()));

  // Visualization Loop - Pauses when page is hidden
  useEffect(() => {
    let interval = null;
    
    const startInterval = () => {
      if (interval) return;
      interval = setInterval(() => {
        setVizData(prev => prev.map(() => Math.random()));
      }, VIZ_INTERVAL_MS);
    };
    
    const stopInterval = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    };
    
    // Start initially if page is visible
    if (!document.hidden) {
      startInterval();
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Keyboard shortcut: Ctrl+Enter to analyze
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && file && !loading && !result) {
        e.preventDefault();
        handleAnalyze();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-4), { time: new Date().toLocaleTimeString(), msg }]);
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    addLog(`FILE_LOADED: ${selectedFile.name.toUpperCase()}`);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select an audio file first.");
      addLog("ERROR: NO_FILE_SELECTED");
      return;
    }
    setLoading(true);
    setError(null);
    setResponseTime(null);
    addLog("ANALYZING_AUDIO...");
    
    const startTime = performance.now();
    try {
      const data = await detectVoice(file, language);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setResponseTime(elapsed);
      setResult(data);
      addLog(`ANALYSIS_COMPLETE: ${data.classification} (${elapsed}s)`);
      
      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        fileName: file.name,
        language,
        classification: data.classification,
        confidence: data.confidenceScore,
        time: new Date().toLocaleTimeString(),
        responseTime: elapsed
      }, ...prev].slice(0, HISTORY_LIMIT)); // Keep last HISTORY_LIMIT items
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
      addLog(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      
      <header className="header-bar" role="banner">
        <div className="title-group">
          <h1>VOICEGUARD</h1>
          <p className="tagline">AI Voice Detection System // v1.0.0</p>
        </div>
        <div className="text-mono" style={{textAlign: 'right', fontSize: '0.7rem'}}>
           <div style={{color: 'var(--color-accent)'}}>SYSTEM_ONLINE</div>
           <div>SECURE_CONNECTION <Lock size={10} aria-hidden="true" /></div>
        </div>
      </header>

      <main id="main-content" className="bento-grid">
        
        {/* LEFT */}
        <aside className="bento-panel">
          <span className="panel-label">File Status</span>
          <div className="flex-between mt-20 text-mono" style={{fontSize: '0.8rem'}}>
            <span style={{color: 'var(--color-text-dim)'}}>STATUS:</span>
            <span style={{color: file ? 'var(--color-accent)' : 'var(--color-text-dim)'}}>
              {file ? 'FILE_READY' : 'NO_FILE'}
            </span>
          </div>
          <div className="flex-between mt-10 text-mono" style={{fontSize: '0.8rem'}}>
            <span style={{color: 'var(--color-text-dim)'}}>SIZE:</span>
            <span style={{color: file ? 'var(--color-accent)' : 'var(--color-text-dim)'}}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : '---'}
            </span>
          </div>
          
          <div style={{marginTop: '40px'}}>
             <span className="panel-label">Active Modules</span>
             <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
               {/* Security Module - Always Active */}
               <div style={{ opacity: 1, transition: 'opacity 0.3s ease' }}>
                  <Shield size={20} color="var(--color-success)" aria-hidden="true" />
               </div>
               
               {/* Processing Module - Active on Loading */}
               <div style={{ opacity: loading ? 1 : 0.3, transition: 'opacity 0.3s ease, transform 0.3s ease', transform: loading ? 'scale(1.1)' : 'scale(1)' }}>
                  <Terminal size={20} color={loading ? 'var(--color-accent)' : 'var(--color-text-dim)'} aria-hidden="true" />
               </div>

               {/* Result Module - Active on Result */}
               <div style={{ opacity: result ? 1 : 0.3, transition: 'opacity 0.3s ease' }}>
                  <BarChart3 size={20} color={result ? '#33ccff' : 'var(--color-text-dim)'} aria-hidden="true" />
               </div>
             </div>
          </div>
        </aside>

        {/* CENTER */}
        <section style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="bento-panel">
             <span className="panel-label">Select Language</span>
             <LanguageSelector selectedLine={language} onSelect={setLanguage} />
          </div>

          <div className="bento-panel" style={{padding: '10px'}}>
             <DragDropZone onFileSelect={handleFileSelect} />
             <AudioPlayer file={file} />
          </div>

          {file && !loading && !result && (
             <button 
               onClick={handleAnalyze}
               aria-label="Analyze audio file for AI detection (Ctrl+Enter)"
               className="analyze-button"
             >
               Analyze Audio
               <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '12px' }}>Ctrl+Enter</span>
             </button>
          )}

          <ResultCard 
            result={result} 
            loading={loading} 
            error={error} 
            responseTime={responseTime}
            onRetry={() => {
              setError(null);
              setResult(null);
            }}
          />
          
          {/* Export JSON Button */}
          {result && (
            <button
              onClick={() => {
                const dataStr = JSON.stringify(result, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `voice-analysis-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                addLog('EXPORTED: Results saved');
              }}
              aria-label="Export analysis results as JSON file"
              className="export-button"
            >
              <Download size={14} aria-hidden="true" /> Export Analysis JSON
            </button>
          )}
        </section>

        {/* RIGHT */}
        <aside className="bento-panel">
          <span className="panel-label">Live Logs</span>
          <div className="text-mono" style={{fontSize: '0.7rem', lineHeight: '1.6', color: 'var(--color-text-dim)'}}>
             {logs.map((log, i) => (
               <div key={i}>[{log.time}] {log.msg}</div>
             ))}
          </div>

          {/* Response Time Display */}
          {responseTime && (
            <div style={{marginTop: '20px', padding: '12px', background: '#111', border: '1px solid #333'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <Clock size={12} color="#ccff00" aria-hidden="true" />
                <span className="text-mono" style={{fontSize: '0.7rem', color: '#888', textTransform: 'uppercase'}}>Response_Time</span>
              </div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ccff00', fontFamily: 'var(--font-mono)'}}>
                {responseTime}s
              </div>
            </div>
          )}

          <div style={{marginTop: '20px'}}>
             <span className="panel-label">System Activity</span>
             <div style={{height: '80px', background: '#111', border: '1px solid #333', display: 'flex', alignItems: 'flex-end', padding: '5px', gap: '1px'}}>
                {vizData.map((h, i) => (
                  <div key={i} style={{flex: 1, background: 'var(--color-accent)', height: `${h * 100}%`, opacity: 0.3, transition: 'height 0.2s ease'}}></div>
                ))}
             </div>
          </div>

          {/* History Panel */}
          <div style={{marginTop: '20px'}}>
            <span className="panel-label">Analysis History</span>
            {history.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#444',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                border: '1px dashed #222',
              }}>
                No analyses yet
              </div>
            ) : (
              <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                {history.map((item) => (
                  <div key={item.id} style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span style={{color: item.classification === 'AI_GENERATED' ? '#ff3333' : '#00ff00'}}>
                        {item.classification === 'AI_GENERATED' ? '🤖' : '👤'} {item.classification}
                      </span>
                      <span style={{color: '#666'}}>{item.time}</span>
                    </div>
                    <div style={{color: '#888', fontSize: '0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {item.fileName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

      </main>

    </div>
  );
}

export default App;
