"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_RECIPE,
  UPDATE_RECIPE,
  UPDATE_RECIPE_INGREDIENTS,
} from "@/lib/graphql";
import Button from "@/components/ui/Button";
import { Recipe, RecipeIngredient } from "@/lib/types";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import IngredientManager from "@/components/recipe/IngredientManager";

interface EditableRecipe {
  title: string;
  description: string;
  cookingMethod: string;
  preparationTime: number;
  difficulty: string;
  ingredients: {
    ingredientId: string;
    quantity: string;
    ingredient: {
      id: string;
      name: string;
      unit_of_measure: string;
    };
  }[];
}

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;
  const { status } = useSession();

  const [formData, setFormData] = useState<EditableRecipe>({
    title: "",
    description: "",
    cookingMethod: "",
    preparationTime: 0,
    difficulty: "Medium",
    ingredients: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: recipeData, loading: recipeLoading } = useQuery(GET_RECIPE, {
    variables: { id: recipeId },
    skip: !recipeId,
  });

  const [updateRecipe] = useMutation(UPDATE_RECIPE);
  const [updateRecipeIngredients] = useMutation(UPDATE_RECIPE_INGREDIENTS);

  useEffect(() => {
    if (recipeData?.recipe) {
      const recipe = recipeData.recipe as Recipe;
      setFormData({
        title: recipe.title || "",
        description: recipe.description || "",
        cookingMethod: recipe.cookingMethod || "",
        preparationTime: recipe.preparationTime || 0,
        difficulty: recipe.difficulty || "Medium",
        ingredients: (recipe.ingredients || []).map(
          (item: RecipeIngredient) => ({
            ingredientId: item.ingredient.id,
            quantity: String(item.quantity),
            ingredient: {
              id: item.ingredient.id,
              name: item.ingredient.name,
              unit_of_measure: item.ingredient.unit_of_measure || "",
            },
          })
        ),
      });
    }
  }, [recipeData]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      toast.error("Please log in to edit recipes");
    }
  }, [status, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (
    ingredients: EditableRecipe["ingredients"]
  ) => {
    setFormData((prev) => ({ ...prev, ingredients }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update recipe details
      const { data: recipeData } = await updateRecipe({
        variables: {
          id: recipeId,
          recipe: {
            title: formData.title,
            description: formData.description,
            instructions: formData.cookingMethod,
            prep_time_minutes: parseInt(formData.preparationTime.toString()),
            difficulty: formData.difficulty,
          },
        },
      });

      let ingredientsUpdated = true;

      // Update recipe ingredients if there are any
      if (formData.ingredients.length > 0) {
        try {
          const ingredientData = formData.ingredients.map((item) => ({
            ingredient_id: item.ingredientId,
            quantity: parseFloat(item.quantity) || 1,
            unit: item.ingredient.unit_of_measure || "unit",
            notes: item.quantity,
          }));

          await updateRecipeIngredients({
            variables: {
              recipeId: recipeId,
              ingredients: ingredientData,
            },
          });
        } catch (ingredientError) {
          console.error("Error updating ingredients:", ingredientError);
          ingredientsUpdated = false;
        }
      }

      if (recipeData?.updateRecipe?.id) {
        if (ingredientsUpdated) {
          toast.success("Recipe and ingredients updated successfully!");
        } else {
          toast.success(
            "Recipe details updated, but there was an issue with ingredients."
          );
        }
        router.push(`/recipes/${recipeId}`);
      } else {
        toast.error("Failed to update recipe");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("An error occurred while updating the recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (recipeLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-12 w-3/4 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 w-full bg-gray-200 rounded mb-6"></div>
          <div className="h-12 w-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Recipe</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8"
      >
        <div className="grid gap-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Recipe Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="preparationTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preparation Time (minutes)
              </label>
              <input
                type="number"
                id="preparationTime"
                name="preparationTime"
                min="0"
                value={formData.preparationTime}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="cookingMethod"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cooking Method
            </label>
            <textarea
              id="cookingMethod"
              name="cookingMethod"
              value={formData.cookingMethod}
              onChange={handleInputChange}
              rows={6}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <IngredientManager
            ingredients={formData.ingredients}
            onChange={handleIngredientChange}
          />
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-orange-600"
            isLoading={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
