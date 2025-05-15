"use client";

import { useQuery } from "@apollo/client";
import { GET_POPULAR_RECIPES } from "@/lib/graphql";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { Recipe } from "@/lib/types";
import { ChefHat, PlusCircle } from "lucide-react";
import { FoodCard } from "@/components/main/food-card";
import Loading from "@/components/ui/Loading";

export default function PopularRecipesPage() {
  const { data, loading, error } = useQuery(GET_POPULAR_RECIPES, {
    variables: { limit: 20 },
    fetchPolicy: "network-only",
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Popular Recipes
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Recipes are sorted by popularity based on user votes
          </p>
        </div>
        <Link href="/create-recipe">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-md  transition-all">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Your Own
          </Button>
        </Link>
      </div>

      {loading && <Loading text="Loading delicious recipes" />}

      {error && (
        <div className="p-6 mb-6 text-red-700 bg-red-50 rounded-xl border border-red-100 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
          <p>Error loading popular recipes: {error.message}</p>
        </div>
      )}

      {data?.popularRecipes?.length === 0 && !loading && (
        <div className="text-center py-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-md border border-amber-100">
          <ChefHat className="w-20 h-20 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold mb-3 text-amber-800">
            No Recipes Found
          </h2>
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            It seems there are no recipes in the database yet. Be the first to
            create one!
          </p>
          <Link href="/create-recipe">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
              Create a Recipe
            </Button>
          </Link>
        </div>
      )}

      {data?.popularRecipes?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.popularRecipes.map((recipe: Recipe, index: number) => (
            <div
              key={recipe.id}
              className="transform transition-transform hover:scale-[1.02] hover:shadow-2xl"
            >
              <FoodCard
                id={recipe.id}
                title={recipe.title}
                image={recipe.image_url || ""}
                tags={recipe.tags || []}
                rating={recipe.votes || 0}
                featured={index === 0}
                from="popular"
                userVote={recipe.userVote}
                likes={recipe.likes || 0}
                dislikes={recipe.dislikes || 0}
                isSaved={recipe.isSaved}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
