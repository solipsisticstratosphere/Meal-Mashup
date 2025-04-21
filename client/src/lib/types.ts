export type IngredientCategory =
  | "Protein"
  | "Vegetables"
  | "Fruit"
  | "Grain"
  | "Dairy"
  | "Spice"
  | "Herb"
  | "Oil"
  | "Condiment"
  | "Other";

export interface Ingredient {
  id: string;
  name: string;
  image_url: string;
  category: IngredientCategory;
  commonPairings?: string[];
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredient: Ingredient;
  quantity: string;
}

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  ingredients: RecipeIngredient[];
  cookingMethod: string;
  preparationTime: number;
  difficulty: DifficultyLevel;
  createdAt: Date | string;
  votes: number;
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  savedRecipes: string[];
  votedRecipes: {
    recipeId: string;
    vote: "up" | "down";
  }[];
  createdAt: Date;
}

export interface Session {
  id: string;
  selectedIngredients: string[];
  currentRecipe?: string;
  temporaryVotes: {
    recipeId: string;
    vote: "up" | "down";
  }[];
  createdAt: Date;
  expiresAt: Date;
}

export type VoteType = "up" | "down";
