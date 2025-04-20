import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Ingredient, Recipe, VoteType } from "@/lib/types";

interface RecipeState {
  selectedIngredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: string) => void;
  clearIngredients: () => void;

  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe | null) => void;

  savedRecipes: Recipe[];
  saveRecipe: (recipe: Recipe) => void;
  removeSavedRecipe: (id: string) => void;

  votedRecipes: Record<string, VoteType>;
  voteRecipe: (recipeId: string, voteType: VoteType) => void;

  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set) => ({
      selectedIngredients: [],
      addIngredient: (ingredient) =>
        set((state) => ({
          selectedIngredients: [...state.selectedIngredients, ingredient],
        })),
      removeIngredient: (id) =>
        set((state) => ({
          selectedIngredients: state.selectedIngredients.filter(
            (ingredient) => ingredient.id !== id
          ),
        })),
      clearIngredients: () => set({ selectedIngredients: [] }),

      currentRecipe: null,
      setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),

      savedRecipes: [],
      saveRecipe: (recipe) =>
        set((state) => ({
          savedRecipes: [...state.savedRecipes, recipe],
        })),
      removeSavedRecipe: (id) =>
        set((state) => ({
          savedRecipes: state.savedRecipes.filter((recipe) => recipe.id !== id),
        })),

      votedRecipes: {},
      voteRecipe: (recipeId, voteType) =>
        set((state) => ({
          votedRecipes: { ...state.votedRecipes, [recipeId]: voteType },
        })),

      isGenerating: false,
      setIsGenerating: (isGenerating) => set({ isGenerating }),
    }),
    {
      name: "meal-mashup-storage",
    }
  )
);
