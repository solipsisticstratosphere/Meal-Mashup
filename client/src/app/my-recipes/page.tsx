"use client";

import Link from "next/link";
import {
  ArrowRight,
  PlusCircle,
  Search,
  ArrowDown,
  RotateCcw,
  X,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useQuery } from "@apollo/client";
import { GET_MY_RECIPES } from "@/lib/graphql";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";
import RecipeCardCompact from "@/components/recipe/RecipeCardCompact";
import { Recipe } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { RecipeCardSkeleton } from "@/components/ui/recipe-card-skeleton";

export default function MyRecipes() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayRecipes, setDisplayRecipes] = useState<Recipe[]>([]);
  const [suppressSkeleton, setSuppressSkeleton] = useState(false);
  const RECIPES_PER_PAGE = 8;
  const initialQueryRef = useRef(true);

  const { data, loading, error, fetchMore } = useQuery(GET_MY_RECIPES, {
    skip: !isAuthenticated,
    fetchPolicy: "network-only",
    variables: {
      limit: RECIPES_PER_PAGE,
      offset: 0,
    },
    notifyOnNetworkStatusChange: true,
  });

  const isLoading = loading || status === "loading";

  // Set initial recipes when data loads
  useEffect(() => {
    if (data?.myRecipes && !loading && initialQueryRef.current) {
      setDisplayRecipes(data.myRecipes);
      setHasMore(data.myRecipes.length >= RECIPES_PER_PAGE);
      initialQueryRef.current = false;
    }
  }, [data, loading]);

  // Filter recipes when search term changes
  useEffect(() => {
    if (data?.myRecipes && searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = data.myRecipes.filter((recipe: Recipe) => {
        const titleMatch = recipe.title
          ?.toLowerCase()
          .includes(lowercaseSearch);
        const ingredientMatch = recipe.ingredients?.some((item) =>
          item.ingredient?.name.toLowerCase().includes(lowercaseSearch)
        );
        return titleMatch || ingredientMatch;
      });
      setDisplayRecipes(filtered);
    } else if (data?.myRecipes) {
      setDisplayRecipes(data.myRecipes);
    }
  }, [searchTerm, data?.myRecipes]);

  const loadMoreRecipes = async (suppress = false) => {
    if (isLoadingMore || !hasMore || searchTerm) return;

    setIsLoadingMore(true);
    setSuppressSkeleton(suppress);

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: {
          offset: displayRecipes.length,
          limit: RECIPES_PER_PAGE,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            myRecipes: [...prev.myRecipes, ...fetchMoreResult.myRecipes],
          };
        },
      });

      if (
        !fetchMoreData ||
        !fetchMoreData.myRecipes ||
        fetchMoreData.myRecipes.length < RECIPES_PER_PAGE
      ) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more recipes:", err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
      setSuppressSkeleton(false);
    }
  };

  const getSkeletonCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1280) return 4;
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }
    return 4;
  };

  const skeletonCount = getSkeletonCount();
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const loadMoreItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: 0.1 },
    },
  };

  const handleClearSearch = () => {
    if (searchTerm) {
      setSearchTerm("");
    }
  };

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
          ) : isLoading && !data?.myRecipes ? (
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
          ) : (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                {/* Search bar */}
                <div className="relative w-full md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search recipes by title or ingredient..."
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Create recipe button */}
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
              </div>

              {displayRecipes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="wait">
                      {displayRecipes.map((recipe: Recipe) => (
                        <motion.div
                          key={recipe.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          className="transform transition-all"
                          whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.1 },
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <RecipeCardCompact
                            key={recipe.id}
                            recipe={recipe}
                            from="my-recipes"
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {hasMore && !searchTerm && (
                    <div className="mt-8 md:mt-12">
                      {isLoadingMore && !suppressSkeleton && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                            onClick={() => void loadMoreRecipes(false)}
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
                              isLoadingMore
                                ? "Loading more recipes"
                                : "Load more recipes"
                            }
                          >
                            {/* Background shimmer effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 sm:via-white/20 to-transparent"
                              initial={{ x: "-100%" }}
                              animate={{
                                x: isLoadingMore ? ["100%", "-100%"] : "100%",
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: isLoadingMore
                                  ? Number.POSITIVE_INFINITY
                                  : 0,
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
                                      <span className="sm:hidden">
                                        Loading...
                                      </span>
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
                                      <span className="sm:hidden">
                                        Load More
                                      </span>
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
                                      {displayRecipes.length}
                                      {hasMore ? "+" : ""}
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

                  {!hasMore && !searchTerm && displayRecipes.length > 0 && (
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
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
                  <h3 className="text-xl font-medium mb-4">
                    {searchTerm
                      ? "No recipes matching your search"
                      : "You haven't created any recipes yet"}
                  </h3>
                  <p className="text-slate-600 mb-8">
                    {searchTerm
                      ? "Try a different search term or clear the search"
                      : "Start creating your own unique recipes and they'll appear here"}
                  </p>
                  {searchTerm ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="shadow-md bg-gradient-to-r from-amber-500 to-orange-600 group"
                      onClick={handleClearSearch}
                    >
                      Clear Search
                    </Button>
                  ) : (
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
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
