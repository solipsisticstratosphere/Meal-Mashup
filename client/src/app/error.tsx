"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Bug, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen  relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-amber-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-100/20 to-orange-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-300/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* Main Error Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
            {/* Card background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                type: "spring",
                stiffness: 200,
              }}
              className="relative mb-6"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              </div>
              {/* Pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 w-20 h-20 mx-auto border-2 border-amber-400 rounded-full"
              />
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 bg-clip-text text-transparent mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                An unexpected error has occurred
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Don&apos;t worry, these things happen. You can try again or
                return to the homepage.
              </p>
            </motion.div>

            {/* Error Details (if available) */}
            {error.digest && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bug className="w-4 h-4" />
                  <span className="font-medium">Error ID:</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                    {error.digest}
                  </code>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => reset()}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                aria-label="Try again"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>

              <Link href="/" passHref>
                <Button
                  variant="outline"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-105 bg-transparent"
                  aria-label="Go to homepage"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Additional Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-500 text-sm mb-4">
              If this problem persists, please contact our support team
            </p>
            <div className="flex justify-center gap-6 text-xs text-gray-400">
              <span>Error Code: 500</span>
              <span>•</span>
              <span>Timestamp: {new Date().toLocaleString()}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Back to previous page button (floating) */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        onClick={() => window.history.back()}
        className="fixed top-6 left-6 p-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full shadow-lg hover:shadow-xl text-gray-600 hover:text-amber-600 transition-all duration-300 transform hover:scale-110"
        aria-label="Go back to previous page"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
