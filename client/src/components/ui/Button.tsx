"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { useIsMobile } from "../../hooks/useMobile";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  icon,
  ...props
}: ButtonProps) {
  const isMobile = useIsMobile();

  const effectiveSize = isMobile && size === "sm" ? "md" : size;

  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantStyles = {
    primary: "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700",
    secondary: "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700",
    outline:
      "bg-transparent border border-rose-200 text-rose-600 hover:bg-rose-100 active:bg-rose-100",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  };

  const sizeStyles = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4",
    lg: "h-12 px-6 text-lg",
  };

  // Enhanced mobile styles with better touch targets
  const mobileStyles = isMobile ? "min-h-[44px] min-w-[44px] py-2.5" : "";

  // Adjust icon spacing based on size and device
  const iconSpacing = isMobile ? "mr-3" : "mr-2";

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        sizeStyles[effectiveSize],
        mobileStyles,
        widthStyle,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !isLoading && <span className={iconSpacing}>{icon}</span>}
      {children}
    </button>
  );
}
