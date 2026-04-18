import React from "react";

interface TextareaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const CustomTextarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  rows = 4,
  error,
  iconLeft,
  iconRight,
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
          <div className="absolute top-3 left-0 flex items-start pl-3 pointer-events-none">
            {iconLeft}
          </div>
        )}
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`block w-full bg-white text-base md:text-sm px-4 py-3 border rounded-lg disabled:opacity-50 resize-y
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${iconLeft ? "pl-10" : ""} ${iconRight ? "pr-10" : ""}`}
        />
        {iconRight && (
          <div className="absolute top-3 right-0 flex items-start pr-3 pointer-events-none">
            {iconRight}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomTextarea;
