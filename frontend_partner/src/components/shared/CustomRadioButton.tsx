import React from "react";

interface RadioButtonProps {
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string | React.ReactNode;
  name: string;
  error?: boolean;
  className?: string;
}

const CustomRadioButton: React.FC<RadioButtonProps> = ({
  value,
  checked,
  onChange,
  label,
  name,
  error = false,
  className = "",
}) => {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        checked
          ? "border-primary bg-white dark:bg-gray-900"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      } ${error ? "border-red-500" : ""} ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="w-4 h-4 text-primary focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
      />
      <span className={`text-sm flex-1 ${
        error ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
      }`}>
        {label}
      </span>
    </label>
  );
};

export default CustomRadioButton;

