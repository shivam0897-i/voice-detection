/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { TOAST_DURATION_MS, TOAST_TYPES } from '../constants';
import { cn } from '@/lib/utils';

// Toast Context
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_STYLES = {
  [TOAST_TYPES.SUCCESS]: {
    container: 'border-success-500/15 bg-card text-success-400',
    icon: <CheckCircle size={16} aria-hidden="true" />,
  },
  [TOAST_TYPES.ERROR]: {
    container: 'border-danger-500/15 bg-card text-danger-400',
    icon: <AlertCircle size={16} aria-hidden="true" />,
  },
  [TOAST_TYPES.WARNING]: {
    container: 'border-warning-500/15 bg-card text-warning-400',
    icon: <AlertTriangle size={16} aria-hidden="true" />,
  },
  [TOAST_TYPES.INFO]: {
    container: 'border-info-500/15 bg-card text-info-400',
    icon: <Info size={16} aria-hidden="true" />,
  },
};

// Individual Toast Component
const ToastItem = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const style = TOAST_STYLES[type] || TOAST_STYLES[TOAST_TYPES.INFO];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex min-w-[300px] max-w-[420px] items-center gap-3 rounded-lg border px-4 py-3 text-[13px] shadow-2xl shadow-foreground/10 bg-card animate-slide-down',
        style.container
      )}
    >
      {style.icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        aria-label="Dismiss notification"
        className="flex cursor-pointer items-center justify-center rounded p-1 opacity-70 transition-opacity hover:opacity-100"
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
      className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5"
    >
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
