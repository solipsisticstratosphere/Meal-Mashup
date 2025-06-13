"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@apollo/client";
import { GET_INGREDIENTS } from "@/lib/graphql";
import type { Ingredient, IngredientCategory } from "@/lib/types";
import { Search, X, ImageIcon } from "lucide-react";
import Loading from "@/components/ui/Loading";
import { motion, AnimatePresence } from "framer-motion";

interface IngredientMultiSelectProps {
  selected: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
  category?: IngredientCategory | "";
}

export default function IngredientMultiSelect({
  selected,
  onChange,
  category = "",
}: IngredientMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [portalNode, setPortalNode] = useState<Element | null>(null);

  useEffect(() => {
    setPortalNode(document.body);
  }, []);

  const { data, loading, error } = useQuery(GET_INGREDIENTS, {
    variables: {
      search: searchTerm || undefined,
      category: category || undefined,
    },
    skip: !searchTerm && !category,
  });

  const handleSelect = (ingredient: Ingredient) => {
    if (!selected.find((i) => i.id === ingredient.id)) {
      onChange([...selected, ingredient]);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(selected.filter((i) => i.id !== id));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        isOpen &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setRect(inputRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const dropdown = isOpen && rect && (
    <div
      style={{
        position: "absolute",
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.15 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto"
      >
        {loading && (
          <div className="p-4 flex justify-center">
            <Loading text="Loading" size="small" />
          </div>
        )}
        {error && <div className="p-4 text-sm text-red-600">Error loading</div>}
        {data?.ingredients?.length === 0 && !loading && (
          <div className="p-4 text-sm text-gray-500">No ingredients found</div>
        )}
        {data?.ingredients?.map((ing: Ingredient) => (
          <button
            key={ing.id}
            onClick={() => handleSelect(ing)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-amber-50 text-left"
          >
            <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              {ing.image_url ? (
                <img
                  src={ing.image_url}
                  alt={ing.name}
                  className="object-cover h-full w-full"
                />
              ) : (
                <ImageIcon className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-sm text-gray-700">{ing.name}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="relative" ref={inputRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="Search ingredients"
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
        />
      </div>

      {/* chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selected.map((ing) => (
            <motion.div
              key={ing.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
            >
              <span>{ing.name}</span>
              <button onClick={() => handleRemove(ing.id)}>
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {portalNode &&
        createPortal(<AnimatePresence>{dropdown}</AnimatePresence>, portalNode)}
    </div>
  );
}
