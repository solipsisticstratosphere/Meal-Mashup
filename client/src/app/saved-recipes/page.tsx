"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_SAVED_RECIPES } from "@/lib/graphql";
import PageTitle from "../../components/ui/PageTitle";
import EmptyState from "../../components/ui/EmptyState";
import Loading from "../../components/ui/Loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Recipe } from "@/lib/types";
import { FoodCard } from "@/components/main/food-card";

export default function SavedRecipesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { data, error } = useQuery(GET_SAVED_RECIPES, {
    skip: status === "unauthenticated",
    onCompleted: () => setIsLoading(false),
    onError: () => setIsLoading(false),
  });

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/saved-recipes");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <PageTitle title="Saved Recipes" />
        <EmptyState
          title="Error Loading Saved Recipes"
          description={`Something went wrong: ${error.message}`}
          icon={<Bookmark className="h-12 w-12 text-gray-400" />}
        />
      </div>
    );
  }

  const savedRecipes = data?.savedRecipes || [];

  return (
    <div className="container mx-auto py-10">
      <PageTitle
        title="Saved Recipes"
        subtitle="Your collection of saved favorite recipes"
      />

      {savedRecipes.length === 0 ? (
        <EmptyState
          title="No Saved Recipes Yet"
          description="Save recipes that you like to find them easily later"
          icon={<Bookmark className="h-12 w-12 text-gray-400" />}
          action={{
            label: "Discover Recipes",
            href: "/recipes",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {savedRecipes.map(
            (recipe: Recipe & { isSaved?: boolean }, index: number) => (
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
                  from="saved"
                  userVote={recipe.userVote}
                  likes={recipe.likes || 0}
                  dislikes={recipe.dislikes || 0}
                  isSaved={recipe.isSaved === undefined ? true : recipe.isSaved}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
