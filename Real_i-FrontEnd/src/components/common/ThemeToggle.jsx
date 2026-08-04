import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      type="button"
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 group cursor-pointer ${
        isDark
          ? 'bg-surface-900/80 text-primary-400 hover:text-primary-300 hover:bg-surface-800 border border-primary-500/20 hover:border-primary-500/50 hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]'
          : 'bg-white text-primary-600 hover:text-primary-700 hover:bg-slate-50 border border-slate-200 hover:border-primary-500/40 shadow-sm hover:shadow-[0_0_12px_rgba(212,175,55,0.2)]'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-90 text-primary-400" />
        ) : (
          <Moon className="w-5 h-5 transition-transform duration-500 rotate-0 hover:-rotate-12 text-slate-700" />
        )}
      </div>
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
}
