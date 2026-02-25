import { useState, useRef } from 'react';
import { Upload, FileCheck } from 'lucide-react';
import { useToast } from './Toast';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../constants';

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
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File too large — maximum size is ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    if (SUPPORTED_FORMATS.includes(extension)) {
      setSelectedFile(file);
      onFileSelect(file);
      toast.success(`File ready: ${file.name}`);
    } else {
      toast.error(`Unsupported format — accepted: ${SUPPORTED_FORMATS.join(', ').toUpperCase()}`);
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
      aria-label={
        selectedFile
          ? `File selected: ${selectedFile.name}. Press Enter to change.`
          : 'Drop audio file here or press Enter to browse'
      }
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden-input"
        accept="audio/*"
        onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
        aria-label="Select audio file"
      />

      {!selectedFile ? (
        <>
          <Upload size={40} strokeWidth={1.5} className="drop-zone-icon" aria-hidden="true" />
          <span className="drop-zone-text">Upload Audio File</span>
          <span className="drop-zone-hint">Drag & drop or click to browse · WAV, MP3, FLAC, OGG</span>
        </>
      ) : (
        <>
          <FileCheck size={40} strokeWidth={1.5} className="drop-zone-icon" aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
          <span className="drop-zone-text" style={{ color: 'var(--color-accent)' }}>File Selected</span>
          <div className="drop-zone-selected">
            {selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)} KB
          </div>
        </>
      )}
    </div>
  );
};

export default DragDropZone;

