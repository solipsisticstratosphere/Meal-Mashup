"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleToggleKeyDown = (
    e: React.KeyboardEvent,
    field: "password" | "confirmPassword"
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      if (field === "password") {
        togglePasswordVisibility();
      } else {
        toggleConfirmPasswordVisibility();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Signup submitted:", formData);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/");
    } catch (error) {
      console.error("Signup failed:", error);
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
              Create Account
            </h1>
            <p className="text-slate-600">
              Join Meal Mashup to create amazing recipes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="••••••••"
                  minLength={8}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    onKeyDown={(e) => handleToggleKeyDown(e, "password")}
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

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="••••••••"
                  minLength={8}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    onKeyDown={(e) => handleToggleKeyDown(e, "confirmPassword")}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={0}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-rose-600 hover:text-rose-500"
                tabIndex={0}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
