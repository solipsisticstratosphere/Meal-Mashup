import { createSchema, createYoga } from "graphql-yoga";
import { NextRequest } from "next/server";
import {
  getAllIngredients,
  searchIngredients,
  getIngredientsByCategory,
  getIngredientById,
  getIngredientsForRecipe,
  Ingredient,
} from "@/lib/models/Ingredient";
import {
  getAllRecipes,
  getRecipeById,
  RecipeInput,
  createCompleteRecipe,
  RecipeIngredient,
  getRecipesByUserId,
} from "@/lib/models/Recipe";
import { generateRecipeFromIngredients } from "@/lib/huggingface";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/authOptions";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";

export const runtime = "nodejs";

// interface RecipeIngredientWithDetails extends Ingredient {
//   quantity: number;
//   unit: string;
//   notes?: string | null;
// }

interface RecipeVote {
  id: string;
  userId: string;
  recipeId: string;
  voteType: string;
  createdAt: Date;
}

async function getUserFromSession() {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user && session.user.id) {
      return session.user;
    }
    return null;
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

const typeDefs = `
  enum IngredientCategory {
    Meat
    Vegetables
    Fruit
    Grains
    Dairy
    Spices
    Herbs
    Oil
    Condiment
    Other
    Protein
    Vegetable
    Grain
    Herb
  }

  enum DifficultyLevel {
    easy
    medium
    hard
    Easy
    Medium
    Hard
  }

  enum VoteType {
    LIKE
    DISLIKE
    like
    dislike
  }

  type User {
    id: ID!
    email: String!
    name: String
    role: String
    image_url: String
  }

  type Ingredient {
    id: ID!
    name: String!
    image_url: String
    category: String
    unit_of_measure: String
  }

  type RecipeIngredient {
    ingredientId: ID!
    ingredient: Ingredient!
    quantity: String!
    unit: String
    notes: String
  }

  type Recipe {
    id: ID!
    title: String!
    description: String
    image_url: String
    prep_time_minutes: Int
    cook_time_minutes: Int
    servings: Int
    difficulty: String
    instructions: String
    cookingMethod: String
    preparationTime: Int
    ingredients: [RecipeIngredient!]!
    tags: [String]
    rating: Float
    featured: Boolean
    createdAt: String!
    votes: Int
    likes: Int
    dislikes: Int
    user_id: String
    userVote: String
    isSaved: Boolean
  }

  type RecipeVotes {
    likes: Int!
    dislikes: Int!
    userVote: String
  }

  input RecipeIngredientInput {
    ingredient_id: ID!
    quantity: Float!
    unit: String!
    notes: String
  }

  input RecipeInput {
    title: String!
    description: String
    image_url: String
    prep_time_minutes: Int
    cook_time_minutes: Int
    servings: Int
    difficulty: String
    instructions: String
    tags: [String]
    user_id: String
  }

  type Query {
    ingredients(search: String, category: String): [Ingredient!]!
    ingredient(id: ID!): Ingredient
    popularRecipes(limit: Int, offset: Int): [Recipe!]!
    recipe(id: ID!): Recipe
    myRecipes: [Recipe!]!
    recipeVotes(recipeId: ID!): RecipeVotes!
    savedRecipes: [Recipe!]!
    me: User
  }

  type SaveRecipeResult {
    success: Boolean!
    requiresAuth: Boolean!
    recipe: Recipe
    message: String
  }

  type AuthResult {
    success: Boolean!
    message: String
  }

  type Mutation {
    generateRecipe(ingredients: [ID!]!): Recipe!
    voteRecipe(recipeId: ID!, vote: VoteType): Recipe!
    createRecipe(recipe: RecipeInput!, ingredients: [RecipeIngredientInput!]!): Recipe!
    saveRecipe(recipeId: ID!): SaveRecipeResult!
    deleteRecipe(id: ID!): AuthResult!
    updateRecipe(id: ID!, recipe: RecipeInput!): Recipe!
    forgotPassword(email: String!): AuthResult!
    resetPassword(token: String!, password: String!): AuthResult!
    updateProfile(name: String, image_url: String): User!
    changePassword(currentPassword: String!, newPassword: String!): AuthResult!
  }
`;

const resolvers = {
  Query: {
    ingredients: async (
      _: unknown,
      { search, category }: { search?: string; category?: string }
    ) => {
      if (search && category) {
        const ingredients = await searchIngredients(search);
        return ingredients.filter((i) => i.category === category);
      } else if (search) {
        return await searchIngredients(search);
      } else if (category) {
        return await getIngredientsByCategory(category);
      } else {
        return await getAllIngredients();
      }
    },
    ingredient: async (_: unknown, { id }: { id: string }) => {
      return await getIngredientById(id);
    },
    popularRecipes: async (
      _: unknown,
      { limit = 12, offset = 0 }: { limit?: number; offset?: number }
    ) => {
      const recipes = await getAllRecipes();

      const sortedRecipes = recipes.sort((a, b) => {
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });

      return sortedRecipes.slice(offset, offset + limit);
    },
    recipe: async (_: unknown, { id }: { id: string }) => {
      return await getRecipeById(id);
    },
    myRecipes: async () => {
      const user = await getUserFromSession();

      if (!user) {
        return [];
      }

      return await getRecipesByUserId(user.id);
    },
    recipeVotes: async (_: unknown, { recipeId }: { recipeId: string }) => {
      try {
        const votes: RecipeVote[] = await prisma.recipeVote.findMany({
          where: {
            recipeId: recipeId,
          },
        });

        const likeCount = votes.filter((v) => v.voteType === "like").length;
        const dislikeCount = votes.filter(
          (v) => v.voteType === "dislike"
        ).length;

        const user = await getUserFromSession();

        let currentUserVote = null;
        if (user && user.id) {
          const userVoteRecord = votes.find((v) => v.userId === user.id);
          currentUserVote = userVoteRecord?.voteType || null;

          console.log(
            `User ${user.id} vote for recipe ${recipeId}: ${currentUserVote}`
          );
        }

        return {
          likes: likeCount,
          dislikes: dislikeCount,
          userVote: currentUserVote,
        };
      } catch (error) {
        console.error("Error fetching recipe votes:", error);
        return { likes: 0, dislikes: 0, userVote: null };
      }
    },
    savedRecipes: async () => {
      const user = await getUserFromSession();

      if (!user) {
        return [];
      }

      try {
        const savedRecipes = await prisma.$queryRaw`
          SELECT r.*, true as "isSaved"
          FROM recipes r
          JOIN user_saved_recipes usr ON r.id = usr.recipe_id
          WHERE usr.user_id = ${user.id}
        `;

        return savedRecipes || [];
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
        return [];
      }
    },
    me: async () => {
      const user = await getUserFromSession();
      if (!user) {
        return null;
      }
      return user;
    },
  },
  Recipe: {
    ingredients: async (parent: {
      id: string;
      ingredients?: Array<{
        ingredientId: string;
        ingredient: {
          id: string;
          name: string;
          image_url: string | null;
          category?: string | null;
          unit_of_measure?: string | null;
        };
        quantity: string;
        unit?: string;
        notes?: string;
      }>;
    }) => {
      if (parent.ingredients && Array.isArray(parent.ingredients)) {
        return parent.ingredients;
      }

      const recipeIngredients = await getIngredientsForRecipe(parent.id);

      return recipeIngredients.map((ingredient) => {
        return {
          ingredientId: ingredient.id,
          ingredient: {
            id: ingredient.id,
            name: ingredient.name,
            image_url: ingredient.image_url,
            category: ingredient.category,
            unit_of_measure:
              ingredient.unit_of_measure || ingredient.unit || "",
          },
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          notes: ingredient.notes,
        };
      });
    },
    createdAt: (parent: { created_at?: Date }) => {
      return parent.created_at
        ? new Date(parent.created_at).toISOString()
        : new Date().toISOString();
    },
    votes: (parent: { rating?: number }) => {
      return parent.rating ? Math.floor(parent.rating * 10) : 0;
    },

    cookingMethod: (parent: { instructions?: string }) => {
      return parent.instructions || "";
    },

    preparationTime: (parent: { prep_time_minutes?: number }) => {
      return parent.prep_time_minutes || 0;
    },

    likes: async (parent: { id: string }) => {
      try {
        const count = await prisma.recipeVote.count({
          where: {
            recipeId: parent.id,
            voteType: "like",
          },
        });
        return count;
      } catch (error) {
        console.error("Error counting likes:", error);
        return 0;
      }
    },

    dislikes: async (parent: { id: string }) => {
      try {
        const count = await prisma.recipeVote.count({
          where: {
            recipeId: parent.id,
            voteType: "dislike",
          },
        });
        return count;
      } catch (error) {
        console.error("Error counting dislikes:", error);
        return 0;
      }
    },

    userVote: async (parent: { id: string }) => {
      try {
        const user = await getUserFromSession();

        if (!user || !user.id) {
          return null;
        }

        const userId = user.id;
        console.log(
          `Checking vote for userId: ${userId}, recipeId: ${parent.id}`
        );

        const userVote = await prisma.recipeVote.findUnique({
          where: {
            userId_recipeId: {
              userId: userId,
              recipeId: parent.id,
            },
          },
        });

        console.log(`Found user vote:`, userVote);
        return userVote?.voteType || null;
      } catch (error) {
        console.error("Error fetching user vote:", error);
        return null;
      }
    },

    isSaved: async (parent: { id: string; isSaved?: boolean }) => {
      if (parent.isSaved !== undefined) {
        return parent.isSaved;
      }

      try {
        const user = await getUserFromSession();

        if (!user || !user.id) {
          return false;
        }

        const userId = user.id;
        const recipeId = parent.id;

        const savedRecipe = await prisma.$queryRaw`
          SELECT * FROM user_saved_recipes 
          WHERE user_id = ${userId} AND recipe_id = ${recipeId}
          LIMIT 1
        `;

        return Array.isArray(savedRecipe) && savedRecipe.length > 0;
      } catch (error) {
        console.error("Error checking if recipe is saved:", error);
        return false;
      }
    },
  },
  Mutation: {
    generateRecipe: async (
      _: unknown,
      { ingredients }: { ingredients: string[] }
    ) => {
      try {
        console.log("Generating recipe with ingredients:", ingredients);

        const user = await getUserFromSession();
        const userId = user?.id;

        const fetchedIngredients = await Promise.all(
          ingredients.map((id) => getIngredientById(id))
        );

        console.log("Fetched ingredients:", fetchedIngredients);

        const validIngredients = fetchedIngredients.filter(
          (ing) => ing !== null
        ) as NonNullable<Ingredient>[];

        console.log("Valid ingredients:", validIngredients);

        if (validIngredients.length === 0) {
          throw new Error("No valid ingredients provided");
        }

        const uniqueIngredients = validIngredients.filter(
          (ing, index, self) => index === self.findIndex((i) => i.id === ing.id)
        );

        if (uniqueIngredients.length !== validIngredients.length) {
          console.log(
            "Removed duplicate ingredients. Using unique ingredients:",
            uniqueIngredients
          );
        }

        const ingredientNames = uniqueIngredients.map((i) => i.name);
        try {
          const generatedRecipe = await generateRecipeFromIngredients(
            uniqueIngredients.map((ing) => ({
              id: ing.id,
              name: ing.name,
              unit_of_measure: ing.unit_of_measure,
            }))
          );

          const recipeInput: RecipeInput = {
            title: generatedRecipe.title,
            description: generatedRecipe.description,
            difficulty: generatedRecipe.difficulty.toLowerCase() as
              | "easy"
              | "medium"
              | "hard",
            prep_time_minutes: generatedRecipe.preparationTime,
            instructions: generatedRecipe.cookingMethod,
            image_url: null,
            cook_time_minutes: Math.round(
              generatedRecipe.preparationTime * 0.6
            ),
            servings: 4,
            tags: ingredientNames.slice(0, 3),
            rating: null,
            featured: false,
            user_id: userId ?? null,
          };

          const ingredientsInput = uniqueIngredients.map((ingredient) => {
            const generatedIngredient = generatedRecipe.ingredients.find((gi) =>
              gi.name.toLowerCase().includes(ingredient.name.toLowerCase())
            );

            let quantity = 1;
            let unit = ingredient.unit_of_measure || "unit";

            if (generatedIngredient?.quantity) {
              const qtyMatch =
                generatedIngredient.quantity.match(/(\d+\.?\d*)/);
              if (qtyMatch && qtyMatch[1]) {
                quantity = parseFloat(qtyMatch[1]);
              }

              const unitMatch = generatedIngredient.quantity.match(
                /(\d+\.?\d*)\s+([a-zA-Z]+)/
              );
              if (unitMatch && unitMatch[2]) {
                unit = unitMatch[2].toLowerCase();
              }
            }

            return {
              ingredient_id: ingredient.id,
              ingredient_obj: ingredient,
              quantity,
              unit,
              notes: generatedIngredient?.quantity || "to taste",
            };
          });

          let createdRecipe;
          if (userId) {
            createdRecipe = await createCompleteRecipe(
              recipeInput,
              ingredientsInput
            );
          } else {
            createdRecipe = {
              id: crypto.randomUUID(),
              ...recipeInput,
              created_at: new Date(),
              ingredients: generatedRecipe.ingredients
                .map((generatedIngredient, index) => {
                  const matchingIngredient =
                    uniqueIngredients.find((ing) =>
                      generatedIngredient.name
                        .toLowerCase()
                        .includes(ing.name.toLowerCase())
                    ) || uniqueIngredients[index];

                  if (!matchingIngredient) return null;

                  let quantity = "1";
                  let unit = matchingIngredient.unit_of_measure || "unit";

                  if (generatedIngredient.quantity) {
                    const qtyMatch =
                      generatedIngredient.quantity.match(/(\d+\.?\d*)/);
                    if (qtyMatch && qtyMatch[1]) {
                      quantity = qtyMatch[1];
                    }

                    const unitMatch = generatedIngredient.quantity.match(
                      /(\d+\.?\d*)\s+([a-zA-Z]+)/
                    );
                    if (unitMatch && unitMatch[2]) {
                      unit = unitMatch[2].toLowerCase();
                    }
                  }

                  return {
                    ingredientId: matchingIngredient.id,
                    ingredient: {
                      id: matchingIngredient.id,
                      name: matchingIngredient.name,
                      image_url: matchingIngredient.image_url,
                      category: matchingIngredient.category,
                      unit_of_measure: unit,
                    },
                    quantity: quantity,
                    unit: unit,
                    notes: generatedIngredient.quantity || "to taste",
                  };
                })
                .filter(Boolean),
            };
          }

          return createdRecipe;
        } catch (error) {
          console.error(
            "Error with Hugging Face API, falling back to basic generation:",
            error
          );

          let cookingMethodText = `Start by preparing all your ingredients. `;

          const proteins = validIngredients.filter(
            (i) => i.category === "Protein" || i.category === "Meat"
          );
          const vegetables = validIngredients.filter(
            (i) => i.category === "Vegetable" || i.category === "Vegetables"
          );
          const grains = validIngredients.filter(
            (i) => i.category === "Grain" || i.category === "Grains"
          );

          if (proteins.length > 0) {
            cookingMethodText += `Cook the ${proteins
              .map((p) => p.name)
              .join(" and ")} until properly done. `;
          }

          if (vegetables.length > 0) {
            cookingMethodText += `Sauté the ${vegetables
              .map((v) => v.name)
              .join(", ")} until tender. `;
          }

          if (grains.length > 0) {
            cookingMethodText += `Prepare the ${grains
              .map((g) => g.name)
              .join(" and ")} according to package instructions. `;
          }

          cookingMethodText += `Combine all ingredients and season to taste. Serve hot.`;

          const recipeData: RecipeInput = {
            title: `${validIngredients[0].name} Recipe`,
            description: `A delicious recipe featuring ${ingredientNames.join(
              ", "
            )}`,
            image_url: null,
            prep_time_minutes: 30,
            cook_time_minutes: 20,
            servings: 2,
            difficulty: "easy",
            instructions: cookingMethodText,
            tags: validIngredients
              .map((i) => i.category || "Other")
              .filter(Boolean),
            rating: 0,
            featured: false,
            user_id: userId ?? null,
          };

          const ingredientData = validIngredients.map((ing) => ({
            ingredient_id: ing.id,
            quantity: 1,
            unit: ing.unit_of_measure || "unit",
            notes: undefined,
          }));

          const savedRecipe = await createCompleteRecipe(
            recipeData,
            ingredientData
          );
          console.log("Saved recipe to database:", savedRecipe);

          const formattedRecipe = {
            id: savedRecipe.id,
            title: savedRecipe.title,
            description: savedRecipe.description,
            difficulty: savedRecipe.difficulty,
            ingredients: validIngredients.map((ing: Ingredient) => ({
              ingredientId: ing.id,
              ingredient: {
                id: ing.id,
                name: ing.name,
                image_url: ing.image_url,
                category: ing.category,
              },
              quantity: "1",
              unit: ing.unit_of_measure || "unit",
            })),
            cookingMethod: savedRecipe.instructions,
            preparationTime: savedRecipe.prep_time_minutes,
            prep_time_minutes: savedRecipe.prep_time_minutes,
            cook_time_minutes: savedRecipe.cook_time_minutes,
            servings: savedRecipe.servings,
            createdAt:
              savedRecipe.created_at instanceof Date
                ? savedRecipe.created_at.toISOString()
                : new Date().toISOString(),
            votes: savedRecipe.rating ? Math.floor(savedRecipe.rating * 10) : 0,
            tags: savedRecipe.tags,
          };

          console.log("Returning formatted recipe:", formattedRecipe);
          return formattedRecipe;
        }
      } catch (error) {
        console.error("Error generating recipe:", error);
        throw error;
      }
    },
    voteRecipe: async (
      _: unknown,
      { recipeId, vote }: { recipeId: string; vote: "LIKE" | "DISLIKE" | null }
    ) => {
      try {
        const user = await getUserFromSession();

        if (!user) {
          throw new Error("Authentication required to vote on recipes");
        }

        if (!user.id) {
          throw new Error("User ID is missing");
        }

        const userId = user.id;
        console.log(
          `Vote request from userId: ${userId} for recipeId: ${recipeId}, vote: ${vote}`
        );

        const existingVote = await prisma.recipeVote.findUnique({
          where: {
            userId_recipeId: {
              userId: userId,
              recipeId: recipeId,
            },
          },
        });

        console.log("Existing vote:", existingVote);

        if (vote === null) {
          if (existingVote) {
            await prisma.recipeVote.delete({
              where: {
                id: existingVote.id,
              },
            });
            console.log(`Deleted vote: ${existingVote.id}`);
          }

          const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
          });

          return {
            id: recipeId,
            votes: recipe?.votes || 0,
            userVote: null,
          };
        }

        const voteType = vote.toLowerCase();

        if (existingVote) {
          console.log(
            `Updating vote from ${existingVote.voteType} to ${voteType}`
          );
          await prisma.recipeVote.update({
            where: {
              id: existingVote.id,
            },
            data: {
              voteType: voteType,
            },
          });
        } else {
          console.log(`Creating new vote: ${voteType}`);
          await prisma.recipeVote.create({
            data: {
              id: crypto.randomUUID(),
              userId: userId,
              recipeId: recipeId,
              voteType: voteType,
            },
          });
        }

        const likeCount = await prisma.recipeVote.count({
          where: {
            recipeId: recipeId,
            voteType: "like",
          },
        });

        const dislikeCount = await prisma.recipeVote.count({
          where: {
            recipeId: recipeId,
            voteType: "dislike",
          },
        });

        console.log(
          `New counts - likes: ${likeCount}, dislikes: ${dislikeCount}`
        );
        const totalVotes = likeCount - dislikeCount;

        const recipe = await prisma.recipe.findUnique({
          where: { id: recipeId },
        });

        if (!recipe) {
          throw new Error(`Recipe with ID ${recipeId} not found`);
        }

        await prisma.recipe.update({
          where: { id: recipeId },
          data: {
            votes: totalVotes,
          },
        });

        console.log(`Updated recipe votes to: ${totalVotes}`);
        return {
          id: recipeId,
          votes: totalVotes,
          userVote: voteType,
          likes: likeCount,
          dislikes: dislikeCount,
        };
      } catch (error) {
        console.error("Error voting for recipe:", error);
        throw error;
      }
    },
    createRecipe: async (
      _: unknown,
      {
        recipe,
        ingredients,
      }: { recipe: RecipeInput; ingredients: RecipeIngredient[] }
    ) => {
      try {
        const user = await getUserFromSession();

        if (!user) {
          throw new Error("Authentication required to save recipes");
        }

        const recipeWithUserId = {
          ...recipe,
          user_id: user.id,
        };

        const savedRecipe = await createCompleteRecipe(
          recipeWithUserId,
          ingredients.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes,
          }))
        );

        return {
          id: savedRecipe.id,
          title: savedRecipe.title,
          description: savedRecipe.description,
          difficulty: savedRecipe.difficulty,
          createdAt:
            savedRecipe.created_at instanceof Date
              ? savedRecipe.created_at.toISOString()
              : new Date().toISOString(),
          votes: 0,
        };
      } catch (error) {
        console.error("Error creating recipe:", error);
        throw error;
      }
    },
    saveRecipe: async (_: unknown, { recipeId }: { recipeId: string }) => {
      try {
        const user = await getUserFromSession();

        if (!user) {
          return {
            success: false,
            requiresAuth: true,
            message: "Authentication required to save recipes",
          };
        }

        const recipe = await prisma.recipe.findUnique({
          where: { id: recipeId },
        });

        if (!recipe) {
          return {
            success: false,
            requiresAuth: false,
            message: `Recipe with ID ${recipeId} not found`,
          };
        }

        const existingSavedRecipe = await prisma.$queryRaw`
          SELECT * FROM user_saved_recipes 
          WHERE user_id = ${user.id} AND recipe_id = ${recipeId}
          LIMIT 1
        `;

        if (
          existingSavedRecipe &&
          Array.isArray(existingSavedRecipe) &&
          existingSavedRecipe.length > 0
        ) {
          await prisma.$executeRaw`
            DELETE FROM user_saved_recipes 
            WHERE user_id = ${user.id} AND recipe_id = ${recipeId}
          `;

          return {
            success: true,
            requiresAuth: false,
            recipe,
            message: "Recipe removed from saved recipes",
          };
        } else {
          await prisma.$executeRaw`
            INSERT INTO user_saved_recipes (id, user_id, recipe_id, created_at)
            VALUES (${crypto.randomUUID()}, ${user.id}, ${recipeId}, NOW())
          `;

          return {
            success: true,
            requiresAuth: false,
            recipe,
            message: "Recipe saved successfully",
          };
        }
      } catch (error) {
        console.error("Error saving recipe:", error);
        return {
          success: false,
          requiresAuth: false,
          message: `Error saving recipe: ${
            error instanceof Error ? error.message : String(error)
          }`,
        };
      }
    },
    deleteRecipe: async (_: unknown, { id }: { id: string }) => {
      try {
        const recipe = await prisma.recipe.findUnique({
          where: { id },
        });

        if (!recipe) {
          return {
            success: false,
            message: `Recipe with ID ${id} not found`,
          };
        }

        await prisma.recipe.delete({
          where: { id },
        });

        return {
          success: true,
          message: "Recipe deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting recipe:", error);
        return {
          success: false,
          message: `Error deleting recipe: ${
            error instanceof Error ? error.message : String(error)
          }`,
        };
      }
    },
    updateRecipe: async (
      _: unknown,
      { id, recipe }: { id: string; recipe: RecipeInput }
    ) => {
      try {
        const updatedRecipe = await prisma.recipe.update({
          where: { id },
          data: recipe,
        });

        return updatedRecipe;
      } catch (error) {
        console.error("Error updating recipe:", error);
        throw error;
      }
    },
    forgotPassword: async (_: unknown, { email }: { email: string }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return {
            success: false,
            message: "No account found with that email address",
          };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await prisma.$executeRaw`
          INSERT INTO password_reset_tokens (id, token, user_id, expires_at, created_at, is_used)
          VALUES (${crypto.randomUUID()}, ${token}, ${
            user.id
          }, ${expiresAt}, NOW(), false)
        `;

        const emailResult = await sendPasswordResetEmail(email, token);

        if (!emailResult.success) {
          console.error(
            "Failed to send password reset email:",
            emailResult.error
          );
          return {
            success: false,
            message: "Failed to send reset email. Please try again later.",
          };
        }

        return {
          success: true,
          message: "Password reset link has been sent to your email",
        };
      } catch (error) {
        console.error("Error in forgotPassword:", error);
        return {
          success: false,
          message: "An error occurred. Please try again later.",
        };
      }
    },
    resetPassword: async (
      _: unknown,
      { token, password }: { token: string; password: string }
    ) => {
      try {
        const resetTokens = await prisma.$queryRaw`
          SELECT rt.*, u.id as user_id, u.email
          FROM password_reset_tokens rt
          JOIN users u ON rt.user_id = u.id
          WHERE rt.token = ${token}
          LIMIT 1
        `;

        if (
          !resetTokens ||
          !Array.isArray(resetTokens) ||
          resetTokens.length === 0
        ) {
          return {
            success: false,
            message: "Invalid or expired token",
          };
        }

        const resetToken = resetTokens[0];

        if (
          new Date(resetToken.expires_at) < new Date() ||
          resetToken.is_used
        ) {
          return {
            success: false,
            message: "Token has expired or already been used",
          };
        }

        const hashedPassword = await hashPassword(password);

        await prisma.user.update({
          where: { id: resetToken.user_id },
          data: { password: hashedPassword },
        });

        await prisma.$executeRaw`
          UPDATE password_reset_tokens
          SET is_used = true
          WHERE id = ${resetToken.id}
        `;

        return {
          success: true,
          message: "Password has been reset successfully",
        };
      } catch (error) {
        console.error("Error in resetPassword:", error);
        return {
          success: false,
          message: "An error occurred. Please try again later.",
        };
      }
    },
    updateProfile: async (
      _: unknown,
      { name, image_url }: { name: string; image_url: string }
    ) => {
      try {
        const user = await getUserFromSession();

        if (!user) {
          throw new Error("Authentication required to update profile");
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            name,
            image_url,
          },
        });

        return updatedUser;
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    },
    changePassword: async (
      _: unknown,
      {
        currentPassword,
        newPassword,
      }: { currentPassword: string; newPassword: string }
    ) => {
      try {
        const user = await getUserFromSession();

        if (!user) {
          throw new Error("Authentication required to change password");
        }

        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (!existingUser) {
          throw new Error("User not found");
        }

        if (!existingUser.password) {
          return {
            success: false,
            message: "Cannot change password for accounts without a password",
          };
        }

        const isPasswordValid = await verifyPassword(
          currentPassword,
          existingUser.password
        );

        if (!isPasswordValid) {
          return {
            success: false,
            message: "Current password is incorrect",
          };
        }

        const hashedNewPassword = await hashPassword(newPassword);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedNewPassword,
          },
        });

        return {
          success: true,
          message: "Password has been changed successfully",
        };
      } catch (error) {
        console.error("Error changing password:", error);
        return {
          success: false,
          message: "An error occurred. Please try again later.",
        };
      }
    },
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
});

export const GET = async (request: NextRequest) => {
  await getServerSession(authOptions);
  return yoga.handleRequest(request, {});
};

export const POST = async (request: NextRequest) => {
  await getServerSession(authOptions);
  return yoga.handleRequest(request, {});
};
