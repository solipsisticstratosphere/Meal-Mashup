import {
  query,
  getById,
  insert,
  update,
  remove,
  transaction,
} from "../db.server";
import { PoolClient } from "pg";
import crypto from "crypto";

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  difficulty: "easy" | "medium" | "hard" | null;
  instructions: string | null;
  tags: string[];
  rating: number | null;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: string | null;
}

export type RecipeInput = Omit<Recipe, "id" | "created_at" | "updated_at">;

export interface RecipeIngredient {
  id?: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  return await query<Recipe>("SELECT * FROM recipes ORDER BY title");
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return await getById<Recipe>("recipes", id);
}

export async function searchRecipes(searchTerm: string): Promise<Recipe[]> {
  return await query<Recipe>(
    "SELECT * FROM recipes WHERE title ILIKE $1 ORDER BY title",
    [`%${searchTerm}%`]
  );
}

export async function getRecipesByTag(tag: string): Promise<Recipe[]> {
  return await query<Recipe>(
    "SELECT * FROM recipes WHERE $1 = ANY(tags) ORDER BY title",
    [tag]
  );
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  return await query<Recipe>(
    "SELECT * FROM recipes WHERE featured = true ORDER BY rating DESC NULLS LAST"
  );
}

export async function createRecipe(data: RecipeInput): Promise<Recipe> {
  return await insert<Recipe>("recipes", data);
}

export async function updateRecipe(
  id: string,
  data: Partial<RecipeInput>
): Promise<Recipe | null> {
  return await update<Recipe>("recipes", id, data as Record<string, unknown>);
}

export async function deleteRecipe(id: string): Promise<boolean> {
  return await remove("recipes", id);
}

export async function addIngredientToRecipe(
  data: RecipeIngredient
): Promise<RecipeIngredient> {
  return await insert<RecipeIngredient>(
    "recipe_ingredients",
    data as unknown as Record<string, unknown>
  );
}

export async function removeIngredientFromRecipe(
  recipeId: string,
  ingredientId: string
): Promise<boolean> {
  const result = await query(
    "DELETE FROM recipe_ingredients WHERE recipe_id = $1 AND ingredient_id = $2 RETURNING id",
    [recipeId, ingredientId]
  );
  return result.length > 0;
}

export async function updateRecipeIngredient(
  recipeId: string,
  ingredientId: string,
  data: Partial<RecipeIngredient>
): Promise<RecipeIngredient | null> {
  const { quantity, unit, notes } = data;
  const updateData: Record<string, unknown> = {};

  if (quantity !== undefined) updateData.quantity = quantity;
  if (unit !== undefined) updateData.unit = unit;
  if (notes !== undefined) updateData.notes = notes;

  const result = await query<RecipeIngredient>(
    `UPDATE recipe_ingredients 
     SET ${Object.keys(updateData)
       .map((key, i) => `${key} = $${i + 1}`)
       .join(", ")}
     WHERE recipe_id = $${
       Object.keys(updateData).length + 1
     } AND ingredient_id = $${Object.keys(updateData).length + 2}
     RETURNING *`,
    [...Object.values(updateData), recipeId, ingredientId]
  );

  return result.length > 0 ? result[0] : null;
}

export async function createCompleteRecipe(
  recipeData: RecipeInput,
  ingredientData: Omit<RecipeIngredient, "recipe_id">[]
): Promise<Recipe> {
  return await transaction<Recipe>(async (client: PoolClient) => {
    const recipeResult = await client.query(
      `INSERT INTO recipes (
        id, title, description, image_url, prep_time_minutes, cook_time_minutes, 
        servings, difficulty, instructions, tags, rating, featured, user_id, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP) RETURNING *`,
      [
        crypto.randomUUID(),
        recipeData.title,
        recipeData.description,
        recipeData.image_url,
        recipeData.prep_time_minutes,
        recipeData.cook_time_minutes,
        recipeData.servings,
        recipeData.difficulty,
        recipeData.instructions,
        recipeData.tags,
        recipeData.rating,
        recipeData.featured,
        recipeData.user_id || null,
      ]
    );

    const recipe = recipeResult.rows[0];

    for (const ingredient of ingredientData) {
      await client.query(
        `INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit, notes, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          crypto.randomUUID(),
          recipe.id,
          ingredient.ingredient_id,
          ingredient.quantity,
          ingredient.unit,
          ingredient.notes || null,
        ]
      );
    }

    return recipe;
  });
}

export async function getRecipesByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): Promise<Recipe[]> {
  return await query<Recipe>(
    "SELECT * FROM recipes WHERE difficulty = $1 ORDER BY title",
    [difficulty]
  );
}

export async function getRecipesByUserId(
  userId: string,
  limit?: number,
  offset?: number
): Promise<Recipe[]> {
  let sql = "SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC";
  const params: (string | number)[] = [userId];

  if (limit !== undefined) {
    sql += " LIMIT $2";
    params.push(limit);

    if (offset !== undefined) {
      sql += " OFFSET $3";
      params.push(offset);
    }
  }

  return await query<Recipe>(sql, params);
}
