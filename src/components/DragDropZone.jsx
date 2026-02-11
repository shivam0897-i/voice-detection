import { useState, useRef } from 'react';
import { Upload, FileAudio, CheckSquare } from 'lucide-react';
import { useToast } from './Toast';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';
import '../styles/components.css';

const DragDropZone = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);
    const toast = useToast();

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
        // Check file size first
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error(`File too large - maximum size is ${MAX_FILE_SIZE_MB}MB`);
            return;
        }

        // Check format
        const extension = file.name.split('.').pop().toLowerCase();
        if (SUPPORTED_FORMATS.includes(extension)) {
            setSelectedFile(file);
            onFileSelect(file);
            toast.success(`File ready: ${file.name}`);
        } else {
            toast.error(`Unsupported format - accepted: ${SUPPORTED_FORMATS.join(', ').toUpperCase()}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current.click();
        }
    };

    return (
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={selectedFile ? `File selected: ${selectedFile.name}. Press Enter to select a different file.` : 'Drop audio file here or press Enter to browse'}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden-input"
                accept="audio/*"
                onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
                aria-label="Select audio file"
            />

            {/* Visuals */}
            <div className="scanner-line"></div>
            <div className="crosshair tl"></div>
            <div className="crosshair tr"></div>
            <div className="crosshair bl"></div>
            <div className="crosshair br"></div>

            {!selectedFile ? (
                <>
                    <Upload size={48} strokeWidth={1} style={{ opacity: 0.5, marginBottom: '20px' }} aria-hidden="true" />
                    <span className="drop-text-primary">Upload Audio File</span>
                    <span className="drop-text-secondary">Drag & drop or click to browse</span>
                </>
            ) : (
                <>
                    <div style={{ color: 'var(--color-accent-primary)', marginBottom: '16px' }}>
                        <CheckSquare size={48} strokeWidth={1} aria-hidden="true" />
                    </div>
                    <span className="drop-text-primary" style={{ color: 'var(--color-accent-primary)' }}>
                        File Selected
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

