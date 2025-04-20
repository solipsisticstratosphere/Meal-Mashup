"use client";

import { Recipe, VoteType } from "@/lib/types";
import Button from "@/components/ui/Button";
import { useRecipeStore } from "@/store/recipeStore";
import { useMutation } from "@apollo/client";
import { VOTE_RECIPE, SAVE_RECIPE } from "@/lib/graphql";
import { useState } from "react";
import RecipePDF from "./RecipePDF";
import { Download, Share, ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export default function RecipeCard({
  recipe,
  className = "",
}: RecipeCardProps) {
  const {
    votedRecipes,
    voteRecipe,
    saveRecipe: storeRecipe,
  } = useRecipeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const [voteRecipeMutation] = useMutation(VOTE_RECIPE);
  const [saveRecipeMutation] = useMutation(SAVE_RECIPE);

  const userVote = votedRecipes[recipe.id];

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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: recipe.title,
          text: `Check out this recipe for ${recipe.title}!`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    setIsPdfOpen(true);
  };

  const safeRecipe = {
    ...recipe,
    difficulty: recipe.difficulty || "Medium",
    preparationTime: recipe.preparationTime || 0,
    cookingMethod: recipe.cookingMethod || "No instructions available",
    ingredients: recipe.ingredients || [],
    votes: recipe.votes || 0,
  };

  const getDifficultyColor = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    if (lowerDifficulty === "easy") return "bg-green-100 text-green-800";
    if (lowerDifficulty === "medium") return "bg-yellow-100 text-yellow-800";
    if (lowerDifficulty === "hard") return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-3">{safeRecipe.title}</h2>

        <div className="flex items-center gap-3 mb-5">
          <span
            className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(
              safeRecipe.difficulty
            )}`}
          >
            {safeRecipe.difficulty}
          </span>
          <span className="text-sm text-gray-600">
            {safeRecipe.preparationTime} minutes
          </span>
          <span className="flex items-center text-sm text-gray-600">
            <ThumbsUp className="w-4 h-4 mr-1" />
            {safeRecipe.votes}
          </span>
        </div>

        {safeRecipe.description && (
          <div className="mb-5">
            <p className="text-gray-700">{safeRecipe.description}</p>
          </div>
        )}

        <div className="mb-5">
          <h3 className="font-semibold text-lg mb-2">Ingredients</h3>
          {safeRecipe.ingredients.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {safeRecipe.ingredients.map((item) => (
                <li
                  key={`${item.ingredientId}-${item.ingredient.name}`}
                  className="flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span className="font-medium">{item.ingredient.name}</span>
                  <span className="ml-2 text-gray-600">{item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No ingredients available</p>
          )}
        </div>

        <div className="mb-5">
          <h3 className="font-semibold text-lg mb-2">Cooking Method</h3>
          <p className="text-gray-700">{safeRecipe.cookingMethod}</p>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant={userVote === "up" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleVote("up")}
                aria-label="Upvote"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant={userVote === "down" ? "danger" : "outline"}
                size="sm"
                onClick={() => handleVote("down")}
                aria-label="Downvote"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              className="flex-1 flex items-center justify-center"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              className="flex-1 flex items-center justify-center"
              variant="secondary"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {isPdfOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Recipe PDF Preview</h2>
              <button
                onClick={() => setIsPdfOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
            <RecipePDF recipe={safeRecipe} />
          </div>
        </div>
      )}
    </div>
  );
}
