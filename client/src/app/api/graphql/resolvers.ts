import { ValidationError } from "apollo-server-micro";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { generateRecipeFromIngredients } from "@/lib/huggingface";
import type { Ingredient } from "@prisma/client";

interface User {
  id: string;
  email: string;
}

const DEMO_USER_ID = "demo-user-id";

export const resolvers = {
  Query: {
    ingredients: async (
      _: unknown,
      { search, category }: { search?: string; category?: string }
    ) => {
      const where = {
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        ...(category ? { category } : {}),
      };

      return await prisma.ingredient.findMany({ where });
    },

    recipe: async (_: unknown, { id }: { id: string }) => {
      return await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    },

    popularRecipes: async (_: unknown, { limit }: { limit: number }) => {
      return await prisma.recipe.findMany({
        take: limit || 10,
        orderBy: {
          votes: "desc",
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    },

    myRecipes: async (_: unknown, __: unknown, { user }: { user?: User }) => {
      if (!user) {
        return [];
      }

      return await prisma.recipe.findMany({
        where: {
          userId: user.id,
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    },
  },

  Mutation: {
    generateRecipe: async (
      _: unknown,
      { ingredients }: { ingredients: string[] }
    ) => {
      try {
        if (!ingredients || ingredients.length === 0) {
          throw new ValidationError("At least one ingredient is required");
        }

        const ingredientDetails = await prisma.ingredient.findMany({
          where: {
            id: {
              in: ingredients,
            },
          },
        });

        if (ingredientDetails.length === 0) {
          throw new ValidationError("No valid ingredients found");
        }

        const uniqueIngredients = ingredientDetails.filter(
          (ing: Ingredient, index: number, self: Ingredient[]) =>
            index === self.findIndex((i: Ingredient) => i.id === ing.id)
        );

        if (uniqueIngredients.length !== ingredientDetails.length) {
          console.log(
            "Removed duplicate ingredients. Using unique ingredients:",
            uniqueIngredients
          );
        }

        const ingredientNames = uniqueIngredients.map(
          (ing: Ingredient) => ing.name
        );

        const generatedRecipe = await generateRecipeFromIngredients(
          ingredientNames
        );

        const recipe = {
          id: uuidv4(),
          title: generatedRecipe.title,
          description: generatedRecipe.description || "",
          cookingMethod: generatedRecipe.cookingMethod,
          preparationTime: generatedRecipe.preparationTime,
          difficulty: generatedRecipe.difficulty,
          userId: DEMO_USER_ID,
          votes: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const createdRecipe = await prisma.recipe.create({
          data: {
            ...recipe,
            ingredients: {
              create: uniqueIngredients.map((ingredient: Ingredient) => {
                const generatedIngredient = generatedRecipe.ingredients.find(
                  (gi) =>
                    gi.name
                      .toLowerCase()
                      .includes(ingredient.name.toLowerCase())
                );

                return {
                  quantity: generatedIngredient?.quantity || "to taste",
                  ingredient: {
                    connect: { id: ingredient.id },
                  },
                };
              }),
            },
          },
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        });

        return createdRecipe;
      } catch (error) {
        console.error("Error generating recipe:", error);
        throw error;
      }
    },

    voteRecipe: async (
      _: unknown,
      { recipeId, vote }: { recipeId: string; vote: "up" | "down" }
    ) => {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
      });

      if (!recipe) {
        throw new ValidationError("Recipe not found");
      }

      const voteValue = vote === "up" ? 1 : -1;

      return await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          votes: recipe.votes + voteValue,
        },
      });
    },

    saveRecipe: async (
      _: unknown,
      { recipeId }: { recipeId: string },
      { user }: { user?: User }
    ) => {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
      });

      if (!recipe) {
        throw new ValidationError("Recipe not found");
      }

      if (!user) {
        return {
          success: false,
          requiresAuth: true,
          recipe,
        };
      }

      return {
        success: true,
        requiresAuth: false,
        recipe,
      };
    },

    register: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      return {
        token: "mock-jwt-token",
        user: {
          id: DEMO_USER_ID,
          email,
        },
      };
    },

    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      return {
        token: "mock-jwt-token",
        user: {
          id: DEMO_USER_ID,
          email,
        },
      };
    },
  },
};
