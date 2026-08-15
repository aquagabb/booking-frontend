import React from "react";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative py-4 text-sm font-medium transition-colors ${
        isActive
          ? "text-gray-900 dark:text-gray-100"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gray-900 dark:bg-gray-100 rounded-full" />
      )}
    </button>
  );
};

export default Tab;
