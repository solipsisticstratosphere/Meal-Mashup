"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      togglePasswordVisibility();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Login submitted:", formData);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-fuchsia-500 to-orange-500 mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600">Sign in to continue to Meal Mashup</p>
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
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    onKeyDown={handleToggleKeyDown}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-rose-600 hover:text-rose-500"
                tabIndex={0}
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-rose-600 hover:text-rose-500"
                tabIndex={0}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
