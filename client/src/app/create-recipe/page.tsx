"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import IngredientSearch from "@/components/ingredients/IngredientSearch";
import IngredientCard from "@/components/ingredients/IngredientCard";
import DropArea from "@/components/ingredients/DropArea";
import Button from "@/components/ui/Button";
import RouletteWheel from "@/components/recipe/RouletteWheel";
import RecipeCard from "@/components/recipe/RecipeCard";
import { useRecipeStore } from "@/store/recipeStore";
import { useMutation } from "@apollo/client";
import { GENERATE_RECIPE } from "@/lib/graphql";
import { Ingredient, Recipe, DifficultyLevel } from "@/lib/types";

export default function CreateRecipePage() {
  const {
    selectedIngredients,
    addIngredient,
    removeIngredient,
    clearIngredients,
    currentRecipe,
    setCurrentRecipe,
    isGenerating,
    setIsGenerating,
  } = useRecipeStore();

  const [showGenerationAnimation, setShowGenerationAnimation] = useState(false);

  const [generateRecipeMutation] = useMutation(GENERATE_RECIPE, {
    onCompleted: (data) => {
      if (data.generateRecipe) {
        setCurrentRecipe(data.generateRecipe);
        setShowGenerationAnimation(false);
        setIsGenerating(false);
      } else {
        createFallbackRecipe();
      }
    },
    onError: (error) => {
      console.error("Error generating recipe:", error);

      createFallbackRecipe();
    },
  });

  const generateUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const createFallbackRecipe = () => {
    const mockRecipe: Recipe = {
      id: generateUuid(),
      title: `${selectedIngredients[0]?.name || "Random"} Surprise`,
      description: "A creative recipe with your selected ingredients",
      ingredients: selectedIngredients.map((ingredient) => ({
        ingredientId: ingredient.id,
        ingredient: ingredient,
        quantity: "to taste",
      })),
      cookingMethod:
        "1. Prepare all ingredients.\n2. Combine ingredients in a bowl.\n3. Cook according to your preference.\n4. Serve and enjoy!",
      preparationTime: 30,
      difficulty: "Medium" as DifficultyLevel,
      createdAt: new Date().toISOString(),
      votes: 0,
    };

    setCurrentRecipe(mockRecipe);
    setShowGenerationAnimation(false);
    setIsGenerating(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    if (over && over.id === "ingredients-drop-area") {
      const ingredient = active.data.current?.ingredient as Ingredient;
      if (ingredient) {
        addIngredient(ingredient);
      }
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    addIngredient(ingredient);
  };

  const handleGenerateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      return;
    }

    setIsGenerating(true);
    setShowGenerationAnimation(true);

    setTimeout(async () => {
      try {
        await generateRecipeMutation({
          variables: {
            ingredients: selectedIngredients.map((i) => i.id),
          },
        });
      } catch (error) {
        console.error("Error generating recipe:", error);
        createFallbackRecipe();
      }
    }, 3000);
  };

  const handleGenerateNewRecipe = () => {
    setCurrentRecipe(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Random Recipe</h1>

      {!currentRecipe ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Step 1: Select Your Ingredients
            </h2>
            <p className="mb-6 text-gray-600">
              Search for ingredients or drag them to the selection area.
            </p>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <IngredientSearch onSelectIngredient={handleSelectIngredient} />

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Step 2: Your Selected Ingredients
                    {selectedIngredients.length > 0 &&
                      ` (${selectedIngredients.length})`}
                  </h2>

                  {selectedIngredients.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearIngredients()}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <DropArea id="ingredients-drop-area">
                  {selectedIngredients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 mb-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <p>Drag ingredients here or search and click to add</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedIngredients.map((ingredient) => (
                        <IngredientCard
                          key={ingredient.id}
                          ingredient={ingredient}
                          dragDisabled={true}
                          onClick={() => removeIngredient(ingredient.id)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                  )}
                </DropArea>

                <div className="mt-6">
                  <Button
                    onClick={handleGenerateRecipe}
                    disabled={selectedIngredients.length === 0 || isGenerating}
                    isLoading={isGenerating && !showGenerationAnimation}
                    fullWidth
                    size="lg"
                  >
                    Generate Random Recipe
                  </Button>
                </div>
              </div>
            </DndContext>
          </div>

          <div className="flex flex-col items-center justify-center">
            {showGenerationAnimation ? (
              <RouletteWheel isSpinning={true} onComplete={() => {}} />
            ) : (
              <div className="w-full max-w-md p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Create?</h2>
                <p className="text-gray-600 mb-6">
                  Select at least one ingredient from the left panel, then click
                  &quot;Generate Random Recipe&quot; to create your unexpected
                  culinary masterpiece!
                </p>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Random Recipe</h2>
            <Button onClick={handleGenerateNewRecipe}>
              Create Another Recipe
            </Button>
          </div>

          <RecipeCard recipe={currentRecipe as Recipe} />
        </div>
      )}
    </div>
  );
}
