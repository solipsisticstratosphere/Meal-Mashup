"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FoodCard } from "../../components/main/food-card";
import Button from "../../components/ui/Button";
import { useQuery } from "@apollo/client";
import { GET_MY_RECIPES } from "@/lib/graphql";
import { useSession } from "next-auth/react";

interface MyRecipe {
  id: string;
  title: string;
  image_url?: string;
  tags?: string[];
  rating?: number;
  userVote?: "like" | "dislike" | null;
  likes?: number;
  dislikes?: number;
}

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Recipes</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Browse through all the recipes you&apos;ve created
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
                  className="shadow-md shadow-blue-100 group"
                >
                  Log In
                </Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {userRecipes.map((recipe: MyRecipe, index: number) => (
                <FoodCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  image={recipe.image_url || ""}
                  tags={recipe.tags || []}
                  rating={recipe.rating || 0}
                  featured={index === 0}
                  from="my-recipes"
                  userVote={recipe.userVote}
                  likes={recipe.likes || 0}
                  dislikes={recipe.dislikes || 0}
                />
              ))}
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
                  className="shadow-md shadow-blue-100 group"
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
