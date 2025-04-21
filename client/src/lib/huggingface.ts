interface RecipeResponse {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
  }>;
  cookingMethod: string;
  preparationTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const generateRecipePrompt = (ingredients: string[]): string => {
  return `Create a detailed recipe using only these ingredients: ${ingredients.join(
    ", "
  )}.

The recipe should include:
1. A creative title
2. A short description of the dish
3. Ingredient quantities (use common measurements like cups, tablespoons, grams)
4. Step-by-step cooking instructions
5. Estimated preparation time in minutes
6. Difficulty level (Easy, Medium, or Hard)

Format the response as JSON with the following structure:
{
  "title": "Recipe Title",
  "description": "Short description",
  "ingredients": [
    {"name": "ingredient name", "quantity": "amount"}
  ],
  "cookingMethod": "Step-by-step instructions",
  "preparationTime": 30,
  "difficulty": "Medium"
}`;
};

export const generateRecipeFromIngredients = async (
  ingredients: string[]
): Promise<RecipeResponse> => {
  try {
    const apiToken =
      process.env.HUGGINGFACE || process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN;

    if (!apiToken) {
      console.error("Missing Hugging Face API token");
      throw new Error("Missing API token");
    }

    const prompt = generateRecipePrompt(ingredients);

    const apiUrl = "https://api-inference.huggingface.co/models/gpt2/gpt2";

    console.log("Generating recipe with ingredients:", ingredients);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Hugging Face API error:", error);
      throw new Error(`API error: ${response.status}`);
    }

    try {
      const data = await response.json();
      const generatedText = data[0]?.generated_text || "";
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const recipeData = JSON.parse(jsonMatch[0]);

        return {
          title: recipeData.title || `${ingredients[0] || "Mixed"} Dish`,
          description:
            recipeData.description ||
            `A dish featuring ${ingredients.join(", ")}`,
          ingredients: Array.isArray(recipeData.ingredients)
            ? recipeData.ingredients
            : ingredients.map((ing) => ({ name: ing, quantity: "to taste" })),
          cookingMethod: recipeData.cookingMethod || "No instructions provided",
          preparationTime: parseInt(recipeData.preparationTime) || 30,
          difficulty:
            (recipeData.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
        };
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing primary model response:", parseError);

      return await generateBackupRecipe(ingredients);
    }
  } catch (error) {
    console.error("Error generating recipe:", error);

    try {
      return await generateBackupRecipe(ingredients);
    } catch (backupError) {
      console.error("Backup model also failed:", backupError);

      return generateFallbackRecipe(ingredients);
    }
  }
};

async function generateBackupRecipe(
  ingredients: string[]
): Promise<RecipeResponse> {
  const apiToken =
    process.env.HUGGINGFACE || process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN;

  if (!apiToken) {
    throw new Error("Missing API token");
  }

  const apiUrl = "https://api-inference.huggingface.co/models/distilgpt2";

  const prompt = generateRecipePrompt(ingredients);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Backup API error: ${response.status}`);
  }

  try {
    const data = await response.json();
    const generatedText = data[0]?.generated_text || "";

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const recipeData = JSON.parse(jsonMatch[0]);

      return {
        title: recipeData.title || `${ingredients[0] || "Mixed"} Recipe`,
        description:
          recipeData.description ||
          `A dish featuring ${ingredients.join(", ")}`,
        ingredients: Array.isArray(recipeData.ingredients)
          ? recipeData.ingredients
          : ingredients.map((ing) => ({ name: ing, quantity: "to taste" })),
        cookingMethod: recipeData.cookingMethod || "No instructions provided",
        preparationTime: parseInt(recipeData.preparationTime) || 30,
        difficulty:
          (recipeData.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
      };
    } else {
      throw new Error("No valid JSON found in backup model response");
    }
  } catch (parseError) {
    console.error("Error parsing backup model response:", parseError);
    throw parseError;
  }
}

function generateCookingMethod(ingredients: string[]): string {
  const steps = ["Start by preparing all your ingredients."];

  const hasProtein = ingredients.some((ing) =>
    ["chicken", "beef", "pork", "fish", "shrimp", "tofu"].some((protein) =>
      ing.toLowerCase().includes(protein)
    )
  );

  const hasVegetable = ingredients.some((ing) =>
    ["carrot", "onion", "pepper", "tomato", "spinach", "lettuce"].some((veg) =>
      ing.toLowerCase().includes(veg)
    )
  );

  const hasGrain = ingredients.some((ing) =>
    ["pasta", "rice", "noodle", "bread"].some((grain) =>
      ing.toLowerCase().includes(grain)
    )
  );

  const hasHerb = ingredients.some((ing) =>
    ["mint", "basil", "thyme", "oregano", "parsley"].some((herb) =>
      ing.toLowerCase().includes(herb)
    )
  );

  if (hasProtein) {
    steps.push("Season your protein and cook until properly done.");
  }

  if (hasVegetable) {
    steps.push("Wash and chop the vegetables into bite-sized pieces.");
    steps.push("Sauté the vegetables until tender but still crisp.");
  }

  if (hasGrain) {
    steps.push("Cook the grains according to package instructions.");
  }

  if (hasHerb) {
    steps.push("Finely chop the herbs to release their aromatics.");
  }

  steps.push("Combine all the ingredients in a large bowl.");
  steps.push("Mix everything together gently to preserve textures.");
  steps.push("Serve immediately and enjoy your meal!");

  return steps.join("\n");
}

function generateFallbackRecipe(ingredients: string[]): RecipeResponse {
  return {
    title: `${ingredients[0] || "Mixed"} ${
      ingredients.length > 1 ? `with ${ingredients[1]}` : ""
    } Delight`,
    description: `A creative dish featuring ${ingredients.join(", ")}`,
    ingredients: ingredients.map((ing) => ({
      name: ing,
      quantity:
        ing.toLowerCase().includes("salt") ||
        ing.toLowerCase().includes("pepper")
          ? "to taste"
          : `${Math.floor(Math.random() * 3) + 1} ${
              ing.toLowerCase().includes("pasta") ||
              ing.toLowerCase().includes("rice")
                ? "cups"
                : ing.toLowerCase().includes("carrot") ||
                  ing.toLowerCase().includes("apple")
                ? "pieces"
                : ing.toLowerCase().includes("mint") ||
                  ing.toLowerCase().includes("herb")
                ? "tablespoons"
                : "portions"
            }`,
    })),
    cookingMethod: generateCookingMethod(ingredients),
    preparationTime: Math.floor(Math.random() * 20) + 20,
    difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as
      | "Easy"
      | "Medium"
      | "Hard",
  };
}
