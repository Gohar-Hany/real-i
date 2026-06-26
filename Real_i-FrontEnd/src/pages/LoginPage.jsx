import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, ArrowLeft, Brain } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(searchParams.get('register') === 'true');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const cardRef = useRef(null);
  const formRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (isRegistering && name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    let result;
    if (isRegistering) {
      result = await register(name, email, password, 'student');
    } else {
      result = await login(email, password);
    }

    setIsSubmitting(false);

    if (result && result.success) {
      toast.success(isRegistering ? 'Welcome to REAL.i!' : 'Session established');
      navigate(result.user.role === 'admin' ? '/admin' : '/student');
    } else {
      toast.error(result?.error || 'Authentication failed. Access denied.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-950 px-4">
      {/* Cyber Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-surface-500 uppercase tracking-widest hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Terminal
        </Link>

        <div ref={cardRef} className="bg-surface-900/50 backdrop-blur-xl border border-surface-800 p-8 sm:p-10 shadow-2xl relative animate-slide-up">
          {/* Cyber accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-500" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-500" />

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-surface-950 border border-primary-500/20 flex items-center justify-center text-primary-500 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                <Brain size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary-500 font-heading tracking-[0.2em] uppercase mb-2">
              REAL.i
            </h1>
            <p className="font-mono text-xs text-surface-400 tracking-widest uppercase">
              {isRegistering ? 'Initialize User Object' : 'System Authentication'}
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {isRegistering && (
              <div className="space-y-2">
                <label className="font-mono text-xs text-surface-300 uppercase tracking-wider">User.Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({...errors, name: null}); }}
                    placeholder="Enter full name"
                    className={`w-full pl-12 pr-4 py-3 bg-surface-950 border ${errors.name ? 'border-danger-500' : 'border-surface-800 focus:border-primary-500'} focus:ring-1 focus:ring-primary-500 outline-none transition-all text-surface-100 placeholder:text-surface-600 font-mono text-sm`}
                  />
                </div>
                {errors.name && <p className="text-danger-500 text-xs font-mono mt-1">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="font-mono text-xs text-surface-300 uppercase tracking-wider">User.Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: null}); }}
                  placeholder="sys.admin@real.ai"
                  className={`w-full pl-12 pr-4 py-3 bg-surface-950 border ${errors.email ? 'border-danger-500' : 'border-surface-800 focus:border-primary-500'} focus:ring-1 focus:ring-primary-500 outline-none transition-all text-surface-100 placeholder:text-surface-600 font-mono text-sm`}
                />
              </div>
              {errors.email && <p className="text-danger-500 text-xs font-mono mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-mono text-xs text-surface-300 uppercase tracking-wider">Auth.Key</label>
                {!isRegistering && (
                  <button type="button" onClick={() => toast.info('Password recovery module offline in demo version.')} className="font-mono text-xs text-primary-500 hover:text-primary-400 transition-colors uppercase">
                    Forgot Key?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({...errors, password: null}); }}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 bg-surface-950 border ${errors.password ? 'border-danger-500' : 'border-surface-800 focus:border-primary-500'} focus:ring-1 focus:ring-primary-500 outline-none transition-all text-surface-100 placeholder:text-surface-600 font-mono text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-primary-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-danger-500 text-xs font-mono mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-500 text-surface-950 font-bold font-mono text-sm uppercase tracking-widest py-3 px-4 transition-all flex items-center justify-center gap-2 mt-8 hover:bg-primary-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isRegistering ? 'Execute Build' : 'Execute Login'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-800 text-center">
            <p className="font-mono text-xs text-surface-400 uppercase">
              {isRegistering ? 'Already initialized?' : 'Object not found?'}
              {' '}
              <button
                onClick={() => { setIsRegistering(!isRegistering); setErrors({}); }}
                className="text-primary-500 font-bold hover:text-primary-400 transition-colors"
              >
                {isRegistering ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
