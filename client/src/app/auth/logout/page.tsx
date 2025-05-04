"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    async function handleLogout() {
      try {
        console.log("[LogoutPage] Signing out user...");

        const result = await signOut({
          redirect: false,
          callbackUrl: "/auth/login",
        });

        console.log("[LogoutPage] SignOut result:", result);

        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 500);
      } catch (error) {
        console.error("[LogoutPage] Error signing out:", error);
        setIsLoggingOut(false);
      }
    }

    handleLogout();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-b from-rose-50 to-white items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center max-w-md w-full">
        {isLoggingOut ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Signing Out...
            </h1>
            <p className="text-slate-600">
              Please wait while we securely sign you out.
            </p>
          </>
        ) : (
          <>
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
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Sign Out Failed
            </h1>
            <p className="text-slate-600 mb-6">
              There was an error signing you out. Please try again.
            </p>
            <button
              onClick={() => {
                setIsLoggingOut(true);
                signOut({
                  redirect: false,
                  callbackUrl: "/auth/login",
                })
                  .then((result) => {
                    console.log("[LogoutPage] Retry signOut result:", result);
                    window.location.href = "/auth/login";
                  })
                  .catch((error) => {
                    console.error("[LogoutPage] Retry error:", error);
                    setIsLoggingOut(false);
                  });
              }}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
