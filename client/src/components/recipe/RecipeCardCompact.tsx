"use client";

import { Recipe, VoteType } from "@/lib/types";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useRecipeStore } from "@/store/recipeStore";
import { useMutation } from "@apollo/client";
import { VOTE_RECIPE, SAVE_RECIPE } from "@/lib/graphql";
import Link from "next/link";
import Image from "next/image";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Clock,
  ChefHat,
  ArrowRight,
  Utensils,
} from "lucide-react";

interface RecipeCardCompactProps {
  recipe: Recipe;
  className?: string;
}

export default function RecipeCardCompact({
  recipe,
  className = "",
}: RecipeCardCompactProps) {
  const {
    votedRecipes,
    voteRecipe,
    saveRecipe: storeRecipe,
  } = useRecipeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [voteRecipeMutation] = useMutation(VOTE_RECIPE);
  const [saveRecipeMutation] = useMutation(SAVE_RECIPE);

  const userVote = votedRecipes[recipe.id];

  const safeRecipe = {
    ...recipe,
    difficulty: recipe.difficulty || "Medium",
    preparationTime: recipe.preparationTime || 0,
    votes: recipe.votes || 0,
    description: recipe.description || "",
    image_url: recipe.image_url || "",
  };

  const handleVote = async (vote: VoteType) => {
    try {
      const { data } = await voteRecipeMutation({
        variables: { recipeId: recipe.id, vote: vote.toUpperCase() },
      });

      if (data) {
        voteRecipe(recipe.id, vote);
      }
    } catch (error) {
      console.error("Error voting for recipe:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await saveRecipeMutation({
        variables: { recipeId: recipe.id },
      });

      if (data?.saveRecipe?.success) {
        storeRecipe(recipe);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
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

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden h-[450px] flex flex-col ${className}`}
    >
      {/* Recipe Image or Gradient */}
      <div className="relative h-36 overflow-hidden">
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
            {safeRecipe.votes}
          </span>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-fuchsia-500 to-rose-500 line-clamp-2">
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

        {safeRecipe.description && (
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
                variant={userVote === "up" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleVote("up")}
                aria-label="Upvote"
                className={
                  userVote === "up"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-blue-200 hover:bg-blue-50"
                }
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant={userVote === "down" ? "danger" : "outline"}
                size="sm"
                onClick={() => handleVote("down")}
                aria-label="Downvote"
                className={
                  userVote === "down"
                    ? ""
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
              aria-label="Save Recipe"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>

          <Link
            href={`/recipes/${recipe.id}`}
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
