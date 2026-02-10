import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { WAVEFORM_BARS } from '../constants';

// Shared button styles
const buttonBaseStyle = {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
};

const AudioPlayer = ({ file }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [focusedButton, setFocusedButton] = useState(null);
    const [waveformData, setWaveformData] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const audioContextRef = useRef(null);

    // Analyze audio file using Web Audio API to get real waveform data
    const analyzeAudio = useCallback(async (audioFile) => {
        if (!audioFile) return;
        
        setIsAnalyzing(true);
        
        try {
            // Create AudioContext if not exists
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const audioContext = audioContextRef.current;
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Get the audio data from the first channel
            const channelData = audioBuffer.getChannelData(0);
            const samples = channelData.length;
            const blockSize = Math.floor(samples / WAVEFORM_BARS);
            
            const waveform = [];
            
            for (let i = 0; i < WAVEFORM_BARS; i++) {
                const start = i * blockSize;
                const end = start + blockSize;
                
                // Calculate RMS (Root Mean Square) for this block
                let sum = 0;
                for (let j = start; j < end && j < samples; j++) {
                    sum += channelData[j] * channelData[j];
                }
                const rms = Math.sqrt(sum / blockSize);
                
                // Normalize to percentage height (5-40px range)
                const height = Math.max(5, Math.min(40, rms * 200));
                waveform.push(height);
            }
            
            setWaveformData(waveform);
        } catch {
            // Fallback to random waveform if analysis fails
            const fallback = [...Array(WAVEFORM_BARS)].map((_, i) => 
                15 + Math.sin(i * 0.5) * 10 + Math.random() * 10
            );
            setWaveformData(fallback);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    // Create object URL when file changes - with proper cleanup
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
        
        // Analyze the audio for real waveform
        analyzeAudio(file);
        
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file, analyzeAudio]);
    
    // Cleanup AudioContext on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Update time
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
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
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
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;
        
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleProgressKeyDown = (e) => {
        if (!audioRef.current) return;
        const step = duration * 0.05; // 5% step
        
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const newTime = Math.min(currentTime + step, duration);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const newTime = Math.max(currentTime - step, 0);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!file || !audioUrl) return null;

    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            padding: '16px',
            marginTop: '12px',
        }}>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            
            {/* File Info */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                color: '#666',
            }}>
                <span style={{ textTransform: 'uppercase' }}>Audio_Preview</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>

            {/* Waveform Visualization - Real Audio Analysis */}
            <div 
                ref={progressRef}
                onClick={handleProgressClick}
                onKeyDown={handleProgressKeyDown}
                role="slider"
                tabIndex={0}
                aria-label="Audio progress"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(currentTime)}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                style={{
                    height: '40px',
                    background: '#111',
                    position: 'relative',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 4px',
                    gap: '2px',
                }}
            >
                {/* Loading indicator while analyzing */}
                {isAnalyzing && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#111',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.7rem',
                        color: '#666',
                    }}>
                        Analyzing audioâ€¦
                    </div>
                )}
                
                {/* Real waveform bars from Web Audio API analysis */}
                {!isAnalyzing && waveformData.map((height, i) => {
                    const isPlayed = (i / WAVEFORM_BARS) * 100 <= progress;
                    return (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: `${height}px`,
                                background: isPlayed ? '#ccff00' : '#333',
                                transition: 'background 0.1s ease',
                            }}
                        />
                    );
                })}
                
                {/* Playhead */}
                <div style={{
                    position: 'absolute',
                    left: `${progress}%`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: '#fff',
                    boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                }} />
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    onFocus={() => setFocusedButton('play')}
                    onBlur={() => setFocusedButton(null)}
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                    style={{
                        ...buttonBaseStyle,
                        width: '40px',
                        height: '40px',
                        background: '#ccff00',
                        border: 'none',
                        color: '#000',
                        boxShadow: focusedButton === 'play' ? '0 0 0 3px rgba(204, 255, 0, 0.5)' : 'none',
                    }}
                >
                    {isPlaying ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
                </button>

                {/* Restart */}
                <button
                    onClick={restart}
                    onFocus={() => setFocusedButton('restart')}
                    onBlur={() => setFocusedButton(null)}
                    aria-label="Restart audio from beginning"
                    style={{
                        ...buttonBaseStyle,
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: '1px solid #444',
                        color: '#888',
                        boxShadow: focusedButton === 'restart' ? '0 0 0 3px rgba(204, 255, 0, 0.3)' : 'none',
                    }}
                >
                    <RotateCcw size={14} aria-hidden="true" />
                </button>

                {/* Time Display */}
                <div style={{
                    flex: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.9rem',
                    color: '#fff',
                }}>
                    <span style={{ color: '#ccff00' }}>{formatTime(currentTime)}</span>
                    <span style={{ color: '#444' }}> / </span>
                    <span style={{ color: '#888' }}>{formatTime(duration)}</span>
                </div>

                {/* Mute */}
                <button
                    onClick={toggleMute}
                    onFocus={() => setFocusedButton('mute')}
                    onBlur={() => setFocusedButton(null)}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    style={{
                        ...buttonBaseStyle,
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: '1px solid #444',
                        color: isMuted ? '#ff3333' : '#888',
                        boxShadow: focusedButton === 'mute' ? '0 0 0 3px rgba(204, 255, 0, 0.3)' : 'none',
                    }}
                >
                    {isMuted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
                </button>
            </div>
        </div>
    );
};

export default AudioPlayer;

