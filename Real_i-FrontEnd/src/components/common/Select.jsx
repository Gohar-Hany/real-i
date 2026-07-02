import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';

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
      const dropdownHeight = 280; // max-h-60 = 240px + padding
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
    }, 250); // Matched with exit animation duration
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
      base.animation = 'premium-dropdown-exit 250ms cubic-bezier(0.3, 0, 0.2, 1) forwards';
    } else {
      base.animation = 'premium-dropdown-enter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }

    return base;
  };

  return (
    <>
      <style>{`
        @keyframes premium-dropdown-enter {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(${position.openAbove ? '15px' : '-15px'}) rotateX(${position.openAbove ? '-10deg' : '10deg'});
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0);
            filter: blur(0);
          }
        }
        @keyframes premium-dropdown-exit {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.95) translateY(${position.openAbove ? '10px' : '-10px'});
          }
        }
        @keyframes premium-item-enter {
          0% {
            opacity: 0;
            transform: translateX(-10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>

      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium outline-none transition-all duration-300 
            ${isOpen 
              ? 'bg-surface-900 border-primary-500/60 ring-4 ring-primary-500/10 text-white shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
              : 'bg-surface-950/80 border-surface-800 text-surface-200 hover:border-surface-600 hover:bg-surface-900 shadow-inner'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
          `}
        >
          <span className={`transition-colors duration-300 ${!selectedOption ? 'text-surface-500' : 'text-white'} flex items-center gap-2`}>
            {selectedOption && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary-500/10 text-primary-400' : 'bg-surface-800 text-surface-500'}`}>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </button>
      </div>

      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{
            ...getDropdownStyle(),
            perspective: '1000px',
          }}
          className="rounded-xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.9),_0_0_2px_rgba(212,175,55,0.5)] border border-surface-700"
        >
          {/* Solid Background Container - NO Transparency */}
          <div className="absolute inset-0 bg-[#0a0a0a]"></div>
          
          {/* Subtle gold accent lighting inside */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none rounded-t-xl" />
          
          <ul className="relative z-10 max-h-[260px] overflow-y-auto p-2 custom-scrollbar">
            {formattedOptions.length === 0 ? (
              <li className="px-4 py-4 text-sm text-surface-500 text-center font-mono tracking-widest uppercase">No options</li>
            ) : (
              formattedOptions.map((option, index) => {
                const isSelected = value === option.value;
                return (
                  <li
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      handleClose();
                    }}
                    style={{
                      animation: `premium-item-enter 400ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 30 + 50}ms both`,
                    }}
                    className={`relative flex items-center justify-between px-4 py-3 rounded-lg text-sm cursor-pointer transition-all duration-300 group/item overflow-hidden mb-1 last:mb-0
                      ${isSelected 
                        ? 'text-primary-400 font-bold' 
                        : 'text-surface-300 hover:text-white'
                      }
                    `}
                  >
                    {/* Hover & Active Backgrounds */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent border-l-2 border-primary-500 rounded-lg"></div>
                    )}
                    <div className="absolute inset-0 bg-surface-800/0 group-hover/item:bg-surface-800/40 rounded-lg transition-colors duration-300"></div>

                    <span className="relative z-10 flex items-center gap-3 transition-transform duration-300 group-hover/item:translate-x-1">
                      {isSelected ? (
                        <Check size={14} className="text-primary-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-surface-700 group-hover/item:bg-primary-400/50 transition-colors duration-300" />
                      )}
                      {option.label}
                    </span>
                    
                    {!isSelected && (
                      <ArrowRight size={14} className="relative z-10 text-primary-400 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
}
