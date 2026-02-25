import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { WAVEFORM_BARS } from '../constants';

const AudioPlayer = ({ file }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [waveformData, setWaveformData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const audioContextRef = useRef(null);

  const analyzeAudio = useCallback(async (audioFile) => {
    if (!audioFile) return;
    setIsAnalyzing(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const samples = channelData.length;
      const blockSize = Math.floor(samples / WAVEFORM_BARS);
      const waveform = [];
      for (let i = 0; i < WAVEFORM_BARS; i++) {
        const start = i * blockSize;
        const end = start + blockSize;
        let sum = 0;
        for (let j = start; j < end && j < samples; j++) {
          sum += channelData[j] * channelData[j];
        }
        const rms = Math.sqrt(sum / blockSize);
        waveform.push(Math.max(5, Math.min(32, rms * 200)));
      }
      setWaveformData(waveform);
    } catch {
      setWaveformData(
        [...Array(WAVEFORM_BARS)].map((_, i) => 10 + Math.sin(i * 0.5) * 8 + Math.random() * 8),
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (!file) {
      setAudioUrl(null);
      setCurrentTime(0);
      setIsPlaying(false);
      setWaveformData([]);
      return;
    }
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setCurrentTime(0);
    setIsPlaying(false);
    analyzeAudio(file);
    return () => URL.revokeObjectURL(url);
  }, [file, analyzeAudio]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const handleProgressKeyDown = (e) => {
    if (!audioRef.current) return;
    const step = duration * 0.05;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const t = Math.min(currentTime + step, duration);
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const t = Math.max(currentTime - step, 0);
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  const fmt = (t) => {
    if (isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!file || !audioUrl) return null;

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="audio-player-header">
        <span className="audio-player-title">Audio Preview</span>
        <span className="audio-player-title">{(file.size / 1024).toFixed(1)} KB</span>
      </div>

      {/* Waveform */}
      <div className="audio-player-waveform">
        {isAnalyzing && (
          <span className="audio-player-title" style={{ margin: 'auto' }}>Analyzing…</span>
        )}
        {!isAnalyzing &&
          waveformData.map((h, i) => (
            <div
              key={i}
              className={`audio-player-waveform-bar${(i / WAVEFORM_BARS) * 100 <= progress ? ' active' : ''}`}
              style={{ height: `${h}px` }}
            />
          ))}
      </div>

      {/* Progress bar */}
      <div
        ref={progressRef}
        className="audio-player-progress"
        onClick={handleProgressClick}
        onKeyDown={handleProgressKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Audio progress"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${fmt(currentTime)} of ${fmt(duration)}`}
        style={{ margin: 'var(--space-3) 0' }}
      >
        <div className="audio-player-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Controls row */}
      <div className="audio-player-controls">
        <button className="audio-player-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>
          {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <button className="audio-player-btn" onClick={restart} aria-label="Restart audio">
          <RotateCcw size={14} aria-hidden="true" />
        </button>

        <span className="audio-player-time" style={{ flex: 1, textAlign: 'left' }}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        <button className="audio-player-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
