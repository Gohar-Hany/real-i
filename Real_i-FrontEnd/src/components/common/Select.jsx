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
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate dropdown position relative to viewport
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 260; // max-h-60 = 240px + padding
      const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setPosition({
        top: openAbove ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        openAbove,
      });
    }
  }, []);

  // Animated close
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 180);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

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
    const handleEsc = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  // Format options if they are just strings
  const formattedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      handleClose();
    } else {
      updatePosition();
      setIsOpen(true);
    }
  };

  // Animation styles
  const getDropdownStyle = () => {
    const base = {
      position: 'fixed',
      left: position.left,
      width: position.width,
      zIndex: 99999,
      transformOrigin: position.openAbove ? 'bottom center' : 'top center',
    };

    if (position.openAbove) {
      base.bottom = window.innerHeight - position.top;
    } else {
      base.top = position.top;
    }

    if (isClosing) {
      base.animation = 'select-dropdown-exit 180ms cubic-bezier(0.4, 0, 1, 1) forwards';
    } else {
      base.animation = 'select-dropdown-enter 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }

    return base;
  };

  return (
    <>
      {/* Inject keyframes once */}
      <style>{`
        @keyframes select-dropdown-enter {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(${position.openAbove ? '8px' : '-8px'});
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes select-dropdown-exit {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.95) translateY(${position.openAbove ? '8px' : '-8px'});
          }
        }
        @keyframes select-item-enter {
          0% {
            opacity: 0;
            transform: translateX(-6px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-surface-950/80 border text-sm font-medium outline-none transition-all duration-200 shadow-inner
            ${isOpen ? 'border-primary-500/50 ring-1 ring-primary-500/50 text-white shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-surface-800 text-surface-200 hover:border-surface-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
          `}
        >
          <span className={`transition-colors duration-200 ${!selectedOption ? 'text-surface-500' : 'text-white'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-all duration-300 ${isOpen ? 'rotate-180 text-primary-400' : 'text-surface-500'}`} 
          />
        </button>
      </div>

      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={getDropdownStyle()}
          className="rounded-xl border border-surface-700/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_1px_rgba(212,175,55,0.1)] overflow-hidden backdrop-blur-none"
        >
          {/* Solid background — no transparency at all */}
          <div className="absolute inset-0 bg-[#0d0d0d] rounded-xl" />
          {/* Subtle gold accent line at top */}
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
          
          <ul className="relative max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
            {formattedOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-surface-500 text-center">No options available</li>
            ) : (
              formattedOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    handleClose();
                  }}
                  style={{
                    animation: `select-item-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm cursor-pointer transition-all duration-150 group/item
                    ${value === option.value 
                      ? 'bg-primary-500/10 text-primary-400 font-bold border border-primary-500/15' 
                      : 'text-surface-300 hover:bg-surface-800/80 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <span className="flex items-center gap-2.5">
                    {value === option.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
                    )}
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check size={14} className="text-primary-400" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
}
