"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import type { IngredientCategory } from "@/lib/types";
import { motion } from "framer-motion";

interface CategorySelectProps {
  selected: IngredientCategory | "";
  onChange: (category: IngredientCategory | "") => void;
}

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
  "Seafood",
  "Legumes",
  "Bakery",
  "Baking",
  "Nuts",
  "Seeds",
  "Sweeteners",
  "Beverages",
  "Spreads",
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
  Seafood: "🦐",
  Legumes: "🫘",
  Bakery: "🥖",
  Baking: "🧁",
  Nuts: "🥜",
  Seeds: "🌰",
  Sweeteners: "🍯",
  Beverages: "🥤",
  Spreads: "🧈",
};

export default function CategorySelect({
  selected,
  onChange,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [portalNode, setPortalNode] = useState<Element | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPortalNode(document.body);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isOpen) return;

      const target = e.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const dropdown =
    isOpen && rect && portalNode
      ? createPortal(
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
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto"
            >
              {/* All categories option */}
              <button
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="text-gray-400">🔍</span>
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onChange(cat);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 flex items-center gap-2"
                >
                  <span>{categoryEmojis[cat]}</span>
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>,
          portalNode
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-2.5 px-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all"
      >
        <span className="flex items-center gap-2 text-gray-700">
          {selected === "" ? (
            "All Categories"
          ) : (
            <>
              <span>{categoryEmojis[selected]}</span>
              {selected}
            </>
          )}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      {dropdown}
    </div>
  );
}
