"use client";

import { motion } from "framer-motion";

export function RecipeCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100 h-full"
    >
      {/* Image skeleton */}
      <div className="relative w-full h-48 bg-gray-200 animate-pulse">
        <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-7 bg-gray-200 rounded-md animate-pulse mb-3 w-3/4"></div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );
}
