"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FoodCard } from "../../components/main/food-card";
import Button from "../../components/ui/Button";

interface Recipe {
  id: number;
  title: string;
  image: string;
  tags: string[];
  rating: number;
}

export default function MyRecipes() {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUserRecipes: Recipe[] = [
          {
            id: 1,
            title: "Homemade Pasta Carbonara",
            image: "/placeholder.svg?height=200&width=300",
            tags: ["Italian", "Dinner", "Pasta"],
            rating: 4.7,
          },
          {
            id: 2,
            title: "Quinoa Veggie Bowl",
            image: "/placeholder.svg?height=200&width=300",
            tags: ["Healthy", "Vegan", "Lunch"],
            rating: 4.5,
          },
          {
            id: 3,
            title: "Berry Smoothie Bowl",
            image: "/placeholder.svg?height=200&width=300",
            tags: ["Breakfast", "Healthy", "Quick"],
            rating: 4.8,
          },
        ];

        setUserRecipes(mockUserRecipes);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user recipes:", error);
        setIsLoading(false);
      }
    };

    fetchUserRecipes();
  }, []);

  return (
    <div className="min-h-screen  pb-16">
      <section className="pt-10 md:pt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Recipes</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Browse through all the recipes you've created and saved
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : userRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {userRecipes.map((recipe, index) => (
                <FoodCard
                  key={recipe.id}
                  title={recipe.title}
                  image={recipe.image}
                  tags={recipe.tags}
                  rating={recipe.rating}
                  featured={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm max-w-3xl mx-auto">
              <h3 className="text-xl font-medium mb-4">
                You haven't created any recipes yet
              </h3>
              <p className="text-slate-600 mb-8">
                Start creating your own unique recipes and they'll appear here
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
