"use client";

import { useQuery } from "@apollo/client";
import { GET_POPULAR_RECIPES } from "@/lib/graphql";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { Recipe } from "@/lib/types";
import { ChefHat, PlusCircle } from "lucide-react";
import { FoodCard } from "@/components/main/food-card";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeCardSkeleton } from "@/components/ui/recipe-card-skeleton";
import useIntersectionObserver from "@/hooks/use-intersection-observer";

export default function PopularRecipesPage() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const loadMoreRef = useRef(null);
  const RECIPES_PER_PAGE = 9;

  const allDataLoadedRef = useRef(false);

  const { data, loading, error, fetchMore } = useQuery(GET_POPULAR_RECIPES, {
    variables: { limit: RECIPES_PER_PAGE, offset: 0 },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const isIntersecting = useIntersectionObserver(
    loadMoreRef as unknown as React.RefObject<Element>,
    {
      threshold: 0.1,
      rootMargin: "200px",
    }
  );

  useEffect(() => {
    if (data?.popularRecipes && !loading) {
      setInitialLoadAttempted(true);

      const totalRecipes = data.popularRecipes.length;

      setAllRecipes((prevRecipes) => {
        const existingIds = new Set(prevRecipes.map((r) => r.id));
        const newRecipes = data.popularRecipes.filter(
          (recipe: { id: string }) => !existingIds.has(recipe.id)
        );
        return [...prevRecipes, ...newRecipes];
      });

      if (totalRecipes < RECIPES_PER_PAGE) {
        setHasMore(false);
        allDataLoadedRef.current = true;
      }
    } else if (!loading && data) {
      setInitialLoadAttempted(true);
    }
  }, [data, loading]);

  useEffect(() => {
    const loadMore = async () => {
      if (
        isIntersecting &&
        hasMore &&
        !loading &&
        !isLoadingMore &&
        !allDataLoadedRef.current
      ) {
        setIsLoadingMore(true);

        try {
          const currentOffset = allRecipes.length;

          if (currentOffset === 0 || currentOffset % RECIPES_PER_PAGE === 0) {
            const { data: newData } = await fetchMore({
              variables: {
                offset: currentOffset,
                limit: RECIPES_PER_PAGE,
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                return fetchMoreResult;
              },
            });

            const newRecipes = newData.popularRecipes;

            if (newRecipes.length > 0) {
              setAllRecipes((prevRecipes) => {
                const existingIds = new Set(prevRecipes.map((r) => r.id));
                const uniqueNewRecipes = newRecipes.filter(
                  (recipe: { id: string }) => !existingIds.has(recipe.id)
                );

                if (uniqueNewRecipes.length === 0) {
                  setHasMore(false);
                  allDataLoadedRef.current = true;
                  return prevRecipes;
                }

                return [...prevRecipes, ...uniqueNewRecipes];
              });

              if (newRecipes.length < RECIPES_PER_PAGE) {
                setHasMore(false);
                allDataLoadedRef.current = true;
              }
            } else {
              setHasMore(false);
              allDataLoadedRef.current = true;
            }
          }
        } catch (error) {
          console.error("Error loading more recipes:", error);
        } finally {
          setIsLoadingMore(false);
        }
      }
    };

    loadMore();
  }, [
    isIntersecting,
    hasMore,
    loading,
    isLoadingMore,
    allRecipes.length,
    fetchMore,
  ]);

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
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  // For "load more" items
  const loadMoreItemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
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
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-md transition-all hover:brightness-110 hover:scale-105">
            <PlusCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Create Your Own
          </Button>
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

      {allRecipes.length === 0 &&
        !loading &&
        !error &&
        initialLoadAttempted && (
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
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105">
                Create a Recipe
              </Button>
            </Link>
          </motion.div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <AnimatePresence mode="wait">
          {(loading || !initialLoadAttempted) && allRecipes.length === 0 ? (
            <>
              {skeletons.map((index) => (
                <RecipeCardSkeleton key={`skeleton-${index}`} />
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
                  />
                </motion.div>
              ))}
            </>
          ) : null}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {loading && allRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full">
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
        </div>
      )}

      {!hasMore && allRecipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-10 mb-4 text-gray-500"
        >
          <p>You&apos;ve reached the end of the list</p>
        </motion.div>
      )}
    </div>
  );
}
