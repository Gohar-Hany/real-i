import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }) {
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
            <p className="font-mono text-[10px] text-surface-500 uppercase tracking-widest">Critical Component Failure</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-surface-300 font-arabic mb-4">
            The neural interface encountered an unexpected anomaly. The error has been logged in the system registry. Please reinitialize the current session.
          </p>
          
          <div className="bg-surface-950 border border-surface-800 rounded-lg p-4 font-mono text-xs overflow-x-auto relative">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-surface-800">
              <Terminal size={14} className="text-danger-500" />
              <span className="text-danger-500 uppercase tracking-widest text-[10px]">Error StackTrace</span>
            </div>
            <pre className="text-danger-400 opacity-90 whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        </div>

        <button
          onClick={resetErrorBoundary}
          className="w-full sm:w-auto bg-danger-500/10 border border-danger-500/30 text-danger-500 hover:bg-danger-500/20 font-mono font-bold text-sm uppercase tracking-widest py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Reboot System
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
        // Clear any stuck state on reset
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
