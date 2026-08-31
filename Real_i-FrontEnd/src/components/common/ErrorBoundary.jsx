import { useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

function isChunkLoadError(error) {
  if (!error || !error.message) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('text/html') ||
    msg.includes('mime type') ||
    msg.includes('dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('failed to load module script') ||
    msg.includes('loading chunk') ||
    msg.includes('unexpected token')
  );
}

function ErrorFallback({ error, resetErrorBoundary }) {
  useEffect(() => {
    if (isChunkLoadError(error)) {
      const lastReload = sessionStorage.getItem('reali_last_chunk_reload');
      const now = Date.now();
      // If we haven't reloaded in the last 15 seconds, auto-reload to fetch fresh deployment assets
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('reali_last_chunk_reload', String(now));
        console.warn('[ErrorBoundary] Stale chunk / MIME type error detected. Auto-reloading fresh build...');
        window.location.reload();
      }
    }
  }, [error]);

  const handleReboot = () => {
    sessionStorage.removeItem('reali_last_chunk_reload');
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass-card p-8 sm:p-12 relative overflow-hidden border-t-2 border-danger-500/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-danger-500/5 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center text-danger-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-danger-500 uppercase tracking-wide">System Exception</h1>
            <p className="font-mono text-[10px] text-surface-500 uppercase tracking-widest">Component Resolution Anomaly</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-surface-300 font-arabic mb-4">
            تم تحديث المنصة إلى إصدار أحدث. اضغط على زر إعادة التشغيل أدناه لتحديث الجلسة تلقائياً.
          </p>
          
          <div className="bg-surface-950 border border-surface-800 rounded-lg p-4 font-mono text-xs overflow-x-auto relative">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-surface-800">
              <Terminal size={14} className="text-danger-500" />
              <span className="text-danger-500 uppercase tracking-widest text-[10px]">Error Details</span>
            </div>
            <pre className="text-danger-400 opacity-90 whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        </div>

        <button
          onClick={handleReboot}
          className="w-full sm:w-auto bg-danger-500/10 border border-danger-500/30 text-danger-500 hover:bg-danger-500/20 font-mono font-bold text-sm uppercase tracking-widest py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw size={16} />
          Reboot & Refresh Session
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
