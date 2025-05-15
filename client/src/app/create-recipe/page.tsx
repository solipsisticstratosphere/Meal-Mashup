"use client";

import { useState, useRef, useEffect } from "react";
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import IngredientSearch from "@/components/ingredients/IngredientSearch";
import IngredientCard from "@/components/ingredients/IngredientCard";
import DropArea from "@/components/ingredients/DropArea";
import Button from "@/components/ui/Button";
import RouletteWheel from "@/components/recipe/RouletteWheel";
import RecipeCard from "@/components/recipe/RecipeCard";
import { useRecipeStore } from "@/store/recipeStore";
import { useMutation } from "@apollo/client";
import { GENERATE_RECIPE } from "@/lib/graphql";
import type { Ingredient, Recipe, DifficultyLevel } from "@/lib/types";
import { generateRecipeFromIngredients } from "@/lib/huggingface";
import { toast } from "react-hot-toast";
import { motion, useAnimation } from "framer-motion";

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
  const [animatingIngredients, setAnimatingIngredients] = useState<
    Ingredient[]
  >([]);
  const [ingredientPositions, setIngredientPositions] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});
  const [flyingComplete, setFlyingComplete] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const [generateRecipeMutation] = useMutation(GENERATE_RECIPE);

  const generateUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateRecipeUsingHuggingFace = async () => {
    try {
      const ingredientNames = selectedIngredients.map((ing) => ing.name);

      const generatedRecipe = await generateRecipeFromIngredients(
        ingredientNames
      );

      const recipe: Recipe = {
        id: generateUuid(),
        title: generatedRecipe.title,
        description: generatedRecipe.description,
        ingredients: selectedIngredients.map((ingredient) => {
          const generatedIngredient = generatedRecipe.ingredients.find((gi) =>
            gi.name.toLowerCase().includes(ingredient.name.toLowerCase())
          );

          return {
            ingredientId: ingredient.id,
            ingredient: ingredient,
            quantity: generatedIngredient?.quantity || "to taste",
          };
        }),
        cookingMethod: generatedRecipe.cookingMethod,
        preparationTime: generatedRecipe.preparationTime,
        difficulty: generatedRecipe.difficulty as DifficultyLevel,
        createdAt: new Date().toISOString(),
        votes: 0,
      };

      return recipe;
    } catch (error) {
      console.error("Error generating recipe with Hugging Face:", error);
      return null;
    }
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

    return mockRecipe;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    if (over && over.id === "ingredients-drop-area") {
      const ingredient = active.data.current?.ingredient as Ingredient;
      if (ingredient) {
        if (selectedIngredients.some((item) => item.id === ingredient.id)) {
          toast.error(`${ingredient.name} is already in your selection!`, {
            duration: 2000,
            position: "top-center",
          });
        } else {
          addIngredient(ingredient);
          toast.success(`Added ${ingredient.name} to your selection!`, {
            duration: 1500,
            position: "top-center",
          });
        }
      }
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.some((item) => item.id === ingredient.id)) {
      addIngredient(ingredient);
      toast.success(`Added ${ingredient.name} to your selection!`, {
        duration: 1500,
        position: "top-center",
      });
    } else {
      toast.error(`${ingredient.name} is already in your selection!`, {
        duration: 2000,
        position: "top-center",
      });
    }
  };

  const handleGenerateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      toast.error("Please select ingredients to generate a recipe!", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    if (selectedIngredients.length < 2) {
      toast.error("You need at least 2 ingredients to generate a recipe!", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    const positions: Record<
      string,
      { x: number; y: number; width: number; height: number }
    > = {};
    selectedIngredients.forEach((ingredient) => {
      const element = document.getElementById(`ingredient-${ingredient.id}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        positions[ingredient.id] = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        };
      }
    });
    setIngredientPositions(positions);

    setIsGenerating(true);
    setAnimatingIngredients([...selectedIngredients]);

    setTimeout(() => {
      setFlyingComplete(true);
      setShowGenerationAnimation(true);

      const animationStartTime = Date.now();
      const MINIMUM_ANIMATION_TIME = 10000;

      const generateRecipe = async () => {
        let recipe: Recipe | null = null;

        try {
          const result = await generateRecipeMutation({
            variables: {
              ingredients: selectedIngredients.map((i) => i.id),
            },
          });

          if (result.data?.generateRecipe) {
            recipe = result.data.generateRecipe;
          } else {
            recipe = await generateRecipeUsingHuggingFace();
          }
        } catch (error) {
          console.error("Error generating recipe:", error);

          recipe = await generateRecipeUsingHuggingFace();
        }

        if (!recipe) {
          recipe = createFallbackRecipe();
        }

        const elapsedTime = Date.now() - animationStartTime;

        if (elapsedTime >= MINIMUM_ANIMATION_TIME) {
          showFinalRecipe(recipe);
        } else {
          const remainingTime = MINIMUM_ANIMATION_TIME - elapsedTime;
          console.log(`Waiting ${remainingTime}ms to complete the animation`);

          setTimeout(() => {
            showFinalRecipe(recipe);
          }, remainingTime);
        }
      };

      const showFinalRecipe = (recipe: Recipe) => {
        setCurrentRecipe(recipe);
        setShowGenerationAnimation(false);
        setIsGenerating(false);
        setAnimatingIngredients([]);
        setFlyingComplete(false);
      };

      generateRecipe();
    }, 1000);
  };

  const handleGenerateNewRecipe = () => {
    setCurrentRecipe(null);
    setFlyingComplete(false);
  };

  const handleRemoveIngredient = (id: string) => {
    removeIngredient(id);
  };

  const getWheelPosition = () => {
    if (!wheelRef.current) return { x: 0, y: 0 };
    const rect = wheelRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const wheelPosition = getWheelPosition();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
        Create Your Random Recipe
      </h1>

      {!currentRecipe ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="bg-amber-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">
                1
              </span>
              Select Your Ingredients
            </h2>
            <p className="mb-6 text-gray-600 ">
              Search for ingredients or drag them to the selection area.
            </p>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <IngredientSearch onSelectIngredient={handleSelectIngredient} />

              <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">
                      2
                    </span>
                    Your Selected Ingredients
                    {selectedIngredients.length > 0 && (
                      <span className="ml-2 bg-amber-100 text-amber-800 text-sm py-1 px-3 rounded-full">
                        {selectedIngredients.length}
                      </span>
                    )}
                  </h2>

                  {selectedIngredients.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearIngredients()}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <DropArea
                  id="ingredients-drop-area"
                  className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-xl"
                >
                  {selectedIngredients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-amber-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-16 h-16 mb-4 text-amber-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        Drag ingredients here
                      </p>
                      <p className="text-sm mt-1">or search and click to add</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 relative">
                      {selectedIngredients.map((ingredient) => (
                        <IngredientCard
                          key={ingredient.id}
                          ingredient={ingredient}
                          dragDisabled={true}
                          onClick={() => handleRemoveIngredient(ingredient.id)}
                          className={`cursor-pointer transform transition-transform hover:scale-105 hover:shadow-md ${
                            animatingIngredients.some(
                              (ai) => ai.id === ingredient.id
                            )
                              ? "invisible"
                              : ""
                          }`}
                          id={`ingredient-${ingredient.id}`}
                        />
                      ))}
                    </div>
                  )}
                </DropArea>

                <div className="mt-8">
                  <Button
                    onClick={handleGenerateRecipe}
                    disabled={selectedIngredients.length === 0 || isGenerating}
                    isLoading={
                      isGenerating &&
                      !showGenerationAnimation &&
                      !animatingIngredients.length
                    }
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {selectedIngredients.length === 0
                      ? "Select ingredients first"
                      : isGenerating
                      ? "Generating..."
                      : "Generate Random Recipe"}
                  </Button>
                </div>
              </div>
            </DndContext>
          </div>

          <div className="flex flex-col items-center justify-center">
            {showGenerationAnimation ? (
              <div
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
                ref={wheelRef}
              >
                <h3 className="text-xl font-semibold text-center mb-6 text-amber-700">
                  Creating Your Recipe...
                </h3>
                <RouletteWheel
                  isSpinning={flyingComplete}
                  onComplete={() => {}}
                />
              </div>
            ) : (
              <div
                className="w-full max-w-md p-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 text-center shadow-xl"
                ref={wheelRef}
              >
                <div className="bg-amber-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-amber-800">
                  Ready to Create?
                </h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Select at least{" "}
                  <span className="font-semibold">two ingredients</span> from
                  the left panel, then click &quot;Generate Random Recipe&quot;
                  to create your unexpected culinary masterpiece!
                </p>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-20 h-20 text-amber-400"
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
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold text-amber-800">
              Your Random Recipe
            </h2>
            <Button
              onClick={handleGenerateNewRecipe}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Create Another Recipe
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <RecipeCard recipe={currentRecipe} />
          </div>
        </div>
      )}

      {/* Flying Ingredients Animation Layer */}
      {animatingIngredients.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {animatingIngredients.map((ingredient, index) => (
            <FlyingIngredient
              key={ingredient.id}
              ingredient={ingredient}
              index={index}
              startX={ingredientPositions[ingredient.id]?.x || wheelPosition.x}
              startY={ingredientPositions[ingredient.id]?.y || wheelPosition.y}
              width={ingredientPositions[ingredient.id]?.width || 0}
              height={ingredientPositions[ingredient.id]?.height || 0}
              targetX={wheelPosition.x}
              targetY={wheelPosition.y}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FlyingIngredientProps {
  ingredient: Ingredient;
  index: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
  targetX: number;
  targetY: number;
  onComplete?: () => void;
}

const FlyingIngredient = ({
  ingredient,
  index,
  startX,
  startY,
  width,
  height,
  targetX,
  targetY,
  onComplete,
}: FlyingIngredientProps) => {
  const controls = useAnimation();

  useEffect(() => {
    controls
      .start({
        x: targetX - startX,
        y: targetY - startY,
        scale: 0.5,
        opacity: 0,
        transition: {
          duration: 1,
          delay: index * 0.1,
          ease: "easeInOut",
        },
      })
      .then(() => {
        onComplete?.();
      });
  }, [controls, startX, startY, targetX, targetY, index, onComplete]);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Protein: "bg-red-100 text-red-800",
      Vegetable: "bg-green-100 text-green-800",
      Fruit: "bg-purple-100 text-purple-800",
      Grain: "bg-yellow-100 text-yellow-800",
      Dairy: "bg-blue-100 text-blue-800",
      Spice: "bg-orange-100 text-orange-800",
      Herb: "bg-emerald-100 text-emerald-800",
      Oil: "bg-amber-100 text-amber-800",
      Condiment: "bg-pink-100 text-pink-800",
      Other: "bg-gray-100 text-gray-800",
    };

    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={controls}
      className="fixed z-50"
      style={{
        position: "fixed",
        left: startX,
        top: startY,
      }}
    >
      <div
        className="border rounded-lg shadow-md bg-white overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="relative h-28 w-full">
          <img
            src={ingredient.image_url || "/placeholder-image.jpg"}
            alt={ingredient.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 mb-1 text-sm">
            {ingredient.name}
          </h3>
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(
              ingredient.category
            )}`}
          >
            {ingredient.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
