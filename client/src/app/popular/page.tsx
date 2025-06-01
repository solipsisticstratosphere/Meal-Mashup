"use client";

import { useQuery } from "@apollo/client";
import { GET_POPULAR_RECIPES } from "@/lib/graphql";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { ChefHat, PlusCircle, RotateCcw, ArrowDown } from "lucide-react";
import { FoodCard } from "@/components/main/food-card";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeCardSkeleton } from "@/components/ui/recipe-card-skeleton";
import { useSession } from "next-auth/react";

export default function PopularRecipesPage() {
  const { data: session } = useSession();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const RECIPES_PER_PAGE = 9;

  const { data, loading, error, fetchMore } = useQuery(GET_POPULAR_RECIPES, {
    variables: { limit: RECIPES_PER_PAGE, offset: 0 },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    context: {
      userId: session?.user?.id || "anonymous",
    },
    onCompleted: (data) => {
      if (
        data?.popularRecipes &&
        data.popularRecipes.length < RECIPES_PER_PAGE
      ) {
        setHasMore(false);
      }
    },
  });

  const allRecipes: Recipe[] = data?.popularRecipes || [];

  const loadMoreRecipes = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      await fetchMore({
        variables: {
          limit: RECIPES_PER_PAGE,
          offset: allRecipes.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.popularRecipes) return prev;

          const newRecipes = fetchMoreResult.popularRecipes;

          if (newRecipes.length < RECIPES_PER_PAGE) {
            setHasMore(false);
          }

          const existingRecipeIds = new Set(
            prev.popularRecipes.map((r: Recipe) => r.id)
          );
          const uniqueNewRecipes = newRecipes.filter(
            (r: Recipe) => !existingRecipeIds.has(r.id)
          );

          return {
            ...prev,
            popularRecipes: [...prev.popularRecipes, ...uniqueNewRecipes],
          };
        },
      });
    } catch (err) {
      console.error("Error loading more recipes:", err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getSkeletonCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }
    return 3;
  };

  const skeletonCount = getSkeletonCount();
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const loadMoreItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Popular Recipes
          </h1>
          <p className="text-gray-600 mt-2 md:mt-3 text-base md:text-lg">
            Recipes are sorted by popularity based on user votes
          </p>
        </div>
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
                <span className="hidden sm:inline">Create Your Own</span>
              </span>

              {/* Animated badge - hidden on small screens */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
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
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 mb-6 text-red-700 bg-red-50 rounded-xl border border-red-100 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
          <p>Error loading popular recipes: {error.message}</p>
        </motion.div>
      )}

      {allRecipes.length === 0 && !loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16 md:py-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-md border border-amber-100"
        >
          <ChefHat className="w-16 h-16 md:w-20 md:h-20 mx-auto text-amber-400 mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-amber-800">
            No Recipes Found
          </h2>
          <p className="text-gray-700 mb-6 md:mb-8 max-w-md mx-auto px-4">
            It seems there are no recipes in the database yet. Be the first to
            create one!
          </p>
          <Link href="/create-recipe">
            <motion.button
              className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold 
w-full sm:w-full md:w-auto
    px-5 py-3 text-sm
    sm:px-6 sm:py-3 sm:text-base
    md:px-8 md:py-4 md:text-base
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
              aria-label="Create your first recipe"
            >
              {/* Background shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 sm:via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
              />

              {/* Button content */}
              <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                <motion.div
                  className="group-hover:rotate-90 transition-transform duration-300"
                  whileHover={{ rotate: 90 }}
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>

                <span className="font-medium">Create a Recipe</span>

                {/* Pulsing dot indicator - smaller on mobile */}
                <motion.div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Ripple effect on click */}
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-xl md:rounded-2xl"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 0, opacity: 1 }}
                whileTap={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-amber-400/10 sm:from-amber-400/20 to-orange-500/10 sm:to-orange-500/20 blur-lg sm:blur-xl group-hover:blur-xl sm:group-hover:blur-2xl transition-all duration-300 -z-10" />
            </motion.button>
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <AnimatePresence mode="wait">
          {loading && allRecipes.length === 0 ? (
            <>
              {skeletons.map((index) => (
                <RecipeCardSkeleton key={`initial-skeleton-${index}`} />
              ))}
            </>
          ) : allRecipes.length > 0 ? (
            <>
              {allRecipes.map((recipe: Recipe, index: number) => (
                <motion.div
                  key={recipe.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  className="transform transition-all"
                  whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.1 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FoodCard
                    id={recipe.id}
                    title={recipe.title}
                    image={recipe.image_url || ""}
                    tags={recipe.tags || []}
                    rating={recipe.votes || 0}
                    featured={index === 0}
                    from="popular"
                    userVote={recipe.userVote}
                    likes={recipe.likes || 0}
                    dislikes={recipe.dislikes || 0}
                    isSaved={recipe.isSaved}
                    recipeRating={recipe.rating}
                  />
                </motion.div>
              ))}
            </>
          ) : null}
        </AnimatePresence>
      </div>

      {hasMore && allRecipes.length > 0 && (
        <div className="mt-8 md:mt-12">
          {isLoadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8">
              {skeletons.map((index) => (
                <motion.div
                  key={`load-more-skeleton-${index}`}
                  variants={loadMoreItemVariants}
                  initial="hidden"
                  animate="show"
                >
                  <RecipeCardSkeleton />
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={loadMoreRecipes}
                disabled={isLoadingMore}
                className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold 
  px-6 py-3 text-sm
  sm:px-7 sm:py-3.5 sm:text-base
  md:px-8 md:py-4 md:text-base
  rounded-xl sm:rounded-xl md:rounded-2xl
  shadow-md hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl
  transition-all duration-300 ease-out 
  disabled:cursor-not-allowed 
  focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50
  active:scale-95 touch-manipulation
  min-w-[140px] sm:min-w-[160px] md:min-w-[200px]"
                whileHover={{
                  scale: isLoadingMore ? 1 : 1.02,
                  y: isLoadingMore ? 0 : -1,
                }}
                whileTap={{
                  scale: isLoadingMore ? 1 : 0.98,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
                aria-label={
                  isLoadingMore ? "Loading more recipes" : "Load more recipes"
                }
              >
                {/* Background shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 sm:via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: isLoadingMore ? ["100%", "-100%"] : "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: isLoadingMore ? Number.POSITIVE_INFINITY : 0,
                    ease: "linear",
                  }}
                />

                {/* Button content */}
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <AnimatePresence mode="wait">
                    {isLoadingMore ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        <span className="font-medium">
                          <span className="sm:hidden">Loading...</span>
                          <span className="hidden sm:inline">
                            Loading more recipes...
                          </span>
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="load-more"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        <motion.div
                          className="group-hover:animate-bounce"
                          transition={{ duration: 0.6 }}
                        >
                          <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        <span className="font-medium">
                          <span className="sm:hidden">Load More</span>
                          <span className="hidden sm:inline">
                            Load More Recipes
                          </span>
                        </span>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-white/20 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium hidden sm:block"
                        >
                          {allRecipes.length}+
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Ripple effect on click */}
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-xl md:rounded-2xl"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 0, opacity: 1 }}
                  whileTap={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}

      {!hasMore && allRecipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12 mb-4"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200 shadow-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <p className="text-gray-600 font-medium">
              You&apos;ve reached the end of the list
            </p>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
