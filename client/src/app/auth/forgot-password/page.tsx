"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useMutation } from "@apollo/client";
import { FORGOT_PASSWORD } from "@/lib/graphql";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [forgotPassword] = useMutation(FORGOT_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data } = await forgotPassword({
        variables: { email },
      });

      if (data.forgotPassword.success) {
        setIsSubmitted(true);
      } else {
        setError(
          data.forgotPassword.message ||
            "Something went wrong. Please try again."
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-pink-400 to-orange-400 mb-2">
                  Reset Password
                </h1>
                <p className="text-slate-600">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-medium text-slate-900 mb-2">
                Check your email
              </h2>
              <p className="text-slate-600 mb-6">
                We&apos;ve sent a password reset link to:
                <span className="block font-medium mt-1">{email}</span>
              </p>
              <p className="text-sm text-slate-500 mb-6">
                If you don&apos;t see it, please check your spam folder
              </p>
              <Link
                href="/auth/login"
                className="text-rose-600 hover:text-rose-500 font-medium"
                tabIndex={0}
              >
                Return to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
