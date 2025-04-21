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
} from "@/lib/models/Recipe";
import { generateRecipeFromIngredients } from "@/lib/huggingface";

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
    UP
    DOWN
    up
    down
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
  }

  type Query {
    ingredients(search: String, category: String): [Ingredient!]!
    ingredient(id: ID!): Ingredient
    popularRecipes(limit: Int): [Recipe!]!
    recipe(id: ID!): Recipe
    myRecipes: [Recipe!]!
  }

  type Mutation {
    generateRecipe(ingredients: [ID!]!): Recipe!
    voteRecipe(recipeId: ID!, vote: VoteType!): Recipe!
    createRecipe(recipe: RecipeInput!, ingredients: [RecipeIngredientInput!]!): Recipe!
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
    popularRecipes: async (_: unknown, { limit = 6 }: { limit?: number }) => {
      const recipes = await getAllRecipes();

      const sortedRecipes = recipes.sort((a, b) => {
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });

      return sortedRecipes.slice(0, limit);
    },
    recipe: async (_: unknown, { id }: { id: string }) => {
      return await getRecipeById(id);
    },
    myRecipes: async () => {
      return await getAllRecipes();
    },
  },
  Recipe: {
    ingredients: async (parent: { id: string }) => {
      const recipeIngredients = await getIngredientsForRecipe(parent.id);

      return recipeIngredients.map((ingredient) => ({
        ingredientId: ingredient.id,
        ingredient: {
          id: ingredient.id,
          name: ingredient.name,
          image_url: `/ingredients/${ingredient.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.jpg`,
          category: ingredient.category,
        },
        quantity: ingredient.quantity.toString(),
        unit: ingredient.unit,
      }));
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
  },
  Mutation: {
    generateRecipe: async (
      _: unknown,
      { ingredients }: { ingredients: string[] }
    ) => {
      try {
        console.log("Generating recipe with ingredients:", ingredients);

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
            ingredientNames
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
          };

          const ingredientsInput = uniqueIngredients.map((ingredient) => {
            const generatedIngredient = generatedRecipe.ingredients.find((gi) =>
              gi.name.toLowerCase().includes(ingredient.name.toLowerCase())
            );

            let quantity = 1;
            let unit = "unit";

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
              quantity,
              unit,
              notes: generatedIngredient?.quantity || "to taste",
            };
          });

          const createdRecipe = await createCompleteRecipe(
            recipeInput,
            ingredientsInput
          );

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
          };

          const ingredientData = validIngredients.map((ing) => ({
            ingredient_id: ing.id,
            quantity: 1,
            unit: ing.unit_of_measure || "unit",
            notes: undefined, // Using undefined instead of null for compatibility
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
            ingredients: validIngredients.map((ing) => ({
              ingredientId: ing.id,
              ingredient: {
                id: ing.id,
                name: ing.name,
                image_url: `/ingredients/${ing.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}.jpg`,
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
      { recipeId, vote }: { recipeId: string; vote: "UP" | "DOWN" }
    ) => {
      return {
        id: recipeId,
        votes: vote === "UP" ? 1 : -1,
      };
    },
    createRecipe: async (
      _: unknown,
      { recipe }: { recipe: RecipeInput; ingredients: unknown[] }
    ) => {
      return {
        id: "new-recipe",
        ...recipe,
        createdAt: new Date().toISOString(),
        votes: 0,
      };
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
  return yoga.handleRequest(request, {});
};

export const POST = async (request: NextRequest) => {
  return yoga.handleRequest(request, {});
};
