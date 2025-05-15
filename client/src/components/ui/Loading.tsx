import React from "react";

interface LoadingProps {
  text?: string;
  size?: "small" | "medium" | "large";
}

export default function Loading({
  text = "Loading",
  size = "medium",
}: LoadingProps) {
  const sizeClasses = {
    small: "h-8 w-8 border-2",
    medium: "h-12 w-12 border-4",
    large: "h-16 w-16 border-4",
  };

  return (
    <div className="flex flex-col justify-center items-center py-20">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-orange-500 border-orange-200`}
      />
      {text && <p className="mt-4 text-slate-600 font-medium">{text}</p>}
    </div>
  );
}
