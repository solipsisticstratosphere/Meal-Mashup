"use client";

import { Ingredient } from "@/lib/types";
import Image from "next/image";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";

interface IngredientCardProps {
  ingredient: Ingredient;
  onClick?: () => void;
  isSelected?: boolean;
  dragDisabled?: boolean;
  className?: string;
  id?: string;
}

export default function IngredientCard({
  ingredient,
  onClick,
  isSelected = false,
  dragDisabled = false,
  className,
  id,
}: IngredientCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ingredient.id,
      data: { ingredient },
      disabled: dragDisabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Meat: "bg-red-100 text-red-800 border border-red-200",
      Protein: "bg-red-100 text-red-800 border border-red-200",
      Vegetables: "bg-green-100 text-green-800 border border-green-200",
      Fruit: "bg-amber-100 text-amber-800 border border-amber-200",
      Grains: "bg-blue-100 text-blue-800 border border-blue-200",
      Dairy: "bg-purple-100 text-purple-800 border border-purple-200",
      Spices: "bg-orange-100 text-orange-800 border border-orange-200",
      Herbs: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      Oil: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Condiment: "bg-pink-100 text-pink-800 border border-pink-200",
      Seafood: "bg-cyan-100 text-cyan-800 border border-cyan-200",
      Legumes: "bg-lime-100 text-lime-800 border border-lime-200",
      Bakery: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Baking: "bg-rose-100 text-rose-800 border border-rose-200",
      Nuts: "bg-amber-100 text-amber-800 border border-amber-200",
      Seeds: "bg-lime-100 text-lime-800 border border-lime-200",
      Sweeteners: "bg-pink-100 text-pink-800 border border-pink-200",
      Beverages: "bg-blue-100 text-blue-800 border border-blue-200",
      Spreads: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Other: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    };

    return (
      colors[category] || "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(dragDisabled ? {} : listeners)}
      className={twMerge(
        "relative cursor-grab border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white overflow-hidden",
        isSelected && "ring-2 ring-blue-500",
        isDragging && "z-10",
        className
      )}
      onClick={onClick}
      id={id}
    >
      <div className="relative h-28 w-full">
        <Image
          src={
            ingredient.image_url ||
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD48L3N2Zz4="
          }
          alt={ingredient.name}
          fill
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-cover"
        />
      </div>

      <div className="p-3">
        <h3 className="font-medium text-gray-900 mb-1">{ingredient.name}</h3>
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(
            ingredient.category
          )}`}
        >
          {ingredient.category}
        </span>
      </div>

      {!dragDisabled && (
        <div className="absolute right-2 top-2 bg-white/80 rounded-full p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
