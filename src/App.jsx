import { useState, useEffect } from 'react';
import './index.css';
import { Lock, Cpu, CheckSquare, Shield, Activity, BarChart3, Terminal } from 'lucide-react';
import DragDropZone from './components/DragDropZone';
import LanguageSelector from './components/LanguageSelector';
import ResultCard from './components/ResultCard';
import { detectVoice } from './services/api';

function App() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  // Dynamic State
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: "SYSTEM_INITIALIZED" },
    { time: new Date().toLocaleTimeString(), msg: "CORE_SYNC_OK" },
    { time: new Date().toLocaleTimeString(), msg: "READY_FOR_STREAM" }
  ]);
  const [vizData, setVizData] = useState([...Array(30)].map(() => Math.random()));

  // Visualization Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVizData(prev => prev.map(() => Math.random()));
    }, 200);
    return () => clearInterval(interval);
  }, []);

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
      addLog("ERROR: NO_INPUT_SOURCE");
      return;
    }
    setLoading(true);
    setError(null);
    addLog("INITIATING_FORENSIC_SWEEP...");
    
    try {
      const data = await detectVoice(file, language);
      setResult(data);
      addLog(`ANALYSIS_COMPLETE: ${data.classification}`);
    } catch (err) {
      setError(err.message || "UNIDENTIFIED_ERR_04");
      addLog(`SYSTEM_ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      
      <header className="header-bar">
        <div className="title-group">
          <h1>VOICEGUARD</h1>
          <div className="tagline">Forensic Audio Authentication Unit // v.2.0.4</div>
        </div>
        <div className="text-mono" style={{textAlign: 'right', fontSize: '0.7rem'}}>
           <div style={{color: 'var(--color-accent)'}}>SYSTEM_ONLINE_V2</div>
           <div>ENCRYPTION_ACTIVE <Lock size={10} /></div>
        </div>
      </header>

      <main className="bento-grid">
        
        {/* LEFT */}
        <aside className="bento-panel">
          <span className="panel-label">Telemetry Setup</span>
          <div className="flex-between mt-20 text-mono" style={{fontSize: '0.8rem'}}>
            <span style={{color: 'var(--color-text-dim)'}}>INPUT_SOURCE:</span>
            <span style={{color: file ? 'var(--color-text-primary)' : 'var(--color-text-dim)'}}>
              {file ? 'AUDIO_BUFFER' : 'NO_SIGNAL'}
            </span>
          </div>
          <div className="flex-between mt-10 text-mono" style={{fontSize: '0.8rem'}}>
            <span style={{color: 'var(--color-text-dim)'}}>FREQ_BAND:</span>
            <span style={{color: file ? 'var(--color-accent)' : 'var(--color-text-dim)'}}>
              {file ? '44.1 KHZ' : '---'}
            </span>
          </div>
          
          <div style={{marginTop: '40px'}}>
             <span className="panel-label">Active Modules</span>
             <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
               {/* Security Module - Always Active */}
               <div style={{ opacity: 1, transition: 'all 0.3s ease' }}>
                  <Shield size={20} color="var(--color-success)" />
               </div>
               
               {/* Processing Module - Active on Loading */}
               <div style={{ opacity: loading ? 1 : 0.3, transition: 'all 0.3s ease', transform: loading ? 'scale(1.1)' : 'scale(1)' }}>
                  <Terminal size={20} color={loading ? 'var(--color-accent)' : 'var(--color-text-dim)'} />
               </div>

               {/* Result Module - Active on Result */}
               <div style={{ opacity: result ? 1 : 0.3, transition: 'all 0.3s ease' }}>
                  <BarChart3 size={20} color={result ? '#33ccff' : 'var(--color-text-dim)'} />
               </div>
             </div>
          </div>
        </aside>

        {/* CENTER */}
        <section style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="bento-panel">
             <span className="panel-label">Analysis Target Parameter</span>
             <LanguageSelector selectedLine={language} onSelect={setLanguage} />
          </div>

          <div className="bento-panel" style={{padding: '10px'}}>
             <DragDropZone onFileSelect={handleFileSelect} />
          </div>

          {file && !loading && !result && (
             <button 
               onClick={handleAnalyze}
               style={{
                 width: '100%', padding: '20px',
                 background: 'var(--color-accent)', color: '#000',
                 border: 'none', fontStyle: 'italic',
                 fontWeight: 'bold', textTransform: 'uppercase',
                 cursor: 'pointer', fontFamily: 'var(--font-mono)',
                 fontSize: '1.2rem'
               }}
             >
               Execute Forensic Sweep
             </button>
          )}

          <ResultCard result={result} loading={loading} error={error} />
        </section>

        {/* RIGHT */}
        <aside className="bento-panel">
          <span className="panel-label">Live Logs</span>
          <div className="text-mono" style={{fontSize: '0.7rem', lineHeight: '1.6', color: 'var(--color-text-dim)'}}>
             {logs.map((log, i) => (
               <div key={i}>[{log.time}] {log.msg}</div>
             ))}
          </div>

          <div style={{marginTop: '40px'}}>
             <span className="panel-label">Neural Weight Density</span>
             <div style={{height: '80px', background: '#111', border: '1px solid #333', display: 'flex', alignItems: 'flex-end', padding: '5px', gap: '1px'}}>
                {vizData.map((h, i) => (
                  <div key={i} style={{flex: 1, background: 'var(--color-accent)', height: `${h * 100}%`, opacity: 0.3, transition: 'height 0.2s ease'}}></div>
                ))}
             </div>
          </div>
        </aside>

      </main>

    </div>
  );
}

export default App;
