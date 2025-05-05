"use client";

import { Recipe, VoteType, RecipeIngredient } from "@/lib/types";
import React from "react";
import Button from "@/components/ui/Button";
import { useRecipeStore } from "@/store/recipeStore";
import { useMutation } from "@apollo/client";
import { VOTE_RECIPE, SAVE_RECIPE, DELETE_RECIPE } from "@/lib/graphql";
import { useState, useEffect } from "react";
import RecipePDF from "./RecipePDF";
import {
  Download,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Clock,
  ChefHat,
  Share2,
  X,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  showOwnerControls?: boolean;
}

export default function RecipeCard({
  recipe,
  className = "",
  showOwnerControls = false,
}: RecipeCardProps) {
  const {
    voteRecipe: storeVote,
    saveRecipe: storeRecipe,
    votedRecipes,
  } = useRecipeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentUserVote, setCurrentUserVote] = useState<
    "like" | "dislike" | null
  >(recipe.userVote || null);
  const [currentLikes, setCurrentLikes] = useState(recipe.likes || 0);
  const [currentDislikes, setCurrentDislikes] = useState(recipe.dislikes || 0);
  const [totalVotes, setTotalVotes] = useState(recipe.votes || 0);

  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [voteRecipeMutation] = useMutation(VOTE_RECIPE);
  const [saveRecipeMutation] = useMutation(SAVE_RECIPE);
  const [deleteRecipeMutation] = useMutation(DELETE_RECIPE);

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

  useEffect(() => {
    setCurrentLikes(recipe.likes || 0);
    setCurrentDislikes(recipe.dislikes || 0);
    setTotalVotes(recipe.votes || 0);
  }, [recipe.likes, recipe.dislikes, recipe.votes]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setCurrentUserVote(null);
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
    }
  }, [recipe.id, recipe.userVote, votedRecipes, storeVote, isAuthenticated]);

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

    try {
      const voteToSend = currentUserVote === vote ? null : vote;
      const oldVote = currentUserVote;

      if (oldVote === "like") setCurrentLikes((prev) => prev - 1);
      if (oldVote === "dislike") setCurrentDislikes((prev) => prev - 1);
      if (voteToSend === "like") setCurrentLikes((prev) => prev + 1);
      if (voteToSend === "dislike") setCurrentDislikes((prev) => prev + 1);

      setCurrentUserVote(voteToSend);
      setTotalVotes(currentLikes - currentDislikes);

      storeVote(recipe.id, voteToSend as VoteType);

      const { data } = await voteRecipeMutation({
        variables: { recipeId: recipe.id, vote: voteToSend },
      });

      if (data?.voteRecipe) {
        if (data.voteRecipe.userVote !== voteToSend) {
          setCurrentUserVote(data.voteRecipe.userVote || null);
          storeVote(recipe.id, data.voteRecipe.userVote);
        }

        if (data.voteRecipe.likes !== undefined) {
          setCurrentLikes(data.voteRecipe.likes);
        }

        if (data.voteRecipe.dislikes !== undefined) {
          setCurrentDislikes(data.voteRecipe.dislikes);
        }

        if (data.voteRecipe.votes !== undefined) {
          setTotalVotes(data.voteRecipe.votes);
        }

        toast.success(`${voteToSend ? "Vote recorded" : "Vote removed"}`);
      }
    } catch (error) {
      console.error("Error voting for recipe:", error);
      toast.error("Failed to record your vote");

      setCurrentUserVote(votedRecipes[recipe.id] || recipe.userVote || null);
      setCurrentLikes(recipe.likes || 0);
      setCurrentDislikes(recipe.dislikes || 0);
      setTotalVotes(recipe.votes || 0);
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
    const shareUrl = `${window.location.origin}/recipes/${recipe.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: recipe.title,
          text: `Check out this recipe for ${recipe.title}!`,
          url: shareUrl,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Recipe link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    setIsPdfOpen(true);
  };

  const handleEdit = () => {
    window.location.href = `/recipes/edit/${recipe.id}`;
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        const { data } = await deleteRecipeMutation({
          variables: { id: recipe.id },
        });

        if (data?.deleteRecipe?.success) {
          alert("Recipe deleted successfully!");
          window.location.href = "/my-recipes";
        } else {
          alert(data?.deleteRecipe?.message || "Failed to delete recipe");
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe. Please try again.");
      }
    }
  };

  const safeRecipe: Recipe = {
    ...recipe,
    ingredients: (recipe.ingredients || []).map((item) => {
      const getDefaultUnit = (ingredientName: string): string => {
        const name = ingredientName.toLowerCase();
        if (
          name.includes("pepper") ||
          name.includes("carrot") ||
          name.includes("zucchini") ||
          name.includes("onion") ||
          name.includes("potato") ||
          name.includes("apple") ||
          name.includes("tomato")
        ) {
          return "pc"; // piece
        } else if (
          name.includes("milk") ||
          name.includes("water") ||
          name.includes("oil") ||
          name.includes("juice")
        ) {
          return "ml";
        } else if (
          name.includes("flour") ||
          name.includes("sugar") ||
          name.includes("salt") ||
          name.includes("rice")
        ) {
          return "g";
        }
        return "";
      };

      const ingredientName = item.ingredient?.name || "Unknown Ingredient";

      const unitOfMeasure =
        item.ingredient?.unit_of_measure ||
        (item as unknown as { unit?: string }).unit ||
        (item.ingredient as unknown as { unit?: string }).unit ||
        getDefaultUnit(ingredientName);

      const recipeIngredientItem: RecipeIngredient = {
        ingredientId: item.ingredientId,
        ingredient: {
          name: ingredientName,
          id: item.ingredient?.id || "Unknown Ingredient",
          image_url: item.ingredient?.image_url || "Unknown Ingredient",
          category: item.ingredient?.category || "Unknown Ingredient",
          unit_of_measure: unitOfMeasure,
        },
        quantity: item.quantity || "amount not specified",
      };

      return recipeIngredientItem;
    }) as RecipeIngredient[],
    difficulty: recipe.difficulty || "Medium",
    preparationTime: recipe.preparationTime || 0,
    cookingMethod:
      typeof recipe.cookingMethod === "string"
        ? recipe.cookingMethod
        : "No instructions available",
    votes: recipe.votes || 0,
  };

  const getDifficultyColor = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    if (lowerDifficulty === "easy") return "bg-green-100 text-green-600";
    if (lowerDifficulty === "medium") return "bg-yellow-100 text-yellow-600";
    if (lowerDifficulty === "hard") return "bg-red-100 text-red-600";
    return "bg-blue-100 text-blue-600";
  };

  const renderCookingMethodSteps = (method: string | string[]) => {
    if (
      !method ||
      (Array.isArray(method) && method.length === 0) ||
      (typeof method === "string" && method.trim() === "") ||
      method === "No instructions available"
    ) {
      return (
        <p className="text-slate-500 italic">No instructions available.</p>
      );
    }

    let rawSteps: string[];

    if (Array.isArray(method)) {
      rawSteps = method;
    } else {
      rawSteps = method.split("\n");
    }

    const isJustNumberOrDotPattern = /^\s*\d+\.?\s*$/;

    const numberPrefixPattern = /^\s*\d+\.\s*/;

    const cleanedAndFilteredSteps = rawSteps
      .map((step) => step.trim())
      .filter((step) => step !== "" && !isJustNumberOrDotPattern.test(step));

    if (cleanedAndFilteredSteps.length === 0) {
      return (
        <p className="text-slate-500 italic">
          No detailed instructions available after processing.
        </p>
      );
    }

    return (
      <ol className="list-decimal pl-5 mt-3 space-y-2">
        {cleanedAndFilteredSteps.map((step, index) => (
          <li key={index} className="text-slate-700">
            {step.replace(numberPrefixPattern, "")}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}
    >
      <div className="relative h-48 md:h-64 overflow-hidden">
        {recipe.image_url && !imageError ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-r ${backgroundGradient} flex items-center justify-center`}
          >
            <Utensils className="w-16 h-16 text-white opacity-75" />
          </div>
        )}
      </div>

      <div className="p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-fuchsia-500 to-rose-500">
          {safeRecipe.title}
        </h2>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
              safeRecipe.difficulty
            )}`}
          >
            {safeRecipe.difficulty}
          </span>

          <span className="flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 mr-1.5" />
            {safeRecipe.preparationTime} minutes
          </span>

          <span className="flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            <ThumbsUp className="w-4 h-4 mr-1.5" />
            {totalVotes} votes ({currentLikes} likes, {currentDislikes}{" "}
            dislikes)
          </span>
        </div>

        {safeRecipe.description && (
          <div className="mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-slate-700 italic">{safeRecipe.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <ChefHat className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl">Ingredients</h3>
            </div>

            {safeRecipe.ingredients.length > 0 ? (
              <ul className="grid gap-3 pl-2">
                {safeRecipe.ingredients.map((item, index) => {
                  let quantityDisplay = "";
                  if (item.quantity) {
                    const numericQuantity = parseFloat(item.quantity);

                    if (Number.isInteger(numericQuantity)) {
                      quantityDisplay = numericQuantity.toFixed(0);
                    } else {
                      const formattedNum = numericQuantity.toFixed(2);
                      quantityDisplay = formattedNum.replace(/\.?0+$/, "");
                    }

                    if (
                      item.ingredient.unit_of_measure &&
                      item.ingredient.unit_of_measure.trim() !== ""
                    ) {
                      quantityDisplay += ` ${item.ingredient.unit_of_measure}`;
                    }
                  }

                  return (
                    <li
                      key={`ingredient-${index}-${item.ingredientId}`}
                      className="flex items-start"
                    >
                      <span className="w-2 h-2 bg-gradient-to-r from-rose-600  to-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        <span className="font-medium text-slate-800">
                          {item.ingredient.name}
                        </span>
                        {quantityDisplay && (
                          <span className="ml-2 text-slate-600">
                            ({quantityDisplay})
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-slate-500">No ingredients available</p>
            )}
          </div>

          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path
                    key="path-1"
                    d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
                  />
                  <path key="path-2" d="M9 18h6" />
                  <path key="path-3" d="M10 22h4" />
                </svg>
              </div>
              <h3 className="font-bold text-xl">Cooking Method</h3>
            </div>

            <div className="pl-2">
              {renderCookingMethodSteps(safeRecipe.cookingMethod)}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-6 pt-0">
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("like")}
              className={
                currentUserVote === "like"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : ""
              }
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Like ({currentLikes})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote("dislike")}
              className={
                currentUserVote === "dislike"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : ""
              }
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Dislike ({currentDislikes})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Owner controls */}
          {showOwnerControls && (
            <div className="flex flex-wrap gap-3 mt-6 border-t pt-6 border-slate-100">
              <div className="w-full mb-2">
                <h4 className="text-sm font-medium text-slate-500">
                  Owner Controls
                </h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="bg-blue-50 text-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Recipe
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="bg-red-50 text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Recipe
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Modal */}
      {isPdfOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl w-70 h-70 overflow-auto shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 ">
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-fuchsia-500 to-orange-500">
                Recipe PDF Preview
              </h2>
              <button
                onClick={() => setIsPdfOpen(false)}
                className="text-slate-500 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50"
                aria-label="Close PDF preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex justify-center items-center">
              <RecipePDF recipe={safeRecipe} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
