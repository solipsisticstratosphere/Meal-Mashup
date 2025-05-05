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
    "Meat",
    "Vegetables",
    "Fruit",
    "Grains",
    "Dairy",
    "Spices",
    "Herbs",
    "Oil",
    "Condiment",
    "Other",
    "Protein",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    onSelectIngredient(ingredient);
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
              aria-label="Search ingredients"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as IngredientCategory | "")
            }
            className="p-3 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
            aria-label="Filter by category"
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

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading ingredients...</span>
        </div>
      )}

      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          <div className="font-medium">Error loading ingredients</div>
          <div>{error.message}</div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {data?.ingredients?.length === 0 && (searchTerm || selectedCategory) ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No ingredients found {searchTerm ? `for "${searchTerm}"` : ""}
            {selectedCategory ? ` in category "${selectedCategory}"` : ""}
          </div>
        ) : (
          data?.ingredients?.map((ingredient: Ingredient) => (
            <div
              key={ingredient.id}
              onClick={() => handleSelectIngredient(ingredient)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectIngredient(ingredient);
                }
              }}
              className="p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition cursor-pointer focus:ring-2 focus:ring-blue-400 focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`Select ${ingredient.name}`}
            >
              <div className="h-20 mb-2 bg-gray-200 rounded relative overflow-hidden">
                {ingredient.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ingredient.image_url}
                    alt={ingredient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm text-gray-900 truncate">
                {ingredient.name}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                {ingredient.category}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
