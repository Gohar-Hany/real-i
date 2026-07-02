import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Briefcase, Mail, Heart, ExternalLink } from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'Home', to: '/' },
    { label: 'Courses', to: '/courses' },
    { label: 'Student Portal', to: '/student' },
    { label: 'Admin Panel', to: '/admin' },
  ],
  resources: [
    { label: 'Documentation', to: '#', comingSoon: true },
    { label: 'API Reference', to: '#', comingSoon: true },
    { label: 'Community', to: '#', comingSoon: true },
    { label: 'Blog', to: '#', comingSoon: true },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '#', comingSoon: true },
    { label: 'Terms of Service', to: '#', comingSoon: true },
  ],
};

const socialLinks = [
  { icon: Globe, href: 'https://real-i.ai', label: 'Website', external: true },
  { icon: MessageCircle, href: 'https://discord.gg/reali', label: 'Community', external: true },
  { icon: Briefcase, href: 'https://linkedin.com/company/reali', label: 'Careers', external: true },
  { icon: Mail, href: 'mailto:contact@real.ai', label: 'Email', external: false },
];

export default function Footer() {
  const handleComingSoon = (e, link) => {
    if (link.comingSoon) {
      e.preventDefault();
    }
  };

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
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-glow group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300">
                  <img src="/logo.png" alt="REAL.i" loading="lazy" width="48" height="48" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient font-heading tracking-wider">
                    REAL.i
                  </h3>
                  <p className="text-[9px] text-surface-500 tracking-[0.2em] uppercase">
                    Building Real Intelligence
                  </p>
                </div>
              </Link>
              <p className="text-surface-400 text-sm leading-relaxed max-w-sm mb-6">
                An AI-powered educational platform that builds real intelligence through 
                adaptive learning, smart quizzes, and personalized AI study assistants.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.external ? '_blank' : undefined}
                    rel={social.external ? 'noopener noreferrer' : undefined}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-surface-400 hover:text-primary-400 hover:border-primary-500/30 transition-all duration-300 hover:shadow-glow-sm"
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
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
          <div className="py-6 border-t border-surface-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-surface-500">
              © {new Date().getFullYear()} REAL.i — Building Real Intelligence. All rights reserved.
            </p>
            <p className="text-xs text-surface-600 flex items-center gap-1">
              Crafted with <Heart size={12} className="text-primary-500 fill-primary-500" /> by REAL.i Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
