"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
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
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/profile";
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log(
        "[SignupPage] Already authenticated, redirecting to:",
        returnUrl
      );
      router.push(returnUrl);
    }
  }, [session, status, router, returnUrl]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-b from-rose-50 to-white items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "password") {
      calculatePasswordStrength(value);
    }
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

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length > 0) {
      strength = 1;
    }
    if (password.length >= 8) {
      strength++;
    }
    if (/[A-Z]/.test(password)) {
      strength++;
    }
    if (/[0-9]/.test(password)) {
      strength++;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      strength++;
    }
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Medium";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("[SignupPage] Registering new user:", formData.email);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      console.log(
        "[SignupPage] Registration successful, user created:",
        data.user
      );

      setSuccess(true);

      console.log("[SignupPage] Attempting auto sign in");
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: returnUrl,
      });

      console.log("[SignupPage] Sign in result:", signInResult);

      if (signInResult?.error) {
        console.error("[SignupPage] Auto sign in failed:", signInResult.error);

        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else if (signInResult?.ok) {
        setTimeout(() => {
          router.push(returnUrl);
        }, 1000);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[SignupPage] Registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
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
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Registration Successful!
              </h2>
              <p className="text-slate-600 mb-6">
                Your account has been created. Signing you in automatically...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-pink-400 to-orange-400 mb-2">
                  Create Account
                </h1>
                <p className="text-slate-600">
                  Join Meal Mashup to create amazing recipes
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
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      onKeyDown={(e) => handleToggleKeyDown(e, "password")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
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
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-slate-500">
                          Password strength:
                        </div>
                        <div
                          className="text-xs font-medium"
                          style={{
                            color:
                              passwordStrength <= 1
                                ? "#ef4444"
                                : passwordStrength === 2
                                ? "#f97316"
                                : passwordStrength === 3
                                ? "#eab308"
                                : passwordStrength >= 4
                                ? "#22c55e"
                                : "",
                          }}
                        >
                          {getPasswordStrengthText(passwordStrength)}
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrengthColor(
                            passwordStrength
                          )} transition-all duration-300 ease-in-out`}
                          style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <ul className="mt-2 text-xs text-slate-500 space-y-1">
                        <li>• At least 8 characters</li>
                        <li>• At least one uppercase letter</li>
                        <li>• At least one number</li>
                        <li>• At least one special character</li>
                      </ul>
                    </div>
                  )}
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
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        onKeyDown={(e) =>
                          handleToggleKeyDown(e, "confirmPassword")
                        }
                        className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
