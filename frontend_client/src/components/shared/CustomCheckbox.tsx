import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean; // true dacă e invalid
  linkLabel?: string;
  linkHref?: string;
}

const CustomCheckbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  error = false,
  linkLabel,
  linkHref,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // dacă a fost click pe link, nu togglăm checkbox-ul
    if ((e.target as HTMLElement).tagName.toLowerCase() === "a") return;
    onChange(!checked);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center space-x-2 cursor-pointer select-none`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`h-4 w-4 rounded border transition-colors duration-150 cursor-pointer ${
          error
            ? "border-red-500 accent-red-500"
            : "border-gray-300 accent-primary"
        }`}
      />

      <label
        className={`text-sm ${
          error ? "text-red-500" : "text-gray-700"
        } cursor-pointer`}
      >
        {label}{" "}
        {linkLabel && linkHref && (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline ${
              error ? "text-red-500" : "text-primary"
            }`}
            onClick={(e) => e.stopPropagation()} // oprește toggle pe click
          >
            {linkLabel}
          </a>
        )}
      </label>
    </div>
  );
};

export default CustomCheckbox;
