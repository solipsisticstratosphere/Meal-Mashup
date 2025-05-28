"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { GET_RECIPE, UPDATE_RECIPE, GET_INGREDIENTS } from "@/lib/graphql";
import Button from "@/components/ui/Button";
import { Recipe, RecipeIngredient, Ingredient } from "@/lib/types";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useSession } from "next-auth/react";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: recipeData, loading: recipeLoading } = useQuery(GET_RECIPE, {
    variables: { id: recipeId },
    skip: !recipeId,
  });

  const { data: ingredientsData } = useQuery(GET_INGREDIENTS, {
    variables: { search: searchTerm },
    skip: !searchTerm,
  });

  const [updateRecipe] = useMutation(UPDATE_RECIPE);

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

  const handleAddIngredient = () => {
    if (!selectedIngredient || !ingredientQuantity) {
      toast.error("Please select an ingredient and specify quantity");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredientId: selectedIngredient.id,
          quantity: ingredientQuantity,
          ingredient: {
            id: selectedIngredient.id,
            name: selectedIngredient.name,
            unit_of_measure: selectedIngredient.unit_of_measure || "",
          },
        },
      ],
    }));

    setSelectedIngredient(null);
    setIngredientQuantity("");
    setSearchTerm("");
  };

  // const handleRemoveIngredient = (id: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     ingredients: prev.ingredients.filter((item) => item.ingredientId !== id),
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await updateRecipe({
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

      if (data?.updateRecipe?.id) {
        toast.success("Recipe updated successfully!");
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

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ingredients
            </h3>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="ingredientSearch"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Search for ingredient
                  </label>
                  <input
                    type="text"
                    id="ingredientSearch"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Search ingredients..."
                  />

                  {searchTerm && ingredientsData?.ingredients && (
                    <div className="mt-1 p-2 bg-white border border-gray-300 rounded-xl shadow-sm max-h-40 overflow-y-auto">
                      {ingredientsData.ingredients.map(
                        (ingredient: Ingredient) => (
                          <div
                            key={ingredient.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg"
                            onClick={() => {
                              setSelectedIngredient(ingredient);
                              setSearchTerm(ingredient.name);
                            }}
                          >
                            {ingredient.name}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="quantity"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-l-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g. 100g"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-4 py-3 bg-amber-500 text-white rounded-r-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </h4>
              {formData.ingredients.length === 0 ? (
                <p className="text-gray-500 italic">No ingredients added yet</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {formData.ingredients.map((item) => (
                    <li
                      key={item.ingredientId}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">
                          {item.ingredient.name}
                        </span>
                        <span className="ml-2 text-gray-600">
                          ({item.quantity} {item.ingredient.unit_of_measure})
                        </span>
                      </div>
                      {/* <button
                        type="button"
                        onClick={() =>
                          handleRemoveIngredient(item.ingredientId)
                        }
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash className="w-4 h-4" />
                      </button> */}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
