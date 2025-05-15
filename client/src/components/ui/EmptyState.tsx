import React, { ReactNode } from "react";
import Link from "next/link";
import Button from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 border border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-full p-4 mb-4 shadow-sm">{icon}</div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-slate-600 max-w-md mx-auto mb-6">{description}</p>

      {action && (
        <Link href={action.href}>
          <Button onClick={action.onClick}>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
