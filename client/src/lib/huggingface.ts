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

export interface IngredientWithUnit {
  id: string;
  name: string;
  unit_of_measure?: string | null;
}

export const generateRecipePrompt = (
  ingredients: string[] | IngredientWithUnit[]
): string => {
  const hasUnits =
    ingredients.length > 0 &&
    typeof ingredients[0] !== "string" &&
    "name" in ingredients[0];

  let ingredientsText = "";

  if (hasUnits) {
    const typedIngredients = ingredients as IngredientWithUnit[];
    ingredientsText = typedIngredients
      .map((ing) => {
        if (ing.unit_of_measure) {
          return `${ing.name} (measured in ${ing.unit_of_measure})`;
        }
        return ing.name;
      })
      .join(", ");
  } else {
    ingredientsText = (ingredients as string[]).join(", ");
  }

  return `Create a detailed recipe using only these ingredients: ${ingredientsText}.

The recipe should include:
1. A creative title
2. A short description of the dish
3. Ingredient quantities (use common measurements like cups, tablespoons, grams)
4. Step-by-step cooking instructions
5. Estimated preparation time in minutes
6. Difficulty level (Easy, Medium, or Hard)

Respond only in valid JSON. Do not include explanations or comments.

Format the response as:
{
  "title": "Recipe Title",
  "description": "Short description",
  "ingredients": [
    {"name": "ingredient name", "quantity": "amount"}
  ],
  "cookingMethod": [
    "Step 1 instruction text.",
    "Step 2 instruction text.",
    "Step 3 instruction text."
    // ... add all steps here, each as a separate string in the array
  ],
  "preparationTime": "preparation time in minutes",
  "difficulty": "difficulty level"
}
Ensure each element in the "cookingMethod" array is a full, complete instruction step. Do not include step numbers (like "1.", "2.") within the strings in the array, as the rendering function will add them.`;
};

function extractJSON(text: string): Partial<RecipeResponse> | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const jsonText = jsonMatch[0];

      const fixedJsonText = jsonText.replace(
        /"cookingMethod"\s*:\s*\{(?:"[^"]*"(?:,|,\s*)?)+\}/g,
        (match) => {
          const itemsMatch = match.match(/"[^"]*"/g);
          if (itemsMatch && itemsMatch.length > 1) {
            const items = itemsMatch.slice(1);
            return `"cookingMethod": ${items.join("\\n")}`;
          }
          return match;
        }
      );

      const parsed = JSON.parse(fixedJsonText);

      if (Array.isArray(parsed.cookingMethod)) {
        parsed.cookingMethod = parsed.cookingMethod.join("\n");
      }

      return parsed;
    } catch (err) {
      console.error("Standard JSON parse error:", err);
    }
  }

  const nonStandardMatch = text.match(/\{(?:"[^"]*"(?:,|,\s*)?)+\}/);
  if (nonStandardMatch) {
    try {
      const stepsMatch = nonStandardMatch[0].match(/"([^"]*)"/g);
      if (stepsMatch) {
        const steps = stepsMatch.map((step: string) =>
          step.replace(/"/g, "").trim()
        );

        return {
          title: `Recipe with ${steps.length} Steps`,
          description: "A recipe created from the provided ingredients",
          cookingMethod: steps.join("\n"),
          preparationTime: 30,
          difficulty: "Medium",
        };
      }
    } catch (err) {
      console.error("Non-standard format parse error:", err);
    }
  }

  const instructionsMatch = text.match(/\d+\.\s+[^\n\d]+/g);
  if (instructionsMatch && instructionsMatch.length > 0) {
    return {
      cookingMethod: instructionsMatch.join("\n"),
    };
  }

  return null;
}

export const generateRecipeFromIngredients = async (
  ingredients: string[] | IngredientWithUnit[]
): Promise<RecipeResponse> => {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Missing Gemini API key");
      throw new Error("Missing API key");
    }

    const prompt = generateRecipePrompt(ingredients);

    // Using gemini-1.5-flash-002 model
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002:generateContent";

    const ingredientNames =
      Array.isArray(ingredients) &&
      ingredients.length > 0 &&
      typeof ingredients[0] !== "string"
        ? (ingredients as IngredientWithUnit[]).map((ing) => ing.name)
        : (ingredients as string[]);

    console.log("Generating recipe with ingredients:", ingredientNames);

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Raw model output:", generatedText);

    let recipeData = extractJSON(generatedText);

    if (!recipeData || typeof recipeData.cookingMethod === "object") {
      try {
        const cookingMethodMatch = generatedText.match(
          /"cookingMethod":\s*\{(?:"[^"]*"(?:,|,\s*)?)+\}/
        );
        if (cookingMethodMatch) {
          const stepsMatch = cookingMethodMatch[0].match(/"([^"]*)"/g);
          if (stepsMatch && stepsMatch.length > 1) {
            const steps = stepsMatch
              .slice(1)
              .map((step: string) => step.replace(/"/g, "").trim());

            const fixedJson = generatedText.replace(
              /"cookingMethod":\s*\{(?:"[^"]*"(?:,|,\s*)?)+\}/,
              `"cookingMethod": "${steps.join("\\n")}"`
            );

            try {
              const jsonMatch = fixedJson.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                recipeData = JSON.parse(jsonMatch[0]);
              }
            } catch (err) {
              console.error("Fixed JSON parse error:", err);
            }
          }
        }
      } catch (err) {
        console.error("Manual cookingMethod fix error:", err);
      }
    }

    if (recipeData) {
      return {
        title: recipeData.title || `${ingredientNames[0] || "Mixed"} Dish`,
        description:
          recipeData.description ||
          `A dish featuring ${ingredientNames.join(", ")}`,
        ingredients: Array.isArray(recipeData.ingredients)
          ? recipeData.ingredients
          : ingredientNames.map((ing) => ({ name: ing, quantity: "to taste" })),
        cookingMethod:
          typeof recipeData.cookingMethod === "string"
            ? recipeData.cookingMethod
            : Array.isArray(recipeData.cookingMethod)
              ? (recipeData.cookingMethod as string[]).join("\n")
              : "No instructions provided",
        preparationTime: recipeData.preparationTime
          ? parseInt(String(recipeData.preparationTime))
          : 30,
        difficulty:
          (recipeData.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
      };
    } else {
      console.error("Failed to extract valid JSON from response");
      return generateFallbackRecipe(ingredientNames);
    }
  } catch (error) {
    console.error("Error generating recipe:", error);

    const fallbackIngredientNames =
      Array.isArray(ingredients) &&
      ingredients.length > 0 &&
      typeof ingredients[0] !== "string"
        ? (ingredients as IngredientWithUnit[]).map((ing) => ing.name)
        : (ingredients as string[]);

    return generateFallbackRecipe(fallbackIngredientNames);
  }
};

function generateCookingMethod(ingredientNames: string[]): string {
  const steps = ["Start by preparing all your ingredients."];

  const hasProtein = ingredientNames.some((ing) =>
    ["chicken", "beef", "pork", "fish", "shrimp", "tofu"].some((protein) =>
      ing.toLowerCase().includes(protein)
    )
  );

  const hasVegetable = ingredientNames.some((ing) =>
    ["carrot", "onion", "pepper", "tomato", "spinach", "lettuce"].some((veg) =>
      ing.toLowerCase().includes(veg)
    )
  );

  const hasGrain = ingredientNames.some((ing) =>
    ["pasta", "rice", "noodle", "bread"].some((grain) =>
      ing.toLowerCase().includes(grain)
    )
  );

  const hasHerb = ingredientNames.some((ing) =>
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

function generateFallbackRecipe(
  ingredients: string[] | IngredientWithUnit[]
): RecipeResponse {
  const ingredientNames =
    Array.isArray(ingredients) &&
    ingredients.length > 0 &&
    typeof ingredients[0] !== "string"
      ? (ingredients as IngredientWithUnit[]).map((ing) => ing.name)
      : (ingredients as string[]);

  return {
    title: `${ingredientNames[0] || "Mixed"} ${
      ingredientNames.length > 1 ? `with ${ingredientNames[1]}` : ""
    } Delight`,
    description: `A creative dish featuring ${ingredientNames.join(", ")}`,
    ingredients: ingredientNames.map((ing) => ({
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
    cookingMethod: generateCookingMethod(ingredientNames),
    preparationTime: Math.floor(Math.random() * 20) + 20,
    difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as
      | "Easy"
      | "Medium"
      | "Hard",
  };
}

// Нова функція для генерації зображень рецептів з використанням fal-ai
// ПРИМІТКА: Функціональність тимчасово відключена
// Можна реалізувати в майбутньому, використовуючи fal-ai API

/*
export const generateRecipeImage = async (recipeTitle: string): Promise<string | null> => {
  try {
    // Отримання API ключа
    const apiKey = process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_API_KEY;

    if (!apiKey) {
      console.error("Missing fal.ai API key");
      throw new Error("Missing API key");
    }

    // Імпорт fal з @fal-ai/client
    const { fal } = await import("@fal-ai/client");
    
    // Налаштування клієнта
    fal.config({
      credentials: apiKey
    });

    const prompt = `A professional food photography image of ${recipeTitle}, high quality, realistic, appetizing, on a plate, restaurant presentation, food styling, soft lighting, 4k, detailed`;
    
    console.log(`Generating image for recipe: ${recipeTitle} using fal.ai`);
    
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.forEach(log => console.log(log.message));
        }
      },
    });

    console.log("Fal.ai image generation result:", result);

    if (result && result.images && result.images.length > 0) {
      return result.images[0].url;
    } else if (result.data && result.data.images && result.data.images.length > 0) {
      return result.data.images[0].url;
    } else {
      console.error("No image data in the response");
      return null;
    }
  } catch (error) {
    console.error("Error generating recipe image:", error);
    return null;
  }
};
*/
