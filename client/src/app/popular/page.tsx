"use client";

import { useQuery } from "@apollo/client";
import { GET_POPULAR_RECIPES } from "@/lib/graphql";
import RecipeCard from "@/components/recipe/RecipeCard";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Recipe } from "@/lib/types";

export default function PopularRecipesPage() {
  const { data, loading, error } = useQuery(GET_POPULAR_RECIPES, {
    variables: { limit: 10 },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Popular Recipes</h1>
          <p className="text-gray-600 mt-2">
            Recipes are sorted by popularity based on user votes
          </p>
        </div>
        <Link href="/create-recipe">
          <Button>Create Your Own</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading recipes from database...</p>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          Error loading popular recipes: {error.message}
        </div>
      )}

      {data?.popularRecipes?.length === 0 && !loading && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">No Recipes Found</h2>
          <p className="text-gray-600 mb-6">
            It seems there are no recipes in the database yet. Be the first to
            create one!
          </p>
          <Link href="/create-recipe">
            <Button>Create a Recipe</Button>
          </Link>
        </div>
      )}

      {data?.popularRecipes?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.popularRecipes.map((recipe: Recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
