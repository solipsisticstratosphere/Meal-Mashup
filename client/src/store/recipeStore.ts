import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Ingredient, Recipe, VoteType } from "@/lib/types";

interface UserVote {
  recipeId: string;
  voteType: VoteType | null;
  userId?: string;
  timestamp: number;
}

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

  votedRecipes: Record<string, VoteType | null>;
  userVotes: UserVote[];
  voteRecipe: (
    recipeId: string,
    voteType: VoteType | null,
    userId?: string
  ) => void;
  clearUserVotes: (userId?: string) => void;

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
      userVotes: [],
      voteRecipe: (recipeId, voteType, userId) =>
        set((state) => {
          const updatedVotedRecipes = {
            ...state.votedRecipes,
            [recipeId]: voteType,
          };

          const updatedUserVotes = [
            ...state.userVotes.filter(
              (vote) =>
                vote.recipeId !== recipeId || (userId && vote.userId !== userId)
            ),
          ];

          if (voteType !== null) {
            updatedUserVotes.push({
              recipeId,
              voteType,
              userId,
              timestamp: Date.now(),
            });
          }

          return {
            votedRecipes: updatedVotedRecipes,
            userVotes: updatedUserVotes,
          };
        }),

      clearUserVotes: (userId) =>
        set((state) => {
          if (userId) {
            const updatedUserVotes = state.userVotes.filter(
              (vote) => vote.userId !== userId
            );

            const updatedVotedRecipes = { ...state.votedRecipes };
            state.userVotes.forEach((vote) => {
              if (vote.userId === userId) {
                delete updatedVotedRecipes[vote.recipeId];
              }
            });

            return {
              userVotes: updatedUserVotes,
              votedRecipes: updatedVotedRecipes,
            };
          } else {
            return {
              userVotes: [],
              votedRecipes: {},
            };
          }
        }),

      isGenerating: false,
      setIsGenerating: (isGenerating) => set({ isGenerating }),
    }),
    {
      name: "meal-mashup-storage",
    }
  )
);
