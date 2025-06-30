"use client";

import { Ingredient } from "@/lib/types";
import Image from "next/image";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

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
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ingredient.id,
      data: { ingredient },
      disabled: dragDisabled,
    });

  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event: Event) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showTooltip, isMobile]);

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

  const handleImageError = () => {
    setImageError(true);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowTooltip(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      setShowTooltip(!showTooltip);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      {...attributes}
      {...(dragDisabled ? {} : listeners)}
      className={twMerge(
        "relative cursor-grab border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white overflow-hidden",
        isSelected && "ring-2 ring-blue-500",
        isDragging && "z-10",
        className
      )}
      onClick={isMobile ? handleCardClick : onClick}
      id={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      aria-describedby={`tooltip-${ingredient.id}`}
    >
      <div className="relative h-28 w-full bg-gradient-to-br from-gray-100 to-gray-200">
        {!imageError && ingredient.image_url ? (
          <Image
            src={ingredient.image_url}
            alt={ingredient.name}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-xs text-gray-500 mt-1">No image</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-gray-900 mb-1 truncate">
          {ingredient.name}
        </h3>
        <div className="flex justify-start w-full overflow-hidden">
          <span
            className={`inline-flex items-center px-2 py-1 text-xs rounded-full max-w-full ${getCategoryColor(
              ingredient.category
            )}`}
          >
            <span className="truncate">{ingredient.category}</span>
          </span>
        </div>
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

      {/* Индикатор информации для мобильных устройств */}
      {isMobile && !isDragging && (
        <div
          className="absolute right-2 bottom-2 bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-3 h-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        </div>
      )}

      <AnimatePresence>
        {showTooltip && !isDragging && (
          <motion.div
            id={`tooltip-${ingredient.id}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${isMobile ? "" : "pointer-events-none"} left-1/2 -translate-x-1/2 ${isMobile ? "top-full mt-2" : "bottom-full mb-2"} w-64 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden`}
          >
            <div className="relative h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200">
              {!imageError && ingredient.image_url ? (
                <Image
                  src={ingredient.image_url}
                  alt={ingredient.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">
                      No image available
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 text-lg mb-1">
                {ingredient.name}
              </h3>
              <div className="flex justify-start w-full overflow-hidden">
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs rounded-full max-w-full ${getCategoryColor(
                    ingredient.category
                  )}`}
                >
                  <span className="truncate">{ingredient.category}</span>
                </span>
              </div>
            </div>
            <div
              className={`absolute ${isMobile ? "top-0" : "bottom-0"} left-1/2 -translate-x-1/2 ${isMobile ? "-translate-y-1/2" : "translate-y-1/2"} rotate-45 w-3 h-3 bg-white border-${isMobile ? "l border-t" : "r border-b"} border-gray-100`}
            ></div>

            {isMobile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="absolute top-2 right-2 bg-gray-200 rounded-full p-1"
                aria-label="Close details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
