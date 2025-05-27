import { query, getById, insert, update, remove } from "../db.server";

export interface Ingredient {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  unit_of_measure: string | null;
  created_at: Date;
  updated_at: Date;
}

export type IngredientInput = Omit<
  Ingredient,
  "id" | "created_at" | "updated_at"
>;

export async function getAllIngredients(): Promise<Ingredient[]> {
  return await query<Ingredient>("SELECT * FROM ingredients ORDER BY name");
}

export async function getIngredientById(
  id: string
): Promise<Ingredient | null> {
  return await getById<Ingredient>("ingredients", id);
}

export async function searchIngredients(
  searchTerm: string
): Promise<Ingredient[]> {
  return await query<Ingredient>(
    "SELECT * FROM ingredients WHERE name ILIKE $1 ORDER BY name",
    [`%${searchTerm}%`]
  );
}

export async function getIngredientsByCategory(
  category: string
): Promise<Ingredient[]> {
  return await query<Ingredient>(
    "SELECT * FROM ingredients WHERE category = $1 ORDER BY name",
    [category]
  );
}

export async function createIngredient(
  data: IngredientInput
): Promise<Ingredient> {
  return await insert<Ingredient>("ingredients", data);
}

export async function updateIngredient(
  id: string,
  data: Partial<IngredientInput>
): Promise<Ingredient | null> {
  return await update<Ingredient>(
    "ingredients",
    id,
    data as Record<string, unknown>
  );
}

export async function deleteIngredient(id: string): Promise<boolean> {
  return await remove("ingredients", id);
}

export async function getIngredientsForRecipe(
  recipeId: string
): Promise<
  (Ingredient & { quantity: number; unit: string; notes?: string })[]
> {
  return await query<
    Ingredient & { quantity: number; unit: string; notes?: string }
  >(
    `SELECT i.*, ri.quantity, ri.unit, ri.notes 
     FROM ingredients i
     JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = $1
     ORDER BY i.name`,
    [recipeId]
  );
}
