"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_INGREDIENTS } from "@/lib/graphql";
import { Ingredient, IngredientCategory } from "@/lib/types";

interface IngredientSearchProps {
  onSelectIngredient: (ingredient: Ingredient) => void;
}

export default function IngredientSearch({
  onSelectIngredient,
}: IngredientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    IngredientCategory | ""
  >("");

  const { data, loading, error } = useQuery(GET_INGREDIENTS, {
    variables: {
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
    },
    skip: !searchTerm && !selectedCategory,
  });

  const categories: IngredientCategory[] = [
    "Protein",
    "Vegetables",
    "Fruit",
    "Grain",
    "Dairy",
    "Spice",
    "Herb",
    "Oil",
    "Condiment",
    "Other",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ingredients..."
              className="block w-full p-3 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as IngredientCategory | "")
            }
            className="p-3 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </form>

      {loading && <p className="text-center py-4">Loading ingredients...</p>}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          Error loading ingredients: {error.message}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {data?.ingredients.map((ingredient: Ingredient) => (
          <div
            key={ingredient.id}
            onClick={() => onSelectIngredient(ingredient)}
            className="p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="h-20 mb-2 bg-gray-200 rounded relative overflow-hidden">
              {ingredient.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ingredient.imageUrl}
                  alt={ingredient.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h3 className="font-medium text-gray-900 truncate">
              {ingredient.name}
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
              {ingredient.category}
            </span>
          </div>
        ))}

        {data?.ingredients?.length === 0 && searchTerm && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No ingredients found for "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
