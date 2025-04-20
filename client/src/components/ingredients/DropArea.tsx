"use client";

import { useDroppable } from "@dnd-kit/core";
import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";

interface DropAreaProps {
  id: string;
  children: ReactNode;
  className?: string;
  isDisabled?: boolean;
}

export default function DropArea({
  id,
  children,
  className,
  isDisabled = false,
}: DropAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: isDisabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={twMerge(
        "rounded-lg border-2 border-dashed p-4 transition-colors min-h-[200px]",
        isOver && !isDisabled
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50",
        className
      )}
    >
      {children}
    </div>
  );
}
