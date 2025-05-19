"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_SAVED_RECIPES } from "@/lib/graphql";
import PageTitle from "../../components/ui/PageTitle";
import EmptyState from "../../components/ui/EmptyState";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { FoodCard } from "@/components/main/food-card";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeCardSkeleton } from "@/components/ui/recipe-card-skeleton";

export default function SavedRecipesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  const { data, loading, error } = useQuery(GET_SAVED_RECIPES, {
    skip: status === "unauthenticated",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (!loading && data) {
      setInitialLoadAttempted(true);
    }
  }, [loading, data]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/saved-recipes");
    }
  }, [status, router]);

  const getSkeletonCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 6;
      if (window.innerWidth >= 768) return 4;
      return 2;
    }
    return 6;
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

  if (status === "loading" || (loading && !initialLoadAttempted)) {
    return (
      <div className="container mx-auto py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PageTitle
            title="Saved Recipes"
            subtitle="Your collection of saved favorite recipes"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
          {skeletons.map((index) => (
            <RecipeCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <PageTitle title="Saved Recipes" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyState
            title="Error Loading Saved Recipes"
            description={`Something went wrong: ${error.message}`}
            icon={<Bookmark className="h-12 w-12 text-gray-400" />}
          />
        </motion.div>
      </div>
    );
  }

  const savedRecipes = data?.savedRecipes || [];

  return (
    <div className="container mx-auto py-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PageTitle
          title="Saved Recipes"
          subtitle="Your collection of saved favorite recipes"
        />
      </motion.div>

      {savedRecipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <EmptyState
            title="No Saved Recipes Yet"
            description="Save recipes that you like to find them easily later"
            icon={<Bookmark className="h-12 w-12 text-gray-400" />}
            action={{
              label: "Discover Recipes",
              href: "/recipes",
            }}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
          <AnimatePresence>
            {savedRecipes.map(
              (recipe: Recipe & { isSaved?: boolean }, index: number) => (
                <motion.div
                  key={recipe.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  className="transform transition-all hover:scale-[1.02] hover:shadow-2xl"
                  whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.2 },
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
                    from="saved"
                    userVote={recipe.userVote}
                    likes={recipe.likes || 0}
                    dislikes={recipe.dislikes || 0}
                    isSaved={
                      recipe.isSaved === undefined ? true : recipe.isSaved
                    }
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
