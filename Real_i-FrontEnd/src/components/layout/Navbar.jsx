import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronRight } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import gsap from 'gsap';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        opacity: 0, x: -30, duration: 0.8,
        ease: 'power3.out', delay: 0.2
      });
      // Removed linksRef GSAP animation as it can cause them to remain invisible
    }, navRef);
    return () => ctx.revert();
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/courses', label: 'Courses' },
    { path: '/contact', label: 'Contact Us' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-xl border-b h-20 flex items-center'
          : 'py-5 h-24 flex items-center'
      }`}
      style={{
        background: scrolled ? 'var(--glass-navbar-bg)' : 'transparent',
        borderColor: scrolled ? 'var(--glass-border)' : 'transparent',
        boxShadow: scrolled ? '0 4px 20px var(--shadow-card-color)' : 'none',
      }}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" ref={logoRef} className="flex items-center gap-3 group">
            <div className="w-10 h-10 overflow-hidden group-hover:shadow-glow transition-shadow duration-300 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="REAL_i Logo" 
                width="40" 
                height="40" 
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-50 dark:text-white font-heading tracking-[0.2em] leading-none">
                REAL<span className="text-primary-600 dark:text-primary-400">_i</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div ref={linksRef} className="hidden md:flex items-center gap-8 px-8 py-3 rounded-full bg-surface-900/90 dark:bg-surface-900/85 backdrop-blur-xl border border-surface-600/30 dark:border-primary-500/35 shadow-[0_4px_25px_rgba(212,175,55,0.15)]">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-mono text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 group ${
                  isActive(link.path)
                    ? 'text-primary-600 dark:text-primary-300 font-bold'
                    : 'text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-300'
                }`}
              >
                {link.label}
                {/* Non-layout-shifting underline */}
                <span 
                  className={`absolute -bottom-2 left-0 h-[2px] bg-primary-500 dark:bg-primary-400 shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300 ease-out ${
                    isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-1/2'
                  }`} 
                />
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/student'}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 font-mono text-xs uppercase font-bold tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 rounded-lg shadow-sm"
              >
                Dashboard
                <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-mono text-xs text-surface-50 dark:text-surface-200 uppercase tracking-widest hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-300 px-3 py-2 font-bold"
                >
                  Login
                </Link>
                <Link
                  to="/login?register=true"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 font-mono text-xs uppercase font-bold tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all duration-300 rounded-lg cursor-pointer shadow-sm"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-surface-50 dark:text-surface-300 hover:text-primary-600 transition-colors"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface-900 border-b border-surface-600/40 dark:border-surface-800/50 shadow-2xl animate-slide-down">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-surface-50 dark:text-surface-300 hover:bg-surface-800 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-surface-600/30 dark:border-surface-800/50 space-y-2">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/student'}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 text-sm font-bold shadow-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-surface-600/40 dark:border-surface-700 text-surface-50 dark:text-surface-200 text-sm font-bold hover:bg-surface-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login?register=true"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 text-sm font-bold shadow-sm"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
