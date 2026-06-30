import { useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, ArrowLeft, Brain } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Helmet } from 'react-helmet-async';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60; // seconds

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(searchParams.get('register') === 'true');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const cardRef = useRef(null);
  const formRef = useRef(null);

  // Check if user is locked out
  const isLockedOut = () => {
    if (!lockoutEnd) return false;
    if (Date.now() < lockoutEnd) return true;
    setLockoutEnd(null);
    setAttempts(0);
    return false;
  };

  const getRemainingLockout = () => {
    if (!lockoutEnd) return 0;
    return Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000));
  };

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

    if (isLockedOut()) {
      toast.error(`Too many attempts. Try again in ${getRemainingLockout()} seconds.`);
      return;
    }
    
    setIsSubmitting(true);

    let result;
    if (isRegistering) {
      result = await register(name, email, password, 'student');
    } else {
      result = await login(email, password);
    }

    setIsSubmitting(false);

    if (result && result.success) {
      setAttempts(0);
      toast.success(isRegistering ? 'Welcome to REAL.i!' : 'Session established');
      navigate(result.user.role === 'admin' ? '/admin' : '/student');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutEnd(Date.now() + LOCKOUT_DURATION * 1000);
        toast.error(`Account locked for ${LOCKOUT_DURATION}s due to too many failed attempts.`);
      } else {
        toast.error(result?.error || 'Authentication failed. Access denied.');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    // Simulate sending reset email
    toast.success('If an account exists with that email, a password reset link has been sent.');
    setShowForgotPassword(false);
    setForgotEmail('');
  };

  // Show timeout notice if redirected due to inactivity
  const timeoutReason = searchParams.get('reason');

  return (
    <>
      <Helmet>
        <title>REAL.i | {isRegistering ? 'Register' : 'Login'}</title>
        <meta name="description" content="Secure authentication for REAL.i platform." />
      </Helmet>
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

        {/* Timeout Notice */}
        {timeoutReason === 'timeout' && (
          <div className="mb-4 p-3 rounded-lg bg-warning-500/10 border border-warning-500/30 text-warning-400 text-xs font-mono">
            Session expired due to inactivity. Please log in again.
          </div>
        )}

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
              {showForgotPassword ? 'Password Recovery' : isRegistering ? 'Initialize User Object' : 'System Authentication'}
            </p>
          </div>

          {/* Forgot Password Form */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6 animate-fade-in">
              <p className="text-sm text-surface-400 text-center mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="font-mono text-xs text-surface-300 uppercase tracking-wider">User.Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="sys.admin@real.ai"
                    className="w-full pl-12 pr-4 py-3 bg-surface-950 border border-surface-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-surface-100 placeholder:text-surface-600 font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-500 text-surface-950 font-bold font-mono text-sm uppercase tracking-widest py-3 px-4 transition-all flex items-center justify-center gap-2 hover:bg-primary-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                Send Reset Link
                <ArrowRight size={18} />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="font-mono text-xs text-primary-500 hover:text-primary-400 transition-colors uppercase"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : (
            /* Main Login/Register Form */
            <>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {isRegistering && (
                  <div className="space-y-2">
                    <label htmlFor="auth-name" className="font-mono text-xs text-surface-300 uppercase tracking-wider">User.Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                      <input
                        id="auth-name"
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
                  <label htmlFor="auth-email" className="font-mono text-xs text-surface-300 uppercase tracking-wider">User.Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                    <input
                      id="auth-email"
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
                    <label htmlFor="auth-password" className="font-mono text-xs text-surface-300 uppercase tracking-wider">Auth.Key</label>
                    {!isRegistering && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="font-mono text-xs text-primary-500 hover:text-primary-400 transition-colors uppercase"
                      >
                        Forgot Key?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                    <input
                      id="auth-password"
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-danger-500 text-xs font-mono mt-1">{errors.password}</p>}
                </div>

                {/* Lockout Warning */}
                {isLockedOut() && (
                  <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/30 text-danger-400 text-xs font-mono text-center">
                    Too many failed attempts. Try again in {getRemainingLockout()} seconds.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isLockedOut()}
                  className="w-full bg-primary-500 text-surface-950 font-bold font-mono text-sm uppercase tracking-widest py-3 px-4 transition-all flex items-center justify-center gap-2 mt-8 hover:bg-primary-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
