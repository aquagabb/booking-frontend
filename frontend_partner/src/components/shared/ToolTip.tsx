import React, { useState, ReactNode } from "react";

interface ToolTipProps {
    children: ReactNode;
    content: string | ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    trigger?: "hover" | "click" | "both";
}

const ToolTip: React.FC<ToolTipProps> = ({
    children,
    content,
    position = "bottom",
    onClick,
    disabled = false,
    className = "",
    trigger = "hover",
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleMouseEnter = () => {
        if (trigger === "hover" || trigger === "both") {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (trigger === "hover" || trigger === "both") {
            setIsVisible(false);
        }
    };

    const handleClick = () => {
        if (trigger === "click" || trigger === "both") {
            setIsVisible(!isVisible);
        }
        if (onClick) {
            onClick();
        }
    };

    const getPositionClasses = () => {
        switch (position) {
            case "top":
                return "bottom-full left-1/2 -translate-x-1/2 mb-2";
            case "bottom":
                return "top-full left-1/2 -translate-x-1/2 mt-2";
            case "left":
                return "right-full top-1/2 -translate-y-1/2 mr-2";
            case "right":
                return "left-full top-1/2 -translate-y-1/2 ml-2";
            default:
                return "top-full left-1/2 -translate-x-1/2 mt-2";
        }
    };

    const getArrowClasses = () => {
        switch (position) {
            case "top":
                return "top-full left-1/2 -translate-x-1/2 -mt-1";
            case "bottom":
                return "bottom-full left-1/2 -translate-x-1/2 -mb-1";
            case "left":
                return "left-full top-1/2 -translate-y-1/2 -ml-1 rotate-90";
            case "right":
                return "right-full top-1/2 -translate-y-1/2 -mr-1 rotate-90";
            default:
                return "bottom-full left-1/2 -translate-x-1/2 -mb-1";
        }
    };

    if (disabled) {
        return <>{children}</>;
    }

    return (
        <div className="relative inline-block">
            <div
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={onClick ? "cursor-pointer" : ""}
            >
                {children}
            </div>
            {isVisible && content && (
                <div
                    className={`absolute z-50 ${getPositionClasses()} ${className}`}
                    role="tooltip"
                >
                    <div className="px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                        {content}
                        <div
                            className={`absolute ${getArrowClasses()} w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToolTip;


