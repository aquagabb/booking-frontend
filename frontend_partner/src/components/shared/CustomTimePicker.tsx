import React, { useState, useRef, useEffect } from 'react';

interface CustomTimePickerProps {
  label?: string;
  value: string; // Format: "HH:mm" (e.g., "22:00")
  onChange: (value: string) => void; // Returns "HH:mm" format
  placeholder?: string;
  iconLeft?: React.ReactNode;
  required?: boolean;
  error?: string;
  isDisabled?: boolean;
  minTime?: string; // Format: "HH:mm" (e.g., "19:30")
  maxTime?: string; // Format: "HH:mm" (e.g., "23:59")
  /** When true (default), empty value on first mount is filled with current time rounded to 15 min */
  autoFillEmptyOnMount?: boolean;
  /** Appends 23:59 (not on the 15-min grid) for end-of-day selection */
  include2359Option?: boolean;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  iconLeft,
  required = false,
  error,
  isDisabled = false,
  minTime,
  maxTime,
  autoFillEmptyOnMount = true,
  include2359Option = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to compare times (HH:mm format)
  const compareTime = (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const total1 = h1 * 60 + m1;
    const total2 = h2 * 60 + m2;
    return total1 - total2;
  };

  // Generate time options in 15-minute intervals
  const generateTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        // Filter by minTime and maxTime
        if (minTime && compareTime(time24, minTime) < 0) {
          continue;
        }
        if (maxTime && compareTime(time24, maxTime) > 0) {
          continue;
        }
        
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        // Always format as HH:MM AM/PM
        const label = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
        
        options.push({ value: time24, label });
      }
    }

    if (include2359Option) {
      const time24 = "23:59";
      if (minTime && compareTime(time24, minTime) < 0) {
        // omit
      } else if (maxTime && compareTime(time24, maxTime) > 0) {
        // omit
      } else if (!options.some((o) => o.value === "23:59")) {
        options.push({ value: "23:59", label: "11:59 PM" });
      }
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  // Get current time rounded to next 15-minute interval
  const getCurrentTimeRounded = (): string => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    
    // Round up to next 15-minute interval
    const remainder = minutes % 15;
    if (remainder !== 0) {
      minutes = minutes + (15 - remainder);
      if (minutes >= 60) {
        minutes = 0;
        hours = (hours + 1) % 24;
      }
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!autoFillEmptyOnMount || value) return;
    const currentTime = getCurrentTimeRounded();
    onChange(currentTime);
  }, []);

  // Find the selected option
  const selectedOption = timeOptions.find(option => option.value === value);

  // Format display value
  const getDisplayValue = (): string => {
    if (!value) return '';
    const selected = timeOptions.find(opt => opt.value === value);
    return selected ? selected.label : value;
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-dark dark:text-gray-100 mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative w-full h-10">
        {iconLeft && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            {iconLeft}
          </div>
        )}
        <div
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          className={`
            block w-full h-10 bg-white dark:bg-gray-700 dark:text-gray-100 text-sm px-4 py-3 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${isOpen && !error ? 'border-primary ring-2 ring-primary' : ''}
            ${iconLeft ? 'pl-10' : ''}
            ${isDisabled ? 'cursor-not-allowed' : 'hover:border-primary dark:hover:border-primary'}
          `}
        >
          <div className="flex items-center justify-between h-full">
            <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-400'}>
              {getDisplayValue() || placeholder}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {isOpen && !isDisabled && (
          <div className="absolute z-9999 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl custom-time-picker-menu max-h-64 overflow-y-auto">
            <div className="p-1">
              {timeOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors my-0.5
                    ${value === option.value
                      ? 'bg-primary text-white font-semibold'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      <style>{`
        .z-9999 {
          z-index: 9999;
        }
        .custom-time-picker-menu {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default CustomTimePicker;

