"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again.";
      case "SessionRequired":
        return "You need to be signed in to access this page.";
      case "AccessDenied":
        return "You don't have permission to access this resource.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return "There was a problem with your OAuth authentication.";
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account.";
      case "EmailCreateAccount":
      case "EmailSignin":
        return "There was a problem with your email authentication.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      default:
        return "An unknown authentication error occurred. Please try again later.";
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-b from-rose-50 to-white">
      <div className="container max-w-md mx-auto px-4 py-12 flex flex-col">
        <Link
          href="/"
          className="flex items-center text-slate-600 hover:text-rose-600 transition-colors mb-8 w-fit"
          aria-label="Back to home"
          tabIndex={0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to home</span>
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Authentication Error
          </h1>
          <p className="text-slate-600 mb-6">{errorMessage}</p>
          <div className="flex flex-col gap-4">
            <Link
              href="/auth/login"
              className="block w-full px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              tabIndex={0}
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              tabIndex={0}
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
