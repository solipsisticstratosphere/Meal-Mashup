"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import { useQuery } from "@apollo/client";
import { GET_MY_RECIPES } from "@/lib/graphql";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Recipe } from "@/lib/types";

export default function MyRecipes() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { data, loading, error } = useQuery(GET_MY_RECIPES, {
    skip: !isAuthenticated,
    fetchPolicy: "network-only",
  });

  const userRecipes = data?.myRecipes || [];
  const isLoading = loading || status === "loading";

  return (
    <div className="min-h-screen pb-16">
      <section className="pt-10 md:pt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
              My Recipes
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Manage all the recipes you&apos;ve created
            </p>
          </div>

          {!isAuthenticated && status !== "loading" ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
              <h3 className="text-xl font-medium mb-4">
                You need to be logged in to view your recipes
              </h3>
              <p className="text-slate-600 mb-8">
                Please log in to see and create your recipes
              </p>
              <Link href="/auth/login">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-md bg-gradient-to-r from-amber-500 to-orange-600 group"
                >
                  Log In
                </Button>
              </Link>
            </div>
          ) : isLoading ? (
            <Loading text="Loading your recipes" />
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
              <h3 className="text-xl font-medium text-red-600 mb-4">
                Error loading recipes
              </h3>
              <p className="text-slate-600 mb-8">
                {error.message || "Something went wrong"}
              </p>
            </div>
          ) : userRecipes.length > 0 ? (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="flex justify-end">
                <Link href="/create-recipe">
                  <Button
                    variant="primary"
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Recipe
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {userRecipes.map((recipe: Recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showOwnerControls={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
              <h3 className="text-xl font-medium mb-4">
                You haven&apos;t created any recipes yet
              </h3>
              <p className="text-slate-600 mb-8">
                Start creating your own unique recipes and they&apos;ll appear
                here
              </p>
              <Link href="/create-recipe">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-md bg-gradient-to-r from-amber-500 to-orange-600 group"
                  icon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  Create Your First Recipe
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
