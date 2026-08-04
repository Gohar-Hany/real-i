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
      className={`relative inline-flex items-center justify-center p-2 rounded-[4px] transition-all duration-300 group cursor-pointer ${
        isDark
          ? 'bg-[#0A1222] text-[#D4AF37] hover:bg-[#1A1A1A] border border-[#D4AF37]'
          : 'bg-white text-[#D4AF37] hover:text-[#B8860B] border border-[#D4AF37] hover:bg-gray-50'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-90 text-[#D4AF37]" />
        ) : (
          <Moon className="w-5 h-5 transition-transform duration-500 rotate-0 hover:-rotate-12 text-[#D4AF37]" />
        )}
      </div>
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
}
