import { NextRequest, NextResponse } from "next/server";
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  searchIngredients,
  IngredientInput,
} from "@/lib/models/Ingredient";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const id = searchParams.get("id");

  try {
    if (id) {
      const ingredient = await getIngredientById(id);
      if (!ingredient) {
        return NextResponse.json(
          { error: "Ingredient not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(ingredient);
    }

    if (search) {
      const ingredients = await searchIngredients(search);
      return NextResponse.json(ingredients);
    }

    const ingredients = await getAllIngredients();
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ingredient = await createIngredient(body as IngredientInput);
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Ingredient ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const ingredient = await updateIngredient(id, body);

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to update ingredient" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Ingredient ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteIngredient(id);
    if (!success) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  }
}
