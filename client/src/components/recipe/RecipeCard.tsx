"use client";

import { Recipe, VoteType, RecipeIngredient } from "@/lib/types";
import React from "react";
import Button from "@/components/ui/Button";
import { useRecipeStore } from "@/store/recipeStore";
import { useMutation } from "@apollo/client";
import { VOTE_RECIPE, SAVE_RECIPE } from "@/lib/graphql";
import { useState } from "react";
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
} from "lucide-react";

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

    const renderAsNumbered = true;

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

    let finalStepsToDisplay: string[];

    if (Array.isArray(method)) {
      finalStepsToDisplay = cleanedAndFilteredSteps;
    } else {
      const looksNumbered =
        cleanedAndFilteredSteps.length > 0 &&
        numberPrefixPattern.test(cleanedAndFilteredSteps[0]);

      if (looksNumbered) {
        finalStepsToDisplay = cleanedAndFilteredSteps
          .map((step) => step.replace(numberPrefixPattern, "").trim())
          .filter((step) => step !== "");

        if (finalStepsToDisplay.length === 0) {
          return (
            <p className="text-slate-500 italic">
              No detailed instructions available after processing.
            </p>
          );
        }
      } else {
        finalStepsToDisplay = cleanedAndFilteredSteps;
      }
    }

    return (
      <div className="space-y-4">
        {finalStepsToDisplay.map((stepText, index) => {
          if (stepText.trim() === "") {
            return null;
          }

          const uniqueKey = `step-${index}-${stepText
            .substring(0, 10)
            .replace(/\s+/g, "-")}`;

          return (
            <div key={uniqueKey} className="flex items-start mb-4">
              {/* Number circle with explicit text rendering */}
              <div
                className="flex-shrink-0 mr-4 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center"
                style={{ minWidth: "24px", textAlign: "center" }}
              >
                <span
                  className="text-blue-600 text-sm font-semibold"
                  style={{ display: "inline-block" }}
                >
                  {index + 1}
                </span>
              </div>
              <div className="text-slate-700 leading-relaxed">{stepText}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}
    >
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
            {safeRecipe.votes} votes
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

        <div className="flex flex-col gap-4 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex gap-2">
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
                <ThumbsUp className="w-4 h-4 mr-1" />
                Upvote
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
                <ThumbsDown className="w-4 h-4 mr-1" />
                Downvote
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
              <Bookmark className="w-4 h-4 mr-2" />
              Save Recipe
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Button
              onClick={handleDownload}
              aria-label="Download as PDF"
              className="bg-blue-600 hover:bg-blue-700"
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              aria-label="Share Recipe"
              className="border-blue-200 hover:bg-blue-50"
              icon={<Share2 className="w-4 h-4" />}
            >
              Share Recipe
            </Button>
          </div>
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
