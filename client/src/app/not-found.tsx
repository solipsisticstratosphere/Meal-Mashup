"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-orange-200/30 to-rose-200/30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-fuchsia-200/30 to-orange-200/30 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-rose-100/20 to-fuchsia-100/20 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      {mounted && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full animate-float-${i % 3}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ["#ea580c", "#d946ef", "#f43f5e"][i % 3],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-2xl">
          {/* Main 404 number with enhanced styling */}
          <div className="relative mb-8">
            <div className="absolute inset-0 blur-2xl">
              <span className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-orange-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent opacity-50">
                404
              </span>
            </div>
            <span className="relative text-9xl md:text-[12rem] font-black bg-gradient-to-r from-orange-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent drop-shadow-2xl">
              404
            </span>

            {/* Decorative elements around 404 */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-orange-400 rounded-full animate-spin-slow"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-fuchsia-400 to-rose-400 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gradient-to-r from-rose-400 to-orange-400 rotate-45 animate-pulse"></div>
          </div>

          {/* Enhanced title and subtitle */}
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
              Oops! Page Not Found
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-md mx-auto">
              The page you&apos;re looking for seems to have vanished into the
              digital void
            </p>
          </div>

          {/* Enhanced description */}
          <div className="mb-12">
            <p className="text-slate-500 mb-8 leading-relaxed">
              Don&apos;t worry though, our homepage is still here and ready to
              help you find what you need.
            </p>

            <Link href="/">
              <Button
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 via-fuchsia-500 to-rose-500 hover:from-orange-600 hover:via-fuchsia-600 hover:to-rose-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Return to Homepage
                </span>
              </Button>
            </Link>
          </div>

          {/* Enhanced animated dots */}
          {mounted && (
            <div className="flex justify-center items-center space-x-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full animate-bounce`}
                  style={{
                    backgroundColor: [
                      "#ea580c",
                      "#d946ef",
                      "#f43f5e",
                      "#ea580c",
                      "#d946ef",
                    ][i],
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1.5s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Additional decorative elements */}
          <div className="mt-16 relative">
            <div className="flex justify-center space-x-8 opacity-30">
              <div className="w-16 h-16 border-2 border-orange-300 rounded-full animate-spin-slow"></div>
              <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-300 to-rose-300 rounded-full animate-pulse"></div>
              <div className="w-20 h-20 border-2 border-rose-300 rounded-full animate-spin-reverse"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-0 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes float-1 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }
        @keyframes float-2 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(180deg);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-float-0 {
          animation: float-0 3s ease-in-out infinite;
        }
        .animate-float-1 {
          animation: float-1 4s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 3.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
      `}</style>
    </div>
  );
}
