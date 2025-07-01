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

async function getVotesForRecipeIds(recipeIds: string[]) {
  if (!recipeIds.length) return { likesMap: new Map(), dislikesMap: new Map() };

  const voteCounts = await prisma.recipeVote.groupBy({
    by: ["recipeId", "voteType"],
    where: {
      recipeId: { in: recipeIds },
    },
    _count: {
      voteType: true,
    },
  });

  const likesMap = new Map<string, number>();
  const dislikesMap = new Map<string, number>();

  for (const group of voteCounts) {
    if (group.voteType === "like") {
      likesMap.set(group.recipeId, group._count.voteType);
    } else if (group.voteType === "dislike") {
      dislikesMap.set(group.recipeId, group._count.voteType);
    }
  }
  return { likesMap, dislikesMap };
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

// function calculateRating(likes: number, dislikes: number): number {
//   const totalVotes = likes + dislikes;
//   if (totalVotes === 0) {
//     return 0;
//   }
//   const rating = (likes / totalVotes) * 10;
//   return Math.round(rating * 10) / 10;
// }

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
    UNVOTE
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
    popularRecipes(
      limit: Int
      offset: Int
      difficulty: [String]
      maxPrepTime: Int
      minRating: Float
      ingredients: [ID!]
    ): [Recipe!]!
    recipe(id: ID!): Recipe
    myRecipes(limit: Int, offset: Int): [Recipe!]!
    recipeVotes(recipeId: ID!): RecipeVotes!
    savedRecipes: [Recipe!]!
    me: User
    user(id: ID!): User
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
    voteRecipe(recipeId: ID!, vote: VoteType!): Recipe!
    createRecipe(recipe: RecipeInput!, ingredients: [RecipeIngredientInput!]!): Recipe!
    saveRecipe(recipeId: ID!): SaveRecipeResult!
    deleteRecipe(id: ID!): AuthResult!
    updateRecipe(id: ID!, recipe: RecipeInput!): Recipe!
    updateRecipeIngredients(recipeId: ID!, ingredients: [RecipeIngredientInput!]!): Recipe!
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
      {
        search,
        category,
        ids,
      }: { search?: string; category?: string; ids?: string[] }
    ) => {
      if (ids && ids.length > 0) {
        return await prisma.ingredient.findMany({ where: { id: { in: ids } } });
      }
      if (search && category) {
        const ingredients = await searchIngredients(search);
        return ingredients.filter((i: Ingredient) => i.category === category);
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
      {
        limit = 12,
        offset = 0,
        difficulty,
        maxPrepTime,
        minRating,
        ingredients,
      }: {
        limit?: number;
        offset?: number;
        difficulty?: string[];
        maxPrepTime?: number;
        minRating?: number;
        ingredients?: string[];
      }
    ) => {
      const user = await getUserFromSession();
      const userId = user?.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: { AND?: any[] } = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conditions: any[] = [];

      if (difficulty && difficulty.length > 0) {
        conditions.push({
          OR: difficulty.map((d) => ({
            difficulty: {
              equals: d,
              mode: "insensitive",
            },
          })),
        });
      }

      if (maxPrepTime) {
        conditions.push({ prep_time_minutes: { lte: maxPrepTime } });
      }

      if (minRating) {
        conditions.push({ rating: { gte: minRating } });
      }

      if (ingredients && ingredients.length > 0) {
        // For each ingredient ID, add a condition that requires it to be present in the recipe
        ingredients.forEach((ingredientId) => {
          conditions.push({
            ingredients: {
              some: {
                ingredientId: ingredientId,
              },
            },
          });
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const recipesData = await prisma.recipe.findMany({
        where,
        orderBy: [{ rating: "desc" }, { votes: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          description: true,
          image_url: true,
          prep_time_minutes: true,
          cook_time_minutes: true,
          servings: true,
          difficulty: true,
          instructions: true,
          tags: true,
          rating: true,
          votes: true,
          createdAt: true,
          userId: true,
        },
      });

      if (!recipesData.length) {
        return [];
      }

      const recipeIds = recipesData.map((r: { id: string }) => r.id);

      const { likesMap, dislikesMap } = await getVotesForRecipeIds(recipeIds);

      const userVotesForRecipesMap = new Map<string, string | null>();
      const userSavesMap = new Map<string, boolean>();

      if (userId) {
        const userVotes = await prisma.recipeVote.findMany({
          where: { userId, recipeId: { in: recipeIds } },
          select: { recipeId: true, voteType: true },
        });
        userVotes.forEach((v: { recipeId: string; voteType: string }) =>
          userVotesForRecipesMap.set(v.recipeId, v.voteType)
        );

        const userSaves = await prisma.userSavedRecipe.findMany({
          where: { userId, recipeId: { in: recipeIds } },
          select: { recipeId: true },
        });
        userSaves.forEach((s: { recipeId: string }) =>
          userSavesMap.set(s.recipeId, true)
        );
      }

      const result = recipesData.map(
        (recipe: { id: string; createdAt: Date }) => {
          const likes = likesMap.get(recipe.id) || 0;
          const dislikes = dislikesMap.get(recipe.id) || 0;

          return {
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
            __likesCount: likes,
            __dislikesCount: dislikes,
            userVote: userVotesForRecipesMap.get(recipe.id) || null,
            isSaved: userSavesMap.get(recipe.id) || false,
          };
        }
      );

      return result;
    },
    recipe: async (_: unknown, { id }: { id: string }) => {
      return await getRecipeById(id);
    },
    myRecipes: async (
      _: unknown,
      { limit, offset }: { limit?: number; offset?: number }
    ) => {
      const user = await getUserFromSession();

      if (!user) {
        return [];
      }

      return await getRecipesByUserId(user.id, limit, offset);
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
    user: async (_: unknown, { id }: { id: string }) => {
      return await prisma.user.findUnique({ where: { id } });
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
    votes: (parent: {
      id: string;
      votes?: number;
      __likesCount?: number;
      __dislikesCount?: number;
    }) => {
      if (parent.votes !== undefined) return parent.votes;

      if (
        parent.__likesCount !== undefined &&
        parent.__dislikesCount !== undefined
      ) {
        return parent.__likesCount - parent.__dislikesCount;
      }

      return 0;
    },
    rating: (parent: { rating?: number }) => parent.rating ?? 0,

    cookingMethod: (parent: { instructions?: string }) => {
      return parent.instructions || "";
    },

    preparationTime: (parent: { prep_time_minutes?: number }) => {
      return parent.prep_time_minutes || 0;
    },

    likes: async (parent: { id: string; __likesCount?: number }) => {
      if (parent.__likesCount !== undefined) return parent.__likesCount;

      return prisma.recipeVote.count({
        where: { recipeId: parent.id, voteType: "like" },
      });
    },

    dislikes: async (parent: { id: string; __dislikesCount?: number }) => {
      if (parent.__dislikesCount !== undefined) return parent.__dislikesCount;
      return prisma.recipeVote.count({
        where: { recipeId: parent.id, voteType: "dislike" },
      });
    },

    userVote: async (parent: { id: string; userVote?: string | null }) => {
      if (parent.userVote !== undefined) return parent.userVote;

      const user = await getUserFromSession();
      if (!user || !user.id) return null;
      const vote = await prisma.recipeVote.findUnique({
        where: { userId_recipeId: { userId: user.id, recipeId: parent.id } },
        select: { voteType: true },
      });
      return vote?.voteType || null;
    },

    isSaved: async (parent: { id: string; isSaved?: boolean }) => {
      if (parent.isSaved !== undefined) return parent.isSaved;
      const user = await getUserFromSession();
      if (!user || !user.id) return false;
      const saved = await prisma.userSavedRecipe.findUnique({
        where: { userId_recipeId: { userId: user.id, recipeId: parent.id } },
        select: { id: true },
      });
      return !!saved;
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
            rating: 3.0,
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
      {
        recipeId,
        vote,
      }: { recipeId: string; vote: "LIKE" | "DISLIKE" | "UNVOTE" }
    ) => {
      try {
        const user = await getUserFromSession();
        if (!user || !user.id) {
          throw new Error("Authentication required");
        }
        const userId = user.id;

        const existingVote = await prisma.recipeVote.findUnique({
          where: { userId_recipeId: { userId, recipeId } },
        });

        if (vote === "UNVOTE") {
          if (existingVote) {
            await prisma.recipeVote.delete({ where: { id: existingVote.id } });
            console.log(`Deleted vote: ${existingVote.id} due to UNVOTE`);
          }
        } else {
          const voteType = vote.toLowerCase();

          if (existingVote) {
            if (existingVote.voteType === voteType) {
              await prisma.recipeVote.delete({
                where: { id: existingVote.id },
              });
              console.log(
                `Deleted vote: ${existingVote.id} due to same type click`
              );
            } else {
              console.log(
                `Updating vote from ${existingVote.voteType} to ${voteType}`
              );
              await prisma.recipeVote.update({
                where: { id: existingVote.id },
                data: { voteType },
              });
            }
          } else {
            console.log(`Creating new vote: ${voteType}`);
            await prisma.recipeVote.create({
              data: {
                userId,
                recipeId,
                voteType,
              },
            });
          }
        }

        const likeCount = await prisma.recipeVote.count({
          where: { recipeId, voteType: "like" },
        });
        const dislikeCount = await prisma.recipeVote.count({
          where: { recipeId, voteType: "dislike" },
        });

        const totalRecipeVotes = likeCount + dislikeCount;

        const globalAverageRatingPrior = 5;
        const confidenceWeight = 10;

        let newRating: number | null = null;
        if (totalRecipeVotes > 0) {
          newRating = Math.round(
            (likeCount * 10 + globalAverageRatingPrior * confidenceWeight) /
              (totalRecipeVotes + confidenceWeight)
          );
          newRating = Math.min(Math.max(newRating, 0), 10);
        } else {
          newRating = 0;
        }

        const updatedRecipe = await prisma.recipe.update({
          where: { id: recipeId },
          data: {
            votes: likeCount - dislikeCount,
            rating: newRating,
          },
          select: {
            id: true,
            title: true,
            description: true,
            image_url: true,
            prep_time_minutes: true,
            cook_time_minutes: true,
            servings: true,
            difficulty: true,
            instructions: true,
            tags: true,
            rating: true,
            featured: true,
            createdAt: true,
            votes: true,
            userId: true,
          },
        });

        let finalUserVoteType: string | null = null;
        const latestVoteRecord = await prisma.recipeVote.findUnique({
          where: { userId_recipeId: { userId, recipeId } },
          select: { voteType: true },
        });
        finalUserVoteType = latestVoteRecord?.voteType || null;

        return {
          ...updatedRecipe,
          likes: likeCount,
          dislikes: dislikeCount,
          userVote: finalUserVoteType,
          createdAt: updatedRecipe.createdAt.toISOString(),
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
    updateRecipeIngredients: async (
      _: unknown,
      {
        recipeId,
        ingredients,
      }: { recipeId: string; ingredients: RecipeIngredient[] }
    ) => {
      try {
        const user = await getUserFromSession();
        if (!user) {
          throw new Error("Authentication required to update recipes");
        }

        const recipe = await prisma.recipe.findUnique({
          where: { id: recipeId },
          include: {
            ingredients: true,
          },
        });

        if (!recipe) {
          throw new Error(`Recipe with ID ${recipeId} not found`);
        }

        if (recipe.userId !== user.id) {
          throw new Error("You don't have permission to update this recipe");
        }

        await prisma.recipeIngredient.deleteMany({
          where: { recipeId },
        });

        const recipeIngredientsData = ingredients.map((ing) => ({
          id: crypto.randomUUID(),
          recipeId,
          ingredientId: ing.ingredient_id,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
        }));

        await prisma.recipeIngredient.createMany({
          data: recipeIngredientsData,
        });

        const updatedRecipe = await prisma.recipe.findUnique({
          where: { id: recipeId },
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        });

        return updatedRecipe;
      } catch (error) {
        console.error("Error updating recipe ingredients:", error);
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
