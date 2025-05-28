// store/recipeStore.ts
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Ingredient, Recipe, VoteType } from "@/lib/types";

interface UserVote {
  recipeId: string;
  voteType: VoteType | null;
  userId?: string;
  timestamp: number;
}

interface RecipeDataState {
  selectedIngredients: Ingredient[];
  currentRecipe: Recipe | null;
  savedRecipes: Recipe[];
  votedRecipes: Record<string, VoteType | null>;
  userVotes: UserVote[];
  isGenerating: boolean;
}

interface RecipeActions {
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: string) => void;
  clearIngredients: () => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  saveRecipe: (recipe: Recipe) => void;
  removeSavedRecipe: (id: string) => void;
  voteRecipe: (
    recipeId: string,
    voteType: VoteType | null,
    userId?: string
  ) => void;
  clearUserVotes: (userId?: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  resetStoreToInitial: () => void;
}

export type RecipeStoreState = RecipeDataState & RecipeActions;

const initialDataState: RecipeDataState = {
  selectedIngredients: [],
  currentRecipe: null,
  savedRecipes: [],
  votedRecipes: {},
  userVotes: [],
  isGenerating: false,
};

const storeCreator: StateCreator<RecipeStoreState, [], [], RecipeStoreState> = (
  set
) => ({
  ...initialDataState,

  addIngredient: (ingredient) =>
    set((state) => ({
      selectedIngredients: [...state.selectedIngredients, ingredient],
    })),
  removeIngredient: (id) =>
    set((state) => ({
      selectedIngredients: state.selectedIngredients.filter(
        (ing) => ing.id !== id
      ),
    })),
  clearIngredients: () =>
    set({ selectedIngredients: initialDataState.selectedIngredients }), // Сброс к начальному

  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),

  saveRecipe: (recipe) =>
    set((state) => {
      const existingIndex = state.savedRecipes.findIndex(
        (r) => r.id === recipe.id
      );
      if (existingIndex >= 0) {
        const updatedRecipes = [...state.savedRecipes];
        updatedRecipes[existingIndex] = { ...recipe, isSaved: true };
        return { savedRecipes: updatedRecipes };
      }
      return {
        savedRecipes: [...state.savedRecipes, { ...recipe, isSaved: true }],
      };
    }),
  removeSavedRecipe: (id) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.filter((r) => r.id !== id),
    })),

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
          if (
            vote.userId === userId &&
            updatedVotedRecipes[vote.recipeId] !== undefined
          ) {
            delete updatedVotedRecipes[vote.recipeId];
          }
        });
        return {
          userVotes: updatedUserVotes,
          votedRecipes: updatedVotedRecipes,
        };
      } else {
        return {
          userVotes: initialDataState.userVotes,
          votedRecipes: initialDataState.votedRecipes,
        };
      }
    }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  resetStoreToInitial: () => {
    set(initialDataState);
  },
});

export const useRecipeStore = create<RecipeStoreState>()(
  persist(storeCreator, {
    name: "meal-mashup-storage",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => {
      const dataToPersist: RecipeDataState = {
        selectedIngredients: state.selectedIngredients,
        currentRecipe: state.currentRecipe,
        savedRecipes: state.savedRecipes,
        votedRecipes: state.votedRecipes,
        userVotes: state.userVotes,
        isGenerating: state.isGenerating,
      };
      return dataToPersist;
    },
  })
);
