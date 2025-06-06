"use client";

import { useQuery } from "@apollo/client";
import { GET_RECIPE } from "@/lib/graphql";
import RecipeCard from "@/components/recipe/RecipeCard";
import { useParams, useSearchParams } from "next/navigation";
import { ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import Loading from "@/components/ui/Loading";

export default function RecipeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const recipeId = params.id as string;
  const fromMyRecipes = searchParams.get("from") === "my-recipes";
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_RECIPE, {
    variables: { id: recipeId },
    skip: !recipeId,
  });

  const isUserRecipe = user && data?.recipe?.user_id === user.id ? true : false;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Link
        href={fromMyRecipes ? "/my-recipes" : "/popular"}
        className="inline-flex items-center mb-8 text-amber-600 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {fromMyRecipes ? "Back to My Recipes" : "Back to Popular Recipes"}
      </Link>

      {loading && <Loading text="Loading recipe details" />}

      {error && (
        <div className="p-6 mb-6 text-red-700 bg-red-50 rounded-xl border border-red-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
          <p>Error loading recipe: {error.message}</p>
        </div>
      )}

      {!loading && !data?.recipe && (
        <div className="text-center py-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-md border border-amber-100">
          <ChefHat className="w-20 h-20 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold mb-3 text-amber-800">
            Recipe Not Found
          </h2>
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            The recipe you are looking for does not exist or has been removed.
          </p>
          <Link href={fromMyRecipes ? "/my-recipes" : "/popular"}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
              {fromMyRecipes ? "Back to My Recipes" : "Browse Popular Recipes"}
            </Button>
          </Link>
        </div>
      )}

      {data?.recipe && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <RecipeCard recipe={data.recipe} showOwnerControls={isUserRecipe} />
        </div>
      )}
    </div>
  );
}
