"use client";

import React, { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useMutation } from "@apollo/client";
import { UPDATE_RECIPE } from "@/lib/graphql";
import { toast } from "sonner";

interface ImageUploaderProps {
  recipeId: string;
  currentImageUrl?: string | null;
  onImageUploaded: (imageUrl: string) => void;
}

export default function ImageUploader({
  recipeId,
  currentImageUrl,
  onImageUploaded,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [updateRecipe] = useMutation(UPDATE_RECIPE);

  const handleUpload = async () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      toast.error("Cloudinary configuration is missing");
      return;
    }

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setIsUploading(true);

      try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const uniqueId = `recipe_${recipeId}_${timestamp}`;

        const paramsToSign = {
          timestamp: timestamp,
          folder: "recipes",
          public_id: uniqueId,
        };

        const signResponse = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paramsToSign }),
        });

        if (!signResponse.ok) {
          throw new Error("Failed to get signature");
        }

        const { signature } = await signResponse.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "recipes");
        formData.append("public_id", uniqueId);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await uploadResponse.json();

        if (data.secure_url) {
          const { data: recipeData } = await updateRecipe({
            variables: {
              id: recipeId,
              recipe: {
                image_url: data.secure_url,
              },
            },
          });

          if (recipeData?.updateRecipe?.id) {
            toast.success("Recipe image updated successfully!");
            onImageUploaded(data.secure_url);
          } else {
            toast.error("Failed to update recipe image");
          }
        } else {
          toast.error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  return (
    <button
      onClick={handleUpload}
      disabled={isUploading}
      className="flex items-center px-4 py-2 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
    >
      {isUploading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Camera className="w-5 h-5 mr-2" />
      )}
      {currentImageUrl ? "Change Image" : "Upload Image"}
    </button>
  );
}
