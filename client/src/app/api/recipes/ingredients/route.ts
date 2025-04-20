import { NextRequest, NextResponse } from "next/server";
import {
  addIngredientToRecipe,
  removeIngredientFromRecipe,
  updateRecipeIngredient,
  RecipeIngredient,
} from "@/lib/models/Recipe";
import { getIngredientsForRecipe } from "@/lib/models/Ingredient";

// GET /api/recipes/ingredients?recipeId=[id]
export async function GET(request: NextRequest) {
  const recipeId = request.nextUrl.searchParams.get("recipeId");

  if (!recipeId) {
    return NextResponse.json(
      { error: "Recipe ID is required" },
      { status: 400 }
    );
  }

  try {
    const ingredients = await getIngredientsForRecipe(recipeId);
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching recipe ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe ingredients" },
      { status: 500 }
    );
  }
}

// POST /api/recipes/ingredients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.recipe_id || !body.ingredient_id) {
      return NextResponse.json(
        {
          error: "Recipe ID and Ingredient ID are required",
        },
        { status: 400 }
      );
    }

    const recipeIngredient = await addIngredientToRecipe(
      body as RecipeIngredient
    );
    return NextResponse.json(recipeIngredient, { status: 201 });
  } catch (error) {
    console.error("Error adding ingredient to recipe:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient to recipe" },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/ingredients?recipeId=[id]&ingredientId=[id]
export async function PUT(request: NextRequest) {
  try {
    const recipeId = request.nextUrl.searchParams.get("recipeId");
    const ingredientId = request.nextUrl.searchParams.get("ingredientId");

    if (!recipeId || !ingredientId) {
      return NextResponse.json(
        { error: "Recipe ID and Ingredient ID are required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const recipeIngredient = await updateRecipeIngredient(
      recipeId,
      ingredientId,
      body
    );

    if (!recipeIngredient) {
      return NextResponse.json(
        { error: "Recipe ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recipeIngredient);
  } catch (error) {
    console.error("Error updating recipe ingredient:", error);
    return NextResponse.json(
      { error: "Failed to update recipe ingredient" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/ingredients?recipeId=[id]&ingredientId=[id]
export async function DELETE(request: NextRequest) {
  try {
    const recipeId = request.nextUrl.searchParams.get("recipeId");
    const ingredientId = request.nextUrl.searchParams.get("ingredientId");

    if (!recipeId || !ingredientId) {
      return NextResponse.json(
        { error: "Recipe ID and Ingredient ID are required" },
        { status: 400 }
      );
    }

    const success = await removeIngredientFromRecipe(recipeId, ingredientId);

    if (!success) {
      return NextResponse.json(
        { error: "Recipe ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing ingredient from recipe:", error);
    return NextResponse.json(
      { error: "Failed to remove ingredient from recipe" },
      { status: 500 }
    );
  }
}
