"use client";

import type React from "react";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_INGREDIENTS } from "@/lib/graphql";
import type { Ingredient, IngredientCategory } from "@/lib/types";
import Loading from "@/components/ui/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Filter, X, ImageIcon } from "lucide-react";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const categoryEmojis: Record<IngredientCategory, string> = {
    Meat: "🥩",
    Vegetables: "🥕",
    Fruit: "🍎",
    Grains: "🌾",
    Dairy: "🥛",
    Spices: "🌶️",
    Herbs: "🌿",
    Oil: "🧴",
    Condiment: "🍯",
    Other: "📦",
    Protein: "🥚",
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    onSelectIngredient(ingredient);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearCategory = () => {
    setSelectedCategory("");
    setIsDropdownOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.form
        onSubmit={handleSearch}
        className="mb-6"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search Input */}
          <motion.div
            className="relative flex-grow"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ingredients..."
              className="block w-full py-3 pl-12 pr-12 text-sm bg-white border-2 border-gray-200 rounded-2xl 
                focus:ring-4 focus:ring-amber-100 focus:border-amber-400 
                transition-all duration-300 ease-out
                placeholder:text-gray-400
                shadow-sm hover:shadow-md focus:shadow-lg"
              aria-label="Search ingredients"
            />
            {searchTerm && (
              <motion.button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>

          {/* Category Dropdown */}
          <motion.div
            className="relative min-w-[160px] sm:min-w-[180px]"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between py-3 px-4 text-sm bg-white border-2 border-gray-200 rounded-2xl 
                focus:ring-4 focus:ring-amber-100 focus:border-amber-400 
                transition-all duration-300 ease-out
                shadow-sm hover:shadow-md focus:shadow-lg
                group"
              aria-label="Filter by category"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                <span className="text-gray-700 font-medium">
                  {selectedCategory ? (
                    <span className="flex items-center gap-1">
                      <span>{categoryEmojis[selectedCategory]}</span>
                      {selectedCategory}
                    </span>
                  ) : (
                    "All Categories"
                  )}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto">
                    <motion.button
                      type="button"
                      onClick={clearCategory}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      whileHover={{ backgroundColor: "#f9fafb" }}
                    >
                      <span className="text-gray-400">🔍</span>
                      All Categories
                    </motion.button>
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-amber-50 transition-colors flex items-center gap-2"
                        whileHover={{ backgroundColor: "#fffbeb" }}
                      >
                        <span>{categoryEmojis[category]}</span>
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {(searchTerm || selectedCategory) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                >
                  <Search className="w-3 h-3" />
                  <span>&quot;{searchTerm}&quot;</span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  <span>{categoryEmojis[selectedCategory]}</span>
                  <span>{selectedCategory}</span>
                  <button
                    type="button"
                    onClick={clearCategory}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-8"
        >
          <Loading text="Loading ingredients" size="small" />
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-4 text-red-700 bg-red-50 rounded-2xl border border-red-200"
          role="alert"
        >
          <div className="font-semibold mb-1">Error loading ingredients</div>
          <div className="text-sm">{error.message}</div>
        </motion.div>
      )}

      {/* Results Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          {data?.ingredients?.length === 0 &&
          (searchTerm || selectedCategory) ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="col-span-full text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No ingredients found
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? `No results for "${searchTerm}"` : ""}
                {selectedCategory ? ` in category "${selectedCategory}"` : ""}
              </p>
            </motion.div>
          ) : (
            data?.ingredients?.map((ingredient: Ingredient, index: number) => (
              <motion.div
                key={ingredient.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectIngredient(ingredient)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectIngredient(ingredient);
                  }
                }}
                className="group relative p-3 bg-white rounded-2xl border-2 border-gray-100 shadow-sm 
                  hover:shadow-lg hover:border-amber-200 
                  focus:ring-4 focus:ring-amber-100 focus:border-amber-400 focus:outline-none
                  transition-all duration-300 ease-out cursor-pointer
                  active:scale-95"
                tabIndex={0}
                role="button"
                aria-label={`Select ${ingredient.name}`}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Image Container */}
                <div className="relative h-20 sm:h-24 mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                  {ingredient.image_url ? (
                    <motion.img
                      src={ingredient.image_url}
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 group-hover:text-gray-500 transition-colors">
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                    {ingredient.name}
                  </h3>

                  <motion.div
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 group-hover:bg-amber-100 transition-colors text-xs font-medium text-gray-600 group-hover:text-amber-700"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-xs">
                      {categoryEmojis[ingredient.category]}
                    </span>
                    <span className="truncate">{ingredient.category}</span>
                  </motion.div>
                </div>

                {/* Selection Indicator */}
                <motion.div
                  className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </motion.div>
  );
}
