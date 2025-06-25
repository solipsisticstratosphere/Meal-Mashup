export type IngredientCategory =
  | "Meat"
  | "Vegetables"
  | "Fruit"
  | "Grains"
  | "Dairy"
  | "Spices"
  | "Herbs"
  | "Oil"
  | "Condiment"
  | "Other"
  | "Protein"
  | "Seafood"
  | "Legumes"
  | "Bakery"
  | "Baking"
  | "Nuts"
  | "Seeds"
  | "Sweeteners"
  | "Beverages"
  | "Spreads";

export interface Ingredient {
  id: string;
  name: string;
  image_url: string;
  category: IngredientCategory;
  unit_of_measure?: string;
  commonPairings?: string[];
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredient: {
    id: string;
    name: string;
    image_url?: string;
    category?: string;
    unit_of_measure?: string;
  };
  quantity: string | number;
  unit?: string;
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
  rating?: number | null;
  likes?: number;
  dislikes?: number;
  userVote?: "like" | "dislike" | null;
  userId?: string;
  user_id?: string;
  tags?: string[];
  isSaved?: boolean;
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

export type VoteType = "like" | "dislike";
