"use client";

import { Recipe, VoteType } from "@/lib/types";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useRecipeStore } from "@/store/recipeStore";
import { useMutation } from "@apollo/client";
import { VOTE_RECIPE, SAVE_RECIPE } from "@/lib/graphql";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Clock,
  ChefHat,
  ArrowRight,
  Utensils,
  BookmarkCheck,
} from "lucide-react";
// Import motion and AnimatePresence
import { motion, AnimatePresence } from "framer-motion";

interface RecipeCardCompactProps {
  recipe: Recipe;
  className?: string;
  from?: string;
}

export default function RecipeCardCompact({
  recipe,
  className = "",
  from,
}: RecipeCardCompactProps) {
  const {
    voteRecipe: storeVote,
    saveRecipe: storeSaveRecipe,
    removeSavedRecipe: storeRemoveSavedRecipe,
    savedRecipes,
    votedRecipes,
  } = useRecipeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentUserVote, setCurrentUserVote] = useState<
    "like" | "dislike" | null
  >(recipe.userVote || null);
  const [currentLikes, setCurrentLikes] = useState(recipe.likes || 0);
  const [currentDislikes, setCurrentDislikes] = useState(recipe.dislikes || 0);
  const [totalVotes, setTotalVotes] = useState(recipe.votes || 0);
  const [isSaved, setIsSaved] = useState(recipe.isSaved || false);

  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [voteRecipeMutation] = useMutation(VOTE_RECIPE);
  const [saveRecipeMutation] = useMutation(SAVE_RECIPE);

  useEffect(() => {
    setCurrentLikes(recipe.likes || 0);
    setCurrentDislikes(recipe.dislikes || 0);
    setTotalVotes(recipe.votes || 0);
  }, [recipe.likes, recipe.dislikes, recipe.votes]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setCurrentUserVote(null);
      setIsSaved(false);
    }
  }, [status]);

  useEffect(() => {
    if (recipe.id) {
      if (isAuthenticated && votedRecipes[recipe.id] !== undefined) {
        setCurrentUserVote(votedRecipes[recipe.id] || null);
      } else if (isAuthenticated && recipe.userVote) {
        storeVote(recipe.id, recipe.userVote);
        setCurrentUserVote(recipe.userVote);
      }

      if (isAuthenticated) {
        const isRecipeInStore = savedRecipes.some((r) => r.id === recipe.id);
        setIsSaved(isRecipeInStore || recipe.isSaved || false);
      }
    }
  }, [
    recipe.id,
    recipe.userVote,
    recipe.isSaved,
    votedRecipes,
    savedRecipes,
    storeVote,
    isAuthenticated,
  ]);

  const safeRecipe = {
    ...recipe,
    difficulty: recipe.difficulty || "Medium",
    preparationTime: recipe.preparationTime || 0,
    votes: recipe.votes || 0,
    description: recipe.description || "",
    image_url: recipe.image_url || "",
  };

  const handleVote = async (vote: VoteType) => {
    if (!isAuthenticated) {
      toast.error("Please log in to vote for recipes", {
        description: "Create an account or log in to save your preferences",
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/auth/login"),
        },
      });
      return;
    }

    const oldVote = currentUserVote;
    const oldLikes = currentLikes;
    const oldDislikes = currentDislikes;

    try {
      const isUnvote = currentUserVote === vote;
      const voteToSend = isUnvote ? "UNVOTE" : vote.toUpperCase();

      if (isUnvote) {
        if (oldVote === "like") setCurrentLikes((prev) => prev - 1);
        if (oldVote === "dislike") setCurrentDislikes((prev) => prev - 1);
        setCurrentUserVote(null);
      } else {
        if (oldVote === "like") setCurrentLikes((prev) => prev - 1);
        if (oldVote === "dislike") setCurrentDislikes((prev) => prev - 1);

        if (vote === "like") setCurrentLikes((prev) => prev + 1);
        if (vote === "dislike") setCurrentDislikes((prev) => prev + 1);
        setCurrentUserVote(vote);
      }

      setTotalVotes(currentLikes - currentDislikes);
      storeVote(recipe.id, isUnvote ? null : vote);

      const { data } = await voteRecipeMutation({
        variables: {
          recipeId: recipe.id,
          vote: voteToSend,
        },
      });

      if (data?.voteRecipe) {
        const serverUserVote = data.voteRecipe.userVote;
        const serverLikes = data.voteRecipe.likes;
        const serverDislikes = data.voteRecipe.dislikes;

        setCurrentUserVote(serverUserVote);
        storeVote(recipe.id, serverUserVote);

        if (serverLikes !== undefined) {
          setCurrentLikes(serverLikes);
        }

        if (serverDislikes !== undefined) {
          setCurrentDislikes(serverDislikes);
        }

        if (data.voteRecipe.votes !== undefined) {
          setTotalVotes(data.voteRecipe.votes);
        }

        toast.success(`${!isUnvote ? "Vote recorded" : "Vote removed"}`);
      }
    } catch (error) {
      console.error("Error voting for recipe:", error);
      toast.error("Failed to record your vote");

      setCurrentUserVote(oldVote);
      setCurrentLikes(oldLikes);
      setCurrentDislikes(oldDislikes);
      setTotalVotes(oldLikes - oldDislikes);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save recipes", {
        description: "Create an account or log in to save your preferences",
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/auth/login"),
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await saveRecipeMutation({
        variables: { recipeId: recipe.id },
      });

      if (data?.saveRecipe?.success) {
        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved);

        if (newIsSaved) {
          storeSaveRecipe(recipe);
          toast.success("Recipe saved to your collection");
        } else {
          storeRemoveSavedRecipe(recipe.id);
          toast.success("Recipe removed from your collection");
        }
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    if (lowerDifficulty === "easy") return "bg-green-100 text-green-600";
    if (lowerDifficulty === "medium") return "bg-yellow-100 text-yellow-600";
    if (lowerDifficulty === "hard") return "bg-red-100 text-red-600";
    return "bg-blue-100 text-blue-600";
  };

  const ingredientCount = recipe.ingredients?.length || 0;
  const truncatedDescription =
    safeRecipe.description.length > 100
      ? `${safeRecipe.description.substring(0, 100)}...`
      : safeRecipe.description;

  const gradients = [
    "from-amber-200 to-orange-400",
    "from-rose-300 to-fuchsia-500",
    "from-blue-300 to-cyan-500",
    "from-emerald-300 to-teal-500",
    "from-indigo-300 to-purple-500",
  ];

  const gradientIndex = recipe.id
    ? parseInt(recipe.id.replace(/\D/g, "").slice(0, 4), 10) % gradients.length
    : Math.floor(Math.random() * gradients.length);

  const backgroundGradient = gradients[gradientIndex];

  const isMyRecipesPage = from === "my-recipes";

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden h-[450px] flex flex-col ${className}`}
    >
      <div className="relative h-30 flex-shrink-0 overflow-hidden">
        {safeRecipe.image_url && !imageError ? (
          <Image
            src={safeRecipe.image_url}
            alt={safeRecipe.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-r ${backgroundGradient} flex items-center justify-center`}
          >
            <Utensils className="w-12 h-12 text-white opacity-75" />
          </div>
        )}
        <div className="absolute top-0 right-0 p-2">
          <span className="flex items-center text-xs text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <ThumbsUp className="w-3 h-3 mr-1.5" />
            {totalVotes} ({currentLikes} / {currentDislikes})
          </span>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-fuchsia-500 to-rose-500 line-clamp-1">
          {safeRecipe.title}
        </h2>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
              safeRecipe.difficulty
            )}`}
          >
            {safeRecipe.difficulty}
          </span>
          <span className="flex items-center text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            {safeRecipe.preparationTime} min
          </span>
        </div>

        {!isMyRecipesPage && safeRecipe.description && (
          <div className="mb-3 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-slate-700 italic text-xs line-clamp-2">
              {truncatedDescription}
            </p>
          </div>
        )}

        <div className="mb-3 flex-grow">
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <ChefHat className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-xm">Ingredients</h3>
            <span className="ml-2 text-xm text-slate-500">
              ({ingredientCount})
            </span>
          </div>

          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <ul className="grid grid-cols-2 gap-1.5 pl-1.5">
              {recipe.ingredients.slice(0, 4).map((item, index) => (
                <li
                  key={`ingredient-${index}-${item.ingredientId}`}
                  className="flex items-start"
                >
                  <span className="w-1.5 h-1.5 bg-gradient-to-r from-rose-600 to-orange-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                  <span className="font-medium text-xm text-slate-800 truncate">
                    {item.ingredient?.name || "Unknown"}
                  </span>
                </li>
              ))}
              {recipe.ingredients.length > 4 && (
                <li
                  key="more-ingredients"
                  className="text-xs text-slate-500 ml-1.5 mt-1 col-span-2"
                >
                  +{recipe.ingredients.length - 4} more ingredients
                </li>
              )}
            </ul>
          ) : (
            <p className="text-slate-500 text-xs">No ingredients available</p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200">
          <div className="flex justify-between items-center gap-2 mb-2.5">
            <div className="flex gap-1.5">
              <Button
                variant={currentUserVote === "like" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleVote("like")}
                aria-label="Like"
                className={
                  currentUserVote === "like"
                    ? "bg-green-600 hover:bg-green-700"
                    : "border-green-200 hover:bg-green-50 text-green-600"
                }
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant={currentUserVote === "dislike" ? "danger" : "outline"}
                size="sm"
                onClick={() => handleVote("dislike")}
                aria-label="Dislike"
                className={
                  currentUserVote === "dislike"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600"
                }
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              aria-label={isSaved ? "Unsave Recipe" : "Save Recipe"}
              className={
                isSaved
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {/* FIX: Use AnimatePresence to animate a single child */}
              <AnimatePresence mode="wait" initial={false}>
                {isSaved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <BookmarkCheck className="w-4 h-4 mr-1" />
                    Saved
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    Save
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          <Link
            href={
              from
                ? `/recipes/${recipe.id}?from=${from}`
                : `/recipes/${recipe.id}`
            }
            className="block w-full text-center py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            View Full Recipe
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline-block" />
          </Link>
        </div>
      </div>
    </div>
  );
}
