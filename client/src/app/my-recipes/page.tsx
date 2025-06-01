"use client";

import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import { useQuery } from "@apollo/client";
import { GET_MY_RECIPES } from "@/lib/graphql";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Recipe } from "@/lib/types";
import { motion } from "framer-motion";

export default function MyRecipes() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { data, loading, error } = useQuery(GET_MY_RECIPES, {
    skip: !isAuthenticated,
    fetchPolicy: "network-only",
  });

  const userRecipes = data?.myRecipes || [];
  const isLoading = loading || status === "loading";

  return (
    <div className="min-h-screen pb-16">
      <section className="pt-10 md:pt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
              My Recipes
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Manage all the recipes you&apos;ve created
            </p>
          </div>

          {!isAuthenticated && status !== "loading" ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
              <h3 className="text-xl font-medium mb-4">
                You need to be logged in to view your recipes
              </h3>
              <p className="text-slate-600 mb-8">
                Please log in to see and create your recipes
              </p>
              <Link href="/auth/login">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-md bg-gradient-to-r from-amber-500 to-orange-600 group"
                >
                  Log In
                </Button>
              </Link>
            </div>
          ) : isLoading ? (
            <Loading text="Loading your recipes" />
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
              <h3 className="text-xl font-medium text-red-600 mb-4">
                Error loading recipes
              </h3>
              <p className="text-slate-600 mb-8">
                {error.message || "Something went wrong"}
              </p>
            </div>
          ) : userRecipes.length > 0 ? (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="flex justify-end">
                <Link href="/create-recipe">
                  <motion.button
                    className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold 
w-full sm:w-full md:w-auto
    px-4 py-2.5 text-sm
    sm:px-5 sm:py-3 sm:text-sm
    md:px-6 md:py-3 md:text-base
    lg:px-8 lg:py-4 lg:text-base
    rounded-xl sm:rounded-xl md:rounded-2xl
    shadow-md hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl
    transition-all duration-300 ease-out 
    focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50
    active:scale-95 touch-manipulation"
                    whileHover={{
                      scale: 1.02,
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17,
                    }}
                    aria-label="Create your own recipe"
                  >
                    {/* Background shimmer effect - reduced on mobile */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 sm:via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{
                        duration: 0.8,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Floating particles effect - hidden on mobile for performance */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl hidden sm:block">
                      {[...Array(2)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/40 rounded-full"
                          initial={{
                            x: Math.random() * 100 + "%",
                            y: "100%",
                            opacity: 0,
                          }}
                          animate={{
                            y: "-20%",
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2 + i * 0.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.7,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </div>

                    {/* Button content */}
                    <div className="relative flex items-center gap-1.5 sm:gap-2 md:gap-3">
                      <motion.div
                        className="group-hover:rotate-90 transition-transform duration-300"
                        whileHover={{ rotate: 90 }}
                      >
                        <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </motion.div>

                      <span className="font-medium whitespace-nowrap">
                        <span className="sm:hidden">Create</span>
                        <span className="hidden sm:inline">
                          Create New Recipe
                        </span>
                      </span>

                      {/* Animated badge - hidden on small screens */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 500,
                        }}
                        className="hidden md:flex bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium border border-white/30"
                      >
                        <motion.span
                          animate={{
                            color: ["#ffffff", "#fef3c7", "#ffffff"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          New
                        </motion.span>
                      </motion.div>
                    </div>

                    {/* Ripple effect on click */}
                    <motion.div
                      className="absolute inset-0 bg-white/30 rounded-xl md:rounded-2xl"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 0, opacity: 1 }}
                      whileTap={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Glow effect - reduced on mobile */}
                    <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-amber-400/10 sm:from-amber-400/20 to-orange-500/10 sm:to-orange-500/20 blur-lg sm:blur-xl group-hover:blur-xl sm:group-hover:blur-2xl transition-all duration-300 -z-10" />
                  </motion.button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {userRecipes.map((recipe: Recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showOwnerControls={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
              <h3 className="text-xl font-medium mb-4">
                You haven&apos;t created any recipes yet
              </h3>
              <p className="text-slate-600 mb-8">
                Start creating your own unique recipes and they&apos;ll appear
                here
              </p>
              <Link href="/create-recipe">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-md bg-gradient-to-r from-amber-500 to-orange-600 group"
                  icon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  Create Your First Recipe
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
