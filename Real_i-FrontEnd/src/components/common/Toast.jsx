import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_TITLES = {
  success: 'Success',
  error: 'Action Failed',
  warning: 'Notice',
  info: 'Information',
};

const TOAST_STYLES = {
  success: 'bg-[#081C16]/95 border-emerald-500/40 text-emerald-200 shadow-[0_8px_32px_rgba(16,185,129,0.2)]',
  error: 'bg-[#1D0A11]/95 border-red-500/50 text-red-200 shadow-[0_8px_32px_rgba(239,68,68,0.25)]',
  warning: 'bg-[#1D1608]/95 border-amber-500/40 text-amber-200 shadow-[0_8px_32px_rgba(245,158,11,0.2)]',
  info: 'bg-[#0A162D]/95 border-primary-500/40 text-primary-200 shadow-[0_8px_32px_rgba(212,175,55,0.2)]',
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-primary-400',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success', 4000),
    error: (msg) => addToast(msg, 'error', 6500),
    warning: (msg) => addToast(msg, 'warning', 5000),
    info: (msg) => addToast(msg, 'info', 4000),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[150] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl transition-all duration-300 animate-slide-up ${TOAST_STYLES[t.type]}`}
              role="alert"
            >
              <div className={`shrink-0 mt-0.5 ${ICON_COLORS[t.type]}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-75 mb-0.5">
                  {TOAST_TITLES[t.type]}
                </p>
                <p className="text-xs font-medium leading-relaxed break-words text-slate-100">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
