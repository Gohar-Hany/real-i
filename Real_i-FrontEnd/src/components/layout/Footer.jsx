import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Briefcase, Mail, Heart } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const socialLinks = [
  { icon: Globe, href: '#', label: 'Website', external: false },
  { icon: MessageCircle, href: '#', label: 'Community', external: false },
  { icon: Briefcase, href: '#', label: 'Careers', external: false },
  { icon: Mail, href: 'mailto:contact@reali.edu', label: 'Email', external: false },
];

export default function Footer() {
  const { user } = useAuth();
  

  const getRoleBasedLinks = () => {
    const role = user?.role || 'guest';
    
    const baseLinks = {
      company: [
        { label: 'About REAL_i', to: '/about' },
        { label: 'Contact Support', to: '/contact' },
        { label: 'Privacy Policy', to: '/privacy-policy' },
        { label: 'Terms of Service', to: '/terms-of-service' },
      ],
    };

    if (role === 'admin') {
      return {
        platform: [
          { label: 'Home', to: '/' },
          { label: 'Admin Dashboard', to: '/admin/dashboard' },
          { label: 'Manage Users', to: '/admin/students' },
          { label: 'Manage Courses', to: '/admin/courses' },
        ],
        admin_tools: [
          { label: 'System Analytics', to: '/admin/analytics' },
          { label: 'Command Chat', to: '/admin/chat' },
          { label: 'AI Guidelines', to: '/admin/guidelines' },
        ],
        ...baseLinks
      };
    }

    if (role === 'student') {
      return {
        platform: [
          { label: 'Home', to: '/' },
          { label: 'Browse Courses', to: '/courses' },
          { label: 'Student Dashboard', to: '/student/courses' },
        ],
        learning: [
          { label: 'Study Chat (AI)', to: '/student/chat' },
          { label: 'AI Quiz Engine', to: '/student/quiz' },
          { label: 'My Performance', to: '/student/performance' },
        ],
        ...baseLinks
      };
    }

    // Guest
    return {
      platform: [
        { label: 'Home', to: '/' },
        { label: 'Browse Courses', to: '/courses' },
        { label: 'Login', to: '/login' },
        { label: 'Sign Up', to: '/register' },
      ],
      ...baseLinks
    };
  };

  const currentLinks = getRoleBasedLinks();

  return (
    <footer className="relative overflow-hidden">
      {/* Top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      
      <div className="gradient-hero">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <img src="/logo.png" alt="REAL_i" loading="lazy" width="48" height="48" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient font-heading tracking-wider">
                    REAL_i
                  </h3>
                  <p className="text-[9px] text-surface-500 tracking-[0.2em] uppercase">
                    Building Real Intelligence
                  </p>
                </div>
              </Link>
              <p className="text-surface-400 text-sm leading-relaxed max-w-sm mb-6">
                A next-generation AI-powered Learning Management System. 
                REAL_i adapts to your learning pace, evaluates your performance dynamically, and builds true intelligence.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    className="w-10 h-10 rounded-[4px] border border-surface-700 flex items-center justify-center text-surface-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(currentLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-semibold text-surface-200 uppercase tracking-wider mb-4">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.comingSoon ? (
                        <span className="text-sm text-surface-500 cursor-default flex items-center gap-1 group">
                          {link.label}
                          <span className="text-[9px] ml-1 px-1.5 py-0.5 rounded bg-surface-800 text-surface-500 font-mono uppercase">Soon</span>
                        </span>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-sm text-surface-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-1 group"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="py-6 border-t border-surface-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-surface-500">
              © {new Date().getFullYear()} REAL_i — Building Real Intelligence. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-xs text-surface-600 flex items-center gap-1">
                Crafted with <Heart size={12} className="text-primary-500 fill-primary-500" /> by REAL_i Team
              </p>
              <div className="hidden sm:block h-3 w-px bg-surface-700"></div>
              <a 
                href="https://scorpius-platform.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-900/50 border border-surface-700/50 hover:bg-surface-800 hover:border-primary-500/50 transition-all duration-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] cursor-pointer"
              >
                <span className="text-[10px] uppercase tracking-widest text-surface-500 group-hover:text-surface-400 transition-colors">
                  Developed by
                </span>
                <div className="flex items-center gap-1.5">
                  <img 
                    src="/scorpius-logo.png" 
                    alt="SCORPIUS AI Logo" 
                    className="h-5 w-auto object-contain brightness-0 invert opacity-70 group-hover:opacity-100 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" 
                  />
                  <span className="text-xs font-black tracking-widest text-surface-200 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary-300 transition-all duration-300">
                    SCORPIUS AI
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
