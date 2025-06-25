"use client";

import { useQuery } from "@apollo/client";
import { GET_POPULAR_RECIPES } from "@/lib/graphql";
import Link from "next/link";

import type { Recipe, Ingredient, IngredientCategory } from "@/lib/types";
import {
  ChefHat,
  PlusCircle,
  RotateCcw,
  ArrowDown,
  Filter,
  X,
  ChevronDown,
  Clock,
  Star,
  Soup,
  Sparkles,
} from "lucide-react";
import { FoodCard } from "@/components/main/food-card";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeCardSkeleton } from "@/components/ui/recipe-card-skeleton";
import { useSession } from "next-auth/react";
import IngredientMultiSelect from "@/components/ingredients/IngredientMultiSelect";
import CategorySelect from "@/components/ingredients/CategorySelect";

const difficultyOptions = [
  { value: "Easy", label: "Easy", icon: <Sparkles className="w-4 h-4" /> },
  { value: "Medium", label: "Medium", icon: <Soup className="w-4 h-4" /> },
  { value: "Hard", label: "Hard", icon: <ChefHat className="w-4 h-4" /> },
];

const timeOptions = [
  { value: 15, label: "Under 15m" },
  { value: 30, label: "Under 30m" },
  { value: 60, label: "Under 1h" },
];

const ratingOptions = [
  { value: 3, label: "3+ stars" },
  { value: 5, label: "5+ stars" },
  { value: 7, label: "7+ stars" },
  { value: 9, label: "9+ stars" },
];

const FILTER_STORAGE_KEY = "popularRecipeFilters";

export default function PopularRecipesPage() {
  const { data: session } = useSession();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [suppressSkeleton, setSuppressSkeleton] = useState(false);
  const RECIPES_PER_PAGE = 9;

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [maxPrepTime, setMaxPrepTime] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<
    IngredientCategory | ""
  >("");

  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDifficulties)
          setSelectedDifficulties(parsed.selectedDifficulties);
        if (parsed.maxPrepTime !== undefined)
          setMaxPrepTime(parsed.maxPrepTime);
        if (parsed.minRating !== undefined) setMinRating(parsed.minRating);
        if (parsed.selectedIngredients)
          setSelectedIngredients(parsed.selectedIngredients);
        if (parsed.selectedCategory)
          setSelectedCategory(parsed.selectedCategory);
      } catch (e) {
        console.error("Failed to parse saved filters", e);
      }
    }
    isFirstLoad.current = false;
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) return;
    const data = {
      selectedDifficulties,
      maxPrepTime,
      minRating,
      selectedIngredients,
      selectedCategory,
    };
    if (
      selectedDifficulties.length ||
      maxPrepTime !== null ||
      minRating !== null ||
      selectedIngredients.length ||
      selectedCategory
    ) {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    }
  }, [
    selectedDifficulties,
    maxPrepTime,
    minRating,
    selectedIngredients,
    selectedCategory,
  ]);

  // When multiple ingredients are selected, we want recipes that contain ALL of these ingredients
  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_POPULAR_RECIPES,
    {
      variables: {
        limit: RECIPES_PER_PAGE,
        offset: 0,
        difficulty:
          selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
        maxPrepTime: maxPrepTime ?? undefined,
        minRating: minRating ?? undefined,
        ingredients:
          selectedIngredients.length > 0
            ? selectedIngredients.map((i) => i.id)
            : undefined,
      },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      context: {
        userId: session?.user?.id || "anonymous",
      },
      onCompleted: (data) => {
        if (!data?.popularRecipes) return;

        setHasMore(data.popularRecipes.length >= RECIPES_PER_PAGE);
      },
    }
  );

  useEffect(() => {
    refetch();
  }, [
    selectedDifficulties,
    maxPrepTime,
    minRating,
    selectedIngredients,
    refetch,
  ]);

  const allRecipes: Recipe[] = data?.popularRecipes || [];

  const recipesToRender = allRecipes;
  const loadMoreRecipes = async (suppress = false) => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setSuppressSkeleton(suppress);

    try {
      // Ensure all selected ingredients are required in the recipe results
      const { data: fetchMoreData } = await fetchMore({
        variables: {
          offset: allRecipes.length,
          limit: RECIPES_PER_PAGE,
          difficulty:
            selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
          maxPrepTime: maxPrepTime ?? undefined,
          minRating: minRating ?? undefined,
          ingredients:
            selectedIngredients.length > 0
              ? selectedIngredients.map((i) => i.id)
              : undefined,
        },
      });

      if (
        !fetchMoreData ||
        !fetchMoreData.popularRecipes ||
        fetchMoreData.popularRecipes.length < RECIPES_PER_PAGE
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

  const handleToggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearFilters = () => {
    setSelectedDifficulties([]);
    setMaxPrepTime(null);
    setMinRating(null);
    setSelectedIngredients([]);
    setSelectedCategory("");
    if (typeof window !== "undefined")
      localStorage.removeItem(FILTER_STORAGE_KEY);
  };

  const isFiltersApplied =
    selectedDifficulties.length > 0 ||
    maxPrepTime !== null ||
    minRating !== null ||
    selectedIngredients.length > 0 ||
    selectedCategory !== "";

  useEffect(() => {
    if (
      isFiltersApplied &&
      !loading &&
      !isLoadingMore &&
      hasMore &&
      recipesToRender.length < RECIPES_PER_PAGE
    ) {
      loadMoreRecipes(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    recipesToRender.length,
    isFiltersApplied,
    loading,
    isLoadingMore,
    hasMore,
  ]);

  useEffect(() => {
    if (!loading && !isLoadingMore && allRecipes.length > 0) {
      if (allRecipes.length < RECIPES_PER_PAGE) {
        setHasMore(false);
      }
    }
  }, [loading, isLoadingMore, allRecipes.length]);

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

      {/* Filters Section */}
      <motion.div
        layout
        className="mb-8 bg-gradient-to-br from-white to-amber-50/70 backdrop-blur-sm border border-amber-100 rounded-2xl shadow-lg overflow-hidden"
      >
        <motion.div
          layout
          className="flex justify-between items-center p-5 border-b border-amber-100"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2.5 text-amber-800 font-semibold group"
          >
            <div className="bg-amber-100 p-2 rounded-lg group-hover:bg-amber-200 transition-colors">
              <Filter className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-lg">Recipe Filters</span>
            <div
              className={`bg-amber-100 p-1.5 rounded-full transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
            >
              <ChevronDown className="w-4 h-4 text-amber-600" />
            </div>
          </button>
          {isFiltersApplied && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={clearFilters}
              className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </motion.button>
          )}
        </motion.div>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Difficulty Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-600" />
                    <label className="font-semibold text-amber-800 text-sm">
                      Difficulty
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {difficultyOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleToggleDifficulty(opt.value)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5 ${
                          selectedDifficulties.includes(opt.value)
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white shadow-md"
                            : "bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-700 border-gray-200"
                        }`}
                      >
                        <div
                          className={`${selectedDifficulties.includes(opt.value) ? "text-white" : "text-amber-500"}`}
                        >
                          {opt.icon}
                        </div>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prep Time Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <label className="font-semibold text-amber-800 text-sm">
                      Prep Time
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {timeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setMaxPrepTime(
                            maxPrepTime === opt.value ? null : opt.value
                          )
                        }
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5 ${
                          maxPrepTime === opt.value
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white shadow-md"
                            : "bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-700 border-gray-200"
                        }`}
                      >
                        <Clock
                          className={`w-4 h-4 ${maxPrepTime === opt.value ? "text-white" : "text-amber-500"}`}
                        />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-600" />
                    <label className="font-semibold text-amber-800 text-sm">
                      Minimum Rating
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ratingOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setMinRating(
                            minRating === opt.value ? null : opt.value
                          )
                        }
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5 ${
                          minRating === opt.value
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white shadow-md"
                            : "bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-700 border-gray-200"
                        }`}
                      >
                        <div className="flex">
                          {[
                            ...Array(Math.min(3, Math.ceil(opt.value / 3))),
                          ].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${minRating === opt.value ? "text-white" : "text-amber-400"}`}
                              fill={
                                minRating === opt.value ? "white" : "#fbbf24"
                              }
                            />
                          ))}
                        </div>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingredient Filter */}
                <div className="space-y-4">
                  {/* Category Dropdown */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Soup className="w-4 h-4 text-amber-600" />
                      <label className="font-semibold text-amber-800 text-sm">
                        Ingredient Category
                      </label>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <CategorySelect
                        selected={selectedCategory}
                        onChange={setSelectedCategory}
                      />
                    </div>
                  </div>

                  {/* Ingredient multiselect */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <label className="font-semibold text-amber-800 text-sm">
                        Ingredients
                      </label>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <IngredientMultiSelect
                        selected={selectedIngredients}
                        onChange={setSelectedIngredients}
                        category={selectedCategory}
                      />
                      {selectedIngredients.length > 1 && (
                        <div className="px-3 py-1 text-xs text-amber-700 bg-amber-50 border-t border-gray-200">
                          Showing recipes with ALL selected ingredients
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active filters summary */}
              {isFiltersApplied && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-5 pb-5 pt-1"
                >
                  <div className="flex flex-wrap gap-2 items-center border-t border-amber-100 pt-4">
                    <span className="text-xs font-medium text-amber-700">
                      Active filters:
                    </span>

                    {selectedDifficulties.map((difficulty) => (
                      <div
                        key={difficulty}
                        className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md flex items-center gap-1"
                      >
                        <span>{difficulty}</span>
                        <button
                          onClick={() =>
                            setSelectedDifficulties((prev) =>
                              prev.filter((d) => d !== difficulty)
                            )
                          }
                          className="hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {maxPrepTime && (
                      <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <span>Under {maxPrepTime}m</span>
                        <button
                          onClick={() => setMaxPrepTime(null)}
                          className="hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {minRating && (
                      <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <span>{minRating}+ stars</span>
                        <button
                          onClick={() => setMinRating(null)}
                          className="hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {selectedIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md flex items-center gap-1"
                      >
                        <span>{ingredient.name}</span>
                        <button
                          onClick={() =>
                            setSelectedIngredients((prev) =>
                              prev.filter((i) => i.id !== ingredient.id)
                            )
                          }
                          className="hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

      {recipesToRender.length === 0 && !loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16 md:py-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-md border border-amber-100"
        >
          <ChefHat className="w-16 h-16 md:w-20 md:h-20 mx-auto text-amber-400 mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-amber-800">
            {isFiltersApplied ? "No Matching Recipes" : "No Recipes Found"}
          </h2>
          <p className="text-gray-700 mb-6 md:mb-8 max-w-md mx-auto px-4">
            {isFiltersApplied
              ? "Try adjusting your filters to find more recipes."
              : "It seems there are no recipes in the database yet. Be the first to create one!"}
          </p>
          {isFiltersApplied && (
            <motion.button
              onClick={clearFilters}
              className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 active:scale-95"
            >
              Clear Filters
            </motion.button>
          )}
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
          ) : recipesToRender.length > 0 ? (
            <>
              {recipesToRender.map((recipe: Recipe) => (
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
                    from="popular"
                    userVote={recipe.userVote}
                    likes={recipe.likes || 0}
                    dislikes={recipe.dislikes || 0}
                    isSaved={recipe.isSaved}
                    recipeRating={recipe.rating}
                    description={recipe.description}
                  />
                </motion.div>
              ))}
            </>
          ) : null}
        </AnimatePresence>
      </div>

      {hasMore && recipesToRender.length > 0 && (
        <div className="mt-8 md:mt-12">
          {isLoadingMore && !suppressSkeleton && (
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
                          {recipesToRender.length}
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

      {!hasMore && recipesToRender.length > 0 && (
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
