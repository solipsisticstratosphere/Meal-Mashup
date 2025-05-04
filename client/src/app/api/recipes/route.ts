import { NextRequest, NextResponse } from "next/server";
import {
  getAllRecipes,
  getRecipeById,
  searchRecipes,
  getRecipesByTag,
  getFeaturedRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  RecipeInput,
  getRecipesByUserId,
} from "@/lib/models/Recipe";
import { getIngredientsForRecipe } from "@/lib/models/Ingredient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";

// GET /api/recipes
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const id = searchParams.get("id");
  const tag = searchParams.get("tag");
  const featured = searchParams.get("featured");
  const withIngredients = searchParams.get("withIngredients") === "true";
  const myRecipes = searchParams.get("myRecipes") === "true";

  try {
    if (myRecipes) {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const recipes = await getRecipesByUserId(session.user.id);
      return NextResponse.json(recipes);
    }

    if (id) {
      const recipe = await getRecipeById(id);
      if (!recipe) {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }

      if (withIngredients) {
        const ingredients = await getIngredientsForRecipe(id);
        return NextResponse.json({ ...recipe, ingredients });
      }

      return NextResponse.json(recipe);
    }

    if (search) {
      const recipes = await searchRecipes(search);
      return NextResponse.json(recipes);
    }

    if (tag) {
      const recipes = await getRecipesByTag(tag);
      return NextResponse.json(recipes);
    }

    if (featured === "true") {
      const recipes = await getFeaturedRecipes();
      return NextResponse.json(recipes);
    }

    const recipes = await getAllRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST /api/recipes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (session && session.user) {
      body.user_id = session.user.id;
    } else {
      return NextResponse.json(
        { error: "Recipe not saved. Authentication required." },
        { status: 401 }
      );
    }

    const recipe = await createRecipe(body as RecipeInput);
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

// PUT /api/recipes?id=[id]
export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const recipe = await updateRecipe(id, body);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes?id=[id]
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteRecipe(id);
    if (!success) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
