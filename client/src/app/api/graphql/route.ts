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
    imageUrl: String
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

// Define resolvers
const resolvers = {
  Query: {
    ingredients: async (
      _: unknown,
      { search, category }: { search?: string; category?: string }
    ) => {
      if (search && category) {
        // Search by both name and category
        const ingredients = await searchIngredients(search);
        return ingredients.filter((i) => i.category === category);
      } else if (search) {
        // Search by name
        return await searchIngredients(search);
      } else if (category) {
        // Filter by category
        return await getIngredientsByCategory(category);
      } else {
        // Get all ingredients
        return await getAllIngredients();
      }
    },
    ingredient: async (_: unknown, { id }: { id: string }) => {
      return await getIngredientById(id);
    },
    popularRecipes: async (_: unknown, { limit = 6 }: { limit?: number }) => {
      // Fetch all recipes from the database, not just featured ones
      const recipes = await getAllRecipes();

      // Sort recipes by rating in descending order (null ratings at the end)
      const sortedRecipes = recipes.sort((a, b) => {
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });

      // Return limited number of recipes
      return sortedRecipes.slice(0, limit);
    },
    recipe: async (_: unknown, { id }: { id: string }) => {
      return await getRecipeById(id);
    },
    myRecipes: async () => {
      // Get all recipes for now - in a real app this would filter by user
      return await getAllRecipes();
    },
  },
  Recipe: {
    ingredients: async (parent: { id: string }) => {
      const recipeIngredients = await getIngredientsForRecipe(parent.id);

      // Format the ingredients to match the expected GraphQL structure
      return recipeIngredients.map((ingredient) => ({
        ingredientId: ingredient.id,
        ingredient: {
          id: ingredient.id,
          name: ingredient.name,
          imageUrl: `/ingredients/${ingredient.name
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
    // Map instructions to cookingMethod for backward compatibility
    cookingMethod: (parent: { instructions?: string }) => {
      return parent.instructions || "";
    },
    // Map prep_time_minutes to preparationTime for backward compatibility
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

        // Fetch all the ingredients by their IDs
        const fetchedIngredients = await Promise.all(
          ingredients.map((id) => getIngredientById(id))
        );

        console.log("Fetched ingredients:", fetchedIngredients);

        // Filter out any null values
        const validIngredients = fetchedIngredients.filter(
          (ing) => ing !== null
        ) as NonNullable<Ingredient>[];

        console.log("Valid ingredients:", validIngredients);

        if (validIngredients.length === 0) {
          throw new Error("No valid ingredients provided");
        }

        // Get names to use in the title and description
        const ingredientNames = validIngredients.map((i) => i.name);
        const mainIngredient = validIngredients[0];

        // Generate a placeholder cooking method based on ingredients
        let cookingMethodText = `Start by preparing all your ingredients. `;

        // Simple placeholder - in the future, this will be a neural network
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

        // Create recipe data to save to database
        const recipeData: RecipeInput = {
          title: `${mainIngredient.name} Recipe`,
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

        // Prepare ingredient data for database
        const ingredientData = validIngredients.map((ing) => ({
          ingredient_id: ing.id,
          quantity: 1,
          unit: ing.unit_of_measure || "unit",
          notes: undefined, // Using undefined instead of null for compatibility
        }));

        // Save the recipe to the database
        const savedRecipe = await createCompleteRecipe(
          recipeData,
          ingredientData
        );
        console.log("Saved recipe to database:", savedRecipe);

        // Format the response for GraphQL
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
              imageUrl: `/ingredients/${ing.name
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
      } catch (error) {
        console.error("Error generating recipe:", error);
        throw error;
      }
    },
    voteRecipe: async (
      _: unknown,
      { recipeId, vote }: { recipeId: string; vote: "UP" | "DOWN" }
    ) => {
      // In a real application, this would update the database
      // For now, just return a placeholder response
      return {
        id: recipeId,
        votes: vote === "UP" ? 1 : -1,
      };
    },
    createRecipe: async (
      _: unknown,
      { recipe }: { recipe: RecipeInput; ingredients: unknown[] }
    ) => {
      // In a real application, this would create a new recipe in the database
      // For now, just return a placeholder response
      return {
        id: "new-recipe",
        ...recipe,
        createdAt: new Date().toISOString(),
        votes: 0,
      };
    },
  },
};

// Create executable schema
const schema = createSchema({
  typeDefs,
  resolvers,
});

// Create a Yoga instance with the schema
const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
});

// Export the handler to handle all incoming requests
export const GET = async (request: NextRequest) => {
  return yoga.handleRequest(request, {});
};

export const POST = async (request: NextRequest) => {
  return yoga.handleRequest(request, {});
};
