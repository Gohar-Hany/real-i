import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, ArrowLeft, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Helmet } from 'react-helmet-async';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60; // seconds

export default function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isRegistering = searchParams.get('register') === 'true';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const formRef = useRef(null);

  const toggleAuthMode = (mode) => {
    setShowForgotPassword(false);
    setErrors({});
    setAuthError(null);
    if (mode) {
      setSearchParams({ register: 'true' });
    } else {
      setSearchParams({});
    }
  };

  // Lockout countdown timer effect
  useEffect(() => {
    if (!lockoutEnd) return;
    const interval = setInterval(() => {
      const currentTimestamp = Date.now();
      setNow(currentTimestamp);
      if (currentTimestamp >= lockoutEnd) {
        setLockoutEnd(null);
        setAttempts(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  const remainingSeconds = lockoutEnd ? Math.max(0, Math.ceil((lockoutEnd - now) / 1000)) : 0;
  const lockedOut = Boolean(lockoutEnd && remainingSeconds > 0);

  const validate = () => {
    const newErrors = {};
    if (isRegistering && name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!validate()) return;

    if (lockedOut) {
      toast.error(`Too many attempts. Try again in ${remainingSeconds} seconds.`);
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
      setAuthError(null);
      toast.success(isRegistering ? 'Welcome to REAL_i!' : 'Welcome back!');
      navigate(result.user.role === 'admin' ? '/admin' : '/student');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const errMsg = result?.error || (isRegistering 
        ? 'Registration failed. Please check the entered data.' 
        : 'Incorrect email or password. Please verify your credentials.');
      
      setAuthError(errMsg);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const currentTimestamp = Date.now();
        setNow(currentTimestamp);
        setLockoutEnd(currentTimestamp + LOCKOUT_DURATION * 1000);
        toast.error(`Account locked for ${LOCKOUT_DURATION}s due to too many failed attempts.`);
      } else {
        toast.error(errMsg);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('If an account exists with that email, a password reset link has been sent.');
    setShowForgotPassword(false);
    setForgotEmail('');
  };

  const handleGoogleAuthMock = () => {
    toast.info('Google authentication will connect with your institution SSO.');
  };

  // Show timeout notice if redirected due to inactivity
  const timeoutReason = searchParams.get('reason');

  return (
    <>
      <Helmet>
        <title>REAL_i | {showForgotPassword ? 'Reset Password' : isRegistering ? 'Sign Up' : 'Sign In'}</title>
        <meta name="description" content="Secure authentication for REAL_i platform." />
      </Helmet>

      <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-surface-950 text-surface-100 selection:bg-primary-500/30 selection:text-white lg:overflow-hidden">
        
        {/* ═══════════════════════════════════════════════════════
            LEFT COLUMN — BRAND SHOWCASE (Seeraty Style Hero)
            Always luminous luxury dark hero in both modes
            ═══════════════════════════════════════════════════════ */}
        <div className="lg:w-1/2 h-full relative hidden lg:flex flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-surface-600/30 dark:border-surface-800/80 bg-[#080E24] text-white">
          
          {/* Background Layers: Rich Deep Navy Gradient + Gold Mesh + Grid */}
          <div 
            className="absolute inset-0 z-0" 
            style={{
              background: 'radial-gradient(ellipse at 15% 25%, rgba(212, 175, 55, 0.16) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(35, 65, 145, 0.50) 0%, transparent 60%), linear-gradient(180deg, #080E24 0%, #0D173B 100%)'
            }}
          />
          <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none z-0" />
          
          {/* Subtle Decorative Circuit Rings */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border border-primary-500/15 pointer-events-none z-0" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full border border-primary-500/20 pointer-events-none z-0" />

          {/* Top: Brand Logo & Wordmark */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img 
                src="/logo.webp" 
                alt="REAL_i Logo" 
                width="36"
                height="36"
                decoding="async"
                className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-transform duration-300 group-hover:scale-105" 
              />
              <span className="text-xl font-bold font-heading tracking-wider text-white">
                REAL<span className="text-primary-400">_i</span>
              </span>
            </Link>
          </div>

          {/* Middle: Headline, Subtitle & Showcase Feature Card */}
          <div className="relative z-10 my-auto py-4 max-w-xl">
            <h1 className="text-3xl xl:text-4xl font-heading font-bold text-white tracking-tight leading-[1.2] mb-4">
              Your smart cognitive <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500">
                journey starts here.
              </span>
            </h1>

            <p className="text-sm xl:text-base text-slate-300 leading-relaxed mb-6 font-sans">
              Join thousands of learners, researchers, and engineers building real intelligence through adaptive multi-agent RAG labs, cognitive simulations, and certified credentials.
            </p>

            {/* Showcase Floating Badge Card (Always dark frosted glass for contrast) */}
            <div className="relative bg-[#0E1A3D]/85 backdrop-blur-xl border border-primary-500/30 hover:border-primary-500/60 rounded-2xl p-5 shadow-2xl transition-all duration-300 group">
              
              {/* Gold Circular Score Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-br from-primary-400 to-primary-600 text-surface-950 font-bold text-xs px-3 py-0.5 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-1 font-mono">
                99%
              </div>

              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/35 flex items-center justify-center text-primary-400 shrink-0">
                  <Brain size={20} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="pr-12">
                  <h3 className="font-heading font-semibold text-base text-white tracking-tight">
                    AI Cognitive Systems Specialist
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    REAL_i Certification · Advanced Neural & RAG Architecture
                  </p>
                </div>
              </div>

            {/* Badges / Pill Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-700/60">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-500/35 text-emerald-300">
                  <CheckCircle2 size={12} />
                  Cognitive Verified
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/15 border border-primary-500/35 text-primary-300">
                  <Sparkles size={12} className="text-primary-400" />
                  Top 1% Learner
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Autonomous Agents
                </span>
              </div>
            </div>
          </div>

          {/* Bottom: Copyright / Tagline */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>© 2026 REAL_i Platform.</span>
            <span className="text-primary-400/80">Real Intelligence isn't predicted. It's built.</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT COLUMN — AUTHENTICATION FORM (Clean Modern UI)
            Adapts seamlessly between light and dark modes
            ═══════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 min-h-screen lg:h-screen flex flex-col justify-between p-5 sm:p-8 lg:p-8 xl:p-10 bg-surface-950 text-surface-200 relative overflow-y-auto">
          
          {/* Top Bar: Mobile Brand Header & Desktop Back Link */}
          <div className="flex items-center justify-between w-full mb-3 lg:mb-4">
            {/* Mobile-only Logo */}
            <div className="flex lg:hidden items-center gap-2.5">
              <img src="/logo.webp" alt="REAL_i" width="32" height="32" decoding="async" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold font-heading tracking-wider text-surface-50 dark:text-white">
                REAL<span className="text-primary-500">_i</span>
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors py-1.5 px-3 rounded-lg border border-surface-600/40 dark:border-surface-800 bg-surface-900"
              >
                <ArrowLeft size={13} />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Center Form Container */}
          <div className="w-full max-w-md mx-auto my-auto py-2">
            
            {/* Inactivity Timeout / Session Expired Notice */}
            {timeoutReason && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="leading-relaxed">
                  {timeoutReason === 'timeout' 
                    ? 'Session expired due to 30 minutes of inactivity. Please sign in again.'
                    : 'Your previous session has ended. Please sign in to continue.'}
                </span>
              </div>
            )}

            {/* Lockout Warning */}
            {lockedOut && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium text-center">
                Too many failed attempts. Try again in <span className="font-mono font-bold text-white">{remainingSeconds}s</span>.
              </div>
            )}

            {/* User-Friendly Authentication Error Alert */}
            {authError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-200">
                    {isRegistering ? 'Registration Unsuccessful' : 'Invalid Credentials'}
                  </p>
                  <p className="mt-0.5 text-slate-300 leading-relaxed">{authError}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setAuthError(null)} 
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="mb-4 sm:mb-5">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-surface-50 dark:text-white tracking-tight mb-1.5">
                {showForgotPassword
                  ? 'Reset Password'
                  : isRegistering
                  ? 'Create an account'
                  : 'Welcome back'}
              </h2>
              <p className="text-xs sm:text-sm text-surface-400">
                {showForgotPassword
                  ? 'Enter your email address and we will send you a link to reset your password.'
                  : isRegistering
                  ? 'Start your cognitive journey with REAL_i today.'
                  : 'Please enter your details to sign in.'}
              </p>
            </div>

            {/* Forgot Password View */}
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-3.5 animate-fade-in">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-surface-200 dark:text-surface-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={17} />
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setAuthError(null); }}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-surface-900 border border-surface-600/50 dark:border-surface-700/80 rounded-xl text-surface-50 dark:text-surface-100 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 font-bold py-2.5 sm:py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 flex items-center justify-center gap-2 text-sm font-sans cursor-pointer mt-2"
                >
                  Send Reset Link
                  <ArrowRight size={16} />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setAuthError(null); }}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              /* Main Sign In / Sign Up Form */
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3.5 animate-fade-in">
                
                {/* Full Name field (Register only) */}
                {isRegistering && (
                  <div>
                    <label htmlFor="auth-name" className="block text-xs font-semibold uppercase tracking-wider text-surface-200 dark:text-surface-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={17} />
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        onChange={(e) => { 
                          setName(e.target.value); 
                          if (errors.name) setErrors({...errors, name: null}); 
                          if (authError) setAuthError(null);
                        }}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-2.5 bg-surface-900 border ${errors.name || authError ? 'border-red-500/60 focus:border-red-500' : 'border-surface-600/50 dark:border-surface-700/80 focus:border-primary-500'} rounded-xl text-surface-50 dark:text-surface-100 placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm`}
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                )}

                {/* Email field */}
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-surface-200 dark:text-surface-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={17} />
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => { 
                        setEmail(e.target.value); 
                        if (errors.email) setErrors({...errors, email: null}); 
                        if (authError) setAuthError(null);
                      }}
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-surface-900 border ${errors.email || authError ? 'border-red-500/60 focus:border-red-500' : 'border-surface-600/50 dark:border-surface-700/80 focus:border-primary-500'} rounded-xl text-surface-50 dark:text-surface-100 placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-surface-200 dark:text-surface-300">
                      Password
                    </label>
                    {!isRegistering && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setAuthError(null); }}
                        className="text-xs text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors font-semibold"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={17} />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { 
                        setPassword(e.target.value); 
                        if (errors.password) setErrors({...errors, password: null}); 
                        if (authError) setAuthError(null);
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-surface-900 border ${errors.password || authError ? 'border-red-500/60 focus:border-red-500' : 'border-surface-600/50 dark:border-surface-700/80 focus:border-primary-500'} rounded-xl text-surface-50 dark:text-surface-100 placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-primary-500 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || lockedOut}
                  className="w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 font-bold py-2.5 sm:py-3 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 flex items-center justify-center gap-2 text-sm font-sans mt-3.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{isRegistering ? 'Sign Up' : 'Sign In'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* OR Divider */}
                <div className="relative my-3 sm:my-3.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-600/30 dark:border-surface-800" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-surface-950 px-3 text-surface-400 font-mono">OR</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuthMock}
                  className="w-full py-2.5 sm:py-3 px-4 bg-surface-900 hover:bg-surface-800/80 border border-surface-600/50 dark:border-surface-800 rounded-xl text-surface-200 dark:text-surface-200 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="group-hover:text-surface-50 dark:group-hover:text-white transition-colors">Continue with Google</span>
                </button>

                {/* Switch between Sign In / Sign Up */}
                <div className="pt-2 text-center">
                  <p className="text-xs sm:text-sm text-surface-400">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => toggleAuthMode(!isRegistering)}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold transition-colors inline-block ml-1"
                    >
                      {isRegistering ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="text-center lg:text-left text-[11px] sm:text-xs text-surface-400 pt-2 lg:pt-3">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 underline underline-offset-2 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 underline underline-offset-2 font-medium">
              Privacy Policy
            </Link>.
          </div>
        </div>

      </div>
    </>
  );
}

