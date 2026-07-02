import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option...",
  className = "",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate dropdown position relative to viewport
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // 8px gap
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Format options if they are just strings
  const formattedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updatePosition();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-surface-950/80 border text-sm font-medium outline-none transition-all shadow-inner
          ${isOpen ? 'border-primary-500/50 ring-1 ring-primary-500/50 text-white' : 'border-surface-800 text-surface-200 hover:border-surface-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        `}
      >
        <span className={!selectedOption ? 'text-surface-500' : 'text-white'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-surface-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-400' : ''}`} 
        />
      </button>

      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 99999,
          }}
          className="rounded-xl border border-surface-700 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Solid background layer - absolutely no transparency */}
          <div className="absolute inset-0 bg-[#0d0d0d] rounded-xl" />
          
          <ul className="relative max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {formattedOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-surface-500 text-center">No options available</li>
            ) : (
              formattedOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm cursor-pointer transition-all
                    ${value === option.value 
                      ? 'bg-primary-500/10 text-primary-400 font-bold' 
                      : 'text-surface-300 hover:bg-surface-800 hover:text-white'
                    }
                  `}
                >
                  {option.label}
                  {value === option.value && <Check size={14} className="text-primary-400" />}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}
