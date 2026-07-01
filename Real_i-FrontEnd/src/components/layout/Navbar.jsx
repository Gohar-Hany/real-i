import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronRight, LogIn, UserPlus, Brain } from 'lucide-react';
import gsap from 'gsap';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
          ? 'bg-surface-950/80 backdrop-blur-xl border-b border-primary-500/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] h-20 flex items-center'
          : 'bg-transparent py-5 h-24 flex items-center'
      }`}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" ref={logoRef} className="flex items-center gap-3 group">
            <div className="w-10 h-10 overflow-hidden group-hover:shadow-glow transition-shadow duration-300 flex items-center justify-center">
              <img src="/Logo-removebg-preview.png" alt="REAL.i Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-500 font-heading tracking-[0.2em] leading-none uppercase">
                REAL.i
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div ref={linksRef} className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-mono text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 group ${
                  isActive(link.path)
                    ? 'text-primary-500 font-bold'
                    : 'text-surface-400 hover:text-primary-400'
                }`}
              >
                {link.label}
                {/* Non-layout-shifting underline */}
                <span 
                  className={`absolute -bottom-2 left-0 h-[2px] bg-primary-500 transition-all duration-300 ease-out ${
                    isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-1/2'
                  }`} 
                />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/student'}
                className="flex items-center gap-2 px-6 py-2 bg-transparent border border-primary-500 text-primary-500 font-mono text-xs uppercase font-bold tracking-widest hover:bg-primary-500/10 hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-all duration-300 rounded-none"
              >
                Dashboard
                <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-mono text-xs text-surface-400 uppercase tracking-widest hover:text-primary-500 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/login?register=true"
                  className="relative group bg-primary-500 text-surface-950 px-6 py-2 font-mono text-xs uppercase font-bold tracking-widest overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 rounded-none"
                >
                  <span className="relative z-10">Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-surface-400 hover:text-surface-100 transition-colors"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-navbar border-t border-surface-800/50 animate-slide-down">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-surface-800/50 space-y-2">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/student'}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl gradient-primary text-surface-950 text-sm font-semibold"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-surface-700 text-surface-300 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login?register=true"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl gradient-primary text-surface-950 text-sm font-semibold"
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
