"use client";

import { ReactNode, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AuthProvider from "@/components/providers/AuthProvider";
import Loading from "@/components/ui/Loading";

const ApolloProviderWrapper = dynamic(() => import("@/lib/apollo-provider"), {
  ssr: false,
});

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const response = await fetch("/api/db-health");
        const data = await response.json();

        setIsDbConnected(data.success);
        if (!data.success) {
          setError(data.message || "Database connection failed");
        }
      } catch (err) {
        console.error("Failed to check database connection:", err);
        setError(
          "Failed to connect to database. Please check your configuration."
        );
        setIsDbConnected(false);
      }
    };

    checkDbConnection();
  }, []);

  if (isDbConnected === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading text="Loading" size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className=" p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Database Error</h2>
          <p className="text-center text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
    </AuthProvider>
  );
}
