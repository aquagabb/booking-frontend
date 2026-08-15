import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

export type MessageType = "success" | "error" | "warning" | "info";
export type MessageVariant = "filled" | "outlined" | "subtle";

export interface MessageProps {
  type: MessageType;
  message: string;
  variant?: MessageVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const Message: React.FC<MessageProps> = ({
  type,
  message,
  variant = "filled",
  dismissible = false,
  onDismiss,
  className = "",
  icon,
}) => {
  // Icon mapping
  const iconMap: Record<MessageType, React.ReactNode> = {
    success: <CheckCircle2 size={20} className="flex-shrink-0" />,
    error: <XCircle size={20} className="flex-shrink-0" />,
    warning: <AlertCircle size={20} className="flex-shrink-0" />,
    info: <Info size={20} className="flex-shrink-0" />,
  };

  // Color schemes based on type and variant
  const getStyles = (): string => {
    const baseStyles = "flex items-start gap-3 rounded-lg px-4 py-3 text-sm  transition-all";
    
    if (variant === "filled") {
      switch (type) {
        case "success":
          return `${baseStyles} bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-300`;
        case "error":
          return `${baseStyles} bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-300`;
        case "warning":
          return `${baseStyles} bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-300`;
        case "info":
          return `${baseStyles} bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300`;
        default:
          return baseStyles;
      }
    } else if (variant === "outlined") {
      switch (type) {
        case "success":
          return `${baseStyles} bg-transparent border-2 border-green-500 text-green-700 dark:border-green-400 dark:text-green-300`;
        case "error":
          return `${baseStyles} bg-transparent border-2 border-red-500 text-red-700 dark:border-red-400 dark:text-red-300`;
        case "warning":
          return `${baseStyles} bg-transparent border-2 border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-300`;
        case "info":
          return `${baseStyles} bg-transparent border-2 border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300`;
        default:
          return baseStyles;
      }
    } else {
      // subtle variant
      switch (type) {
        case "success":
          return `${baseStyles} bg-green-100/50 border border-green-300/50 text-green-900 dark:bg-green-900/10 dark:border-green-700/20 dark:text-green-200`;
        case "error":
          return `${baseStyles} bg-red-100/50 border border-red-300/50 text-red-900 dark:bg-red-900/10 dark:border-red-700/20 dark:text-red-200`;
        case "warning":
          return `${baseStyles} bg-amber-100/50 border border-amber-300/50 text-amber-900 dark:bg-amber-900/10 dark:border-amber-700/20 dark:text-amber-200`;
        case "info":
          return `${baseStyles} bg-blue-100/50 border border-blue-300/50 text-blue-900 dark:bg-blue-900/10 dark:border-blue-700/20 dark:text-blue-200`;
        default:
          return baseStyles;
      }
    }
  };

  const getIconColor = (): string => {
    if (variant === "filled") {
      switch (type) {
        case "success":
          return "text-green-600 dark:text-green-400";
        case "error":
          return "text-red-600 dark:text-red-400";
        case "warning":
          return "text-amber-600 dark:text-amber-400";
        case "info":
          return "text-blue-600 dark:text-blue-400";
        default:
          return "";
      }
    } else if (variant === "outlined") {
      switch (type) {
        case "success":
          return "text-green-600 dark:text-green-400";
        case "error":
          return "text-red-600 dark:text-red-400";
        case "warning":
          return "text-amber-600 dark:text-amber-400";
        case "info":
          return "text-blue-600 dark:text-blue-400";
        default:
          return "";
      }
    } else {
      // subtle
      switch (type) {
        case "success":
          return "text-green-700 dark:text-green-300";
        case "error":
          return "text-red-700 dark:text-red-300";
        case "warning":
          return "text-amber-700 dark:text-amber-300";
        case "info":
          return "text-blue-700 dark:text-blue-300";
        default:
          return "";
      }
    }
  };

  const displayIcon = icon !== undefined ? icon : iconMap[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`${getStyles()} ${className}`}
    >
      {/* <span className={getIconColor()}>{displayIcon}</span> */}
      <span className="flex-1 font-medium">{message}</span>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Dismiss message"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Message;
