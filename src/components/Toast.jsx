/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { TOAST_DURATION_MS, TOAST_TYPES } from '../constants';

// Toast Context
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast Component
const ToastItem = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    [TOAST_TYPES.SUCCESS]: <CheckCircle size={18} aria-hidden="true" />,
    [TOAST_TYPES.ERROR]: <AlertCircle size={18} aria-hidden="true" />,
    [TOAST_TYPES.WARNING]: <AlertTriangle size={18} aria-hidden="true" />,
    [TOAST_TYPES.INFO]: <Info size={18} aria-hidden="true" />,
  };

  const colors = {
    [TOAST_TYPES.SUCCESS]: { bg: 'rgba(0, 255, 0, 0.1)', border: '#00ff00', text: '#00ff00' },
    [TOAST_TYPES.ERROR]: { bg: 'rgba(255, 50, 50, 0.1)', border: '#ff3333', text: '#ff3333' },
    [TOAST_TYPES.WARNING]: { bg: 'rgba(255, 200, 0, 0.1)', border: '#ffc800', text: '#ffc800' },
    [TOAST_TYPES.INFO]: { bg: 'rgba(0, 200, 255, 0.1)', border: '#00c8ff', text: '#00c8ff' },
  };

  const color = colors[type] || colors[TOAST_TYPES.INFO];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: color.bg,
        border: `1px solid ${color.border}`,
        color: color.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.85rem',
        minWidth: '300px',
        maxWidth: '450px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onClose(id)}
        aria-label="Dismiss notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: color.text,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

// Toast Container (Portal)
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = TOAST_TYPES.INFO) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, TOAST_TYPES.SUCCESS),
    error: (msg) => addToast(msg, TOAST_TYPES.ERROR),
    warning: (msg) => addToast(msg, TOAST_TYPES.WARNING),
    info: (msg) => addToast(msg, TOAST_TYPES.INFO),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
