// Импорты закомментированы, так как функциональность генерации изображений отключена
// import { useState } from "react";
// import Image from "next/image";
// import Button from "../ui/Button";
// import { generateRecipeImage } from "@/lib/huggingface";

// Компонент для генерации изображений рецептов
// ПРИМІТКА: Функціональність тимчасово відключена
// Можна реалізувати в майбутньому, використовуючи fal-ai API
// Для реалізації потрібно:
// 1. Встановити пакет @fal-ai/client: npm install @fal-ai/client
// 2. Отримати API ключ з fal.ai
// 3. Додати API ключ до .env.local як FAL_KEY або NEXT_PUBLIC_FAL_API_KEY
// 4. Розкоментувати код нижче та імпорт функції generateRecipeImage

interface RecipeImageGeneratorProps {
  recipeTitle: string;
  onImageGenerated: (imageUrl: string) => void;
  className?: string;
}

const RecipeImageGenerator = ({
  className = "",
}: Partial<RecipeImageGeneratorProps>) => {
  // Заглушка для компонента
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-full">
        <div className="aspect-video w-full bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-amber-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p className="text-amber-700 font-medium">
            Генерація зображень тимчасово відключена
          </p>
          <p className="text-amber-600 text-sm mt-2 text-center px-4">
            Функціональність генерації зображень буде доступна в майбутніх
            версіях
          </p>
        </div>
      </div>
    </div>
  );

  /* 
  
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!recipeTitle) {
      setError("Recipe title is required to generate an image");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateRecipeImage(recipeTitle);
      
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        onImageGenerated(imageUrl);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError("An error occurred while generating the image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {generatedImage ? (
        <div className="w-full relative">
          <div className="aspect-video w-full relative rounded-lg overflow-hidden">
            <Image 
              src={generatedImage} 
              alt={recipeTitle} 
              fill
              className="object-cover"
            />
          </div>
          <Button
            onClick={handleGenerateImage}
            size="sm"
            variant="outline"
            className="mt-2"
            isLoading={isGenerating}
            disabled={isGenerating}
          >
            Regenerate Image
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <div className="aspect-video w-full bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-amber-700 font-medium">Generating image...</p>
                <p className="text-amber-600 text-sm mt-1">This may take a moment</p>
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-amber-400 mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <p className="text-amber-700 font-medium">No image generated yet</p>
                <Button
                  onClick={handleGenerateImage}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
                  isLoading={isGenerating}
                  disabled={isGenerating}
                >
                  Generate Recipe Image with AI
                </Button>
              </>
            )}
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  );
  */
};

export default RecipeImageGenerator;
