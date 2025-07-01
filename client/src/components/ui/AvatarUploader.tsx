"use client";

import { useState, useEffect } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface AvatarUploaderProps {
  userId: string;
  currentImageUrl?: string | null;
  onImageUploaded: (imageUrl: string) => void;
  onImageDeleted: () => void;
}

export default function AvatarUploader({
  userId,
  currentImageUrl,
  onImageUploaded,
  onImageDeleted,
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [currentImageUrl]);

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
        const uniqueId = `avatar_${userId}_${timestamp}`;

        const paramsToSign = {
          timestamp: timestamp,
          folder: "avatars",
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
        formData.append("folder", "avatars");
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
          onImageUploaded(data.secure_url);
          toast.success("Avatar uploaded successfully!");
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

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    const urlParts = currentImageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    const publicId = `${folderName}/${fileName.split(".")[0]}`;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      const data = await response.json();

      if (data.success) {
        onImageDeleted();
        toast.success("Avatar removed successfully!");
      } else {
        toast.error("Failed to remove avatar");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to remove avatar");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {currentImageUrl && !imageError ? (
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-amber-200 shadow-md">
            <Image
              src={currentImageUrl}
              alt="Avatar"
              fill
              sizes="128px"
              className="object-cover"
              onError={() => setImageError(true)}
              priority
            />
            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity">
              <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || isDeleting}
                  className="p-2 bg-amber-500 rounded-full text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                  aria-label="Change avatar"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isUploading || isDeleting}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  aria-label="Delete avatar"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleUpload}
            className="h-32 w-32 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200 shadow-md cursor-pointer hover:bg-amber-200 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            ) : (
              <Camera className="h-8 w-8 text-amber-500" />
            )}
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {currentImageUrl && !imageError
          ? "Hover to change"
          : "Click to upload avatar"}
      </p>
    </div>
  );
}
