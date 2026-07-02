import { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format options if they are just strings
  const formattedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
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

      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full mt-2 rounded-xl bg-surface-900 border border-surface-700 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up origin-top">
          <ul className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
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
        </div>
      )}
    </div>
  );
}
