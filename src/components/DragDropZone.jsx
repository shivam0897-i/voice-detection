import { useState, useRef } from 'react';
import { Upload, FileAudio, CheckSquare } from 'lucide-react';
import '../styles/components.css';

const SUPPORTED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'mp4'];

const DragDropZone = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]);
    };

    const validateAndSetFile = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (SUPPORTED_FORMATS.includes(extension)) {
            setSelectedFile(file);
            onFileSelect(file);
        } else {
            alert("INVALID_FORMAT_DETECTED");
        }
    };

    return (
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden-input"
                accept="audio/*"
                onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
            />

            {/* Visuals */}
            <div className="scanner-line"></div>
            <div className="crosshair tl"></div>
            <div className="crosshair tr"></div>
            <div className="crosshair bl"></div>
            <div className="crosshair br"></div>

            {!selectedFile ? (
                <>
                    <Upload size={48} strokeWidth={1} style={{ opacity: 0.5, marginBottom: '20px' }} />
                    <span className="drop-text-primary">Initiate Input Sequence</span>
                    <span className="drop-text-secondary">// DRAG AUDIO FILE TO SCANNER //</span>
                </>
            ) : (
                <>
                    <div style={{ color: 'var(--color-accent-primary)', marginBottom: '16px' }}>
                        <CheckSquare size={48} strokeWidth={1} />
                    </div>
                    <span className="drop-text-primary" style={{ color: 'var(--color-accent-primary)' }}>
                        File Locked
                    </span>
                    <div className="drop-text-secondary text-mono" style={{ marginTop: '12px', border: '1px solid var(--color-border)', padding: '4px 8px' }}>
                        {selectedFile.name.toUpperCase()}
                    </div>
                </>
            )}
        </div>
    );
};

export default DragDropZone;
