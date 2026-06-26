import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-lg w-full text-center">
        <div className="w-24 h-24 rounded-3xl bg-surface-900 border border-surface-800 flex items-center justify-center mx-auto mb-8 shadow-glow">
          <AlertTriangle size={48} className="text-primary-500" />
        </div>
        
        <h1 className="text-6xl font-bold text-surface-100 font-heading mb-4">404</h1>
        <h2 className="text-2xl font-bold text-primary-400 mb-6 font-mono uppercase tracking-widest">
          System Not Found
        </h2>
        
        <p className="text-surface-400 mb-10 text-lg leading-relaxed">
          The requested neural pathway does not exist. Please return to the main interface to continue your session.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-surface-950 font-bold font-mono text-sm uppercase tracking-widest hover:bg-primary-400 transition-colors duration-300"
        >
          <ArrowLeft size={20} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
