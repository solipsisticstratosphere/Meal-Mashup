"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

const errorTypes = {
  default: "An unknown error occurred",
  configuration: "Server configuration error",
  accessdenied: "Access denied",
  verification: "The login link is invalid or has expired",
  CredentialsSignin: "Invalid email or password",
  sessionrequired: "You need to be signed in to access this page",
};

function getErrorMessage(errorType: string): string {
  return errorTypes[errorType as keyof typeof errorTypes] || errorTypes.default;
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMessage(getErrorMessage(error));
    } else {
      setErrorMessage(errorTypes.default);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-b from-rose-50 to-white">
      <div className="container max-w-md mx-auto px-4 py-12 flex flex-col">
        <Link
          href="/auth/login"
          className="flex items-center text-slate-600 hover:text-rose-600 transition-colors mb-8 w-fit"
          aria-label="Back to login"
          tabIndex={0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to login</span>
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-medium text-slate-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-slate-600 mb-6">{errorMessage}</p>
            <div className="flex flex-col space-y-4">
              <Link
                href="/auth/login"
                className="text-rose-600 hover:text-rose-500 font-medium"
              >
                Try to login again
              </Link>
              <Link
                href="/auth/forgot-password"
                className="text-slate-600 hover:text-rose-500"
              >
                Forgot password?
              </Link>
              <Link
                href="/auth/signup"
                className="text-slate-600 hover:text-rose-500"
              >
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
