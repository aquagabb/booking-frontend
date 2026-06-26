import React from "react";

interface SwitcherProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
  disabled?: boolean;
}

const CustomSwitcher: React.FC<SwitcherProps> = ({
  label,
  checked,
  onChange,
  error = false,
  disabled = false,
}) => {
  return (
    <div className={`flex items-center space-x-3 ${disabled ? "opacity-50" : ""}`}>
      {label && (
        <label
          className={`text-sm font-medium ${
            error ? "text-red-500" : "text-gray-700 dark:text-gray-300"
          } cursor-pointer`}
        >
          {label}
        </label>
      )}
      
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div 
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            error
              ? checked ? "bg-red-500" : "bg-red-200"
              : checked ? "bg-green" : "bg-gray-200 dark:bg-gray-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div 
            className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-gray-600 rounded-full h-5 w-5 transition-transform duration-200 ease-in-out ${
              checked ? "translate-x-5" : "translate-x-0"
            } ${checked ? "border-white dark:border-white" : ""} ${
              disabled ? "cursor-not-allowed" : ""
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default CustomSwitcher;