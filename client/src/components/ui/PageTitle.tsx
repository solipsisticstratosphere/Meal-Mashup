import React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-fuchsia-500 to-rose-500">
        {title}
      </h1>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}
