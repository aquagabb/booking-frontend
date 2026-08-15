import React from 'react';

interface InputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onIconRightClick?: () => void;
}

const CustomInput: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onFocus,
  placeholder = '',
  required = false,
  disabled = false,
  error,
  iconLeft,
  iconRight,
  onIconRightClick
}) => {
  return (
    <div>
      {label && (
        <label className={`block text-sm font-semibold mb-2 ${error ? 'text-red-600' : 'text-gray-dark'}`}>
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative w-full">
        {iconLeft && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {iconLeft}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full h-10 text-base md:text-sm px-4 py-3 border rounded-lg bg-white disabled:opacity-50
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${iconLeft ? 'pl-10' : ''} 
              ${iconRight ? 'pr-10' : ''}`}
        />
        {iconRight && (
          <div 
            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${onIconRightClick ? 'cursor-pointer' : 'pointer-events-none'}`}
            onClick={onIconRightClick}
          >
            {iconRight}
          </div>
        )}
      </div>
      {/* no helper text; border and label color indicate errors */}
    </div>
  );
};

export default CustomInput;
