"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Password reset requested for:", email);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
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
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-fuchsia-500 to-orange-500 mb-2">
                  Reset Password
                </h1>
                <p className="text-slate-600">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Check Your Email
              </h2>
              <p className="text-slate-600 mb-6">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium">{email}</span>
              </p>
              <Link href="/auth/login">
                <Button variant="outline" fullWidth>
                  Return to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
