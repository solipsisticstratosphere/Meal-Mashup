"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ingredient, IngredientCategory } from "@/lib/types";

interface RouletteWheelProps {
  isSpinning: boolean;
  onComplete?: () => void;
  selectedIngredients?: Ingredient[];
}

export default function RouletteWheel({
  isSpinning,
  onComplete,
  selectedIngredients = [],
}: RouletteWheelProps) {
  const [isCookingInternally, setIsCookingInternally] = useState(false);
  const [contentColor, setContentColor] = useState("#E6F3FF");
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const colorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const categoryColors: Record<IngredientCategory, string> = {
    Meat: "#FF4D4D", // Ярко-красный
    Vegetables: "#22C55E", // Яркий зеленый
    Fruit: "#F59E0B", // Яркий янтарный (оранжево-желтый)
    Grains: "#3B82F6", // Яркий синий
    Dairy: "#A855F7", // Яркий фиолетовый
    Spices: "#F97316", // Яркий оранжевый
    Herbs: "#10B981", // Яркий изумрудный (зелено-бирюзовый)
    Oil: "#FACC15", // Яркий желтый
    Condiment: "#EC4899", // Яркий розовый
    Other: "#6366F1", // Яркий индиго
    Protein: "#06B6D4", // Яркий циан
    Seafood: "#38BDF8", // Небесно-голубой
    Legumes: "#84CC16", // Лаймовый / Ярко-салатовый (землистый, но яркий)
    Bakery: "#A16207", // Теплый коричневый / Охра
    Baking: "#FDBA74", // Светло-персиковый / Абрикосовый
    Nuts: "#CA8A04", // Золотисто-коричневый
    Seeds: "#78716C", // Серо-коричневый / Каменный
    Sweeteners: "#FBCFE8", // Нежно-розовый / Пастельный
    Beverages: "#4F46E5", // Глубокий индиго / Умеренно-фиолетовый
    Spreads: "#D946EF", // Яркая фуксия / Малиновый
  };

  const uniqueCategories = Array.from(
    new Set(selectedIngredients.map((ing) => ing.category))
  ) as IngredientCategory[];

  const ingredients = uniqueCategories.map((category) => ({
    name: category,
    color: categoryColors[category] || "#6366F1",
  }));

  const displayIngredients =
    ingredients.length > 0
      ? ingredients
      : [
          { name: "Meat", color: categoryColors.Meat },
          { name: "Vegetables", color: categoryColors.Vegetables },
          { name: "Fruit", color: categoryColors.Fruit },
          { name: "Grains", color: categoryColors.Grains },
          { name: "Dairy", color: categoryColors.Dairy },
          { name: "Spices", color: categoryColors.Spices },
          { name: "Herbs", color: categoryColors.Herbs },
          { name: "Oil", color: categoryColors.Oil },
          { name: "Condiment", color: categoryColors.Condiment },
          { name: "Protein", color: categoryColors.Protein },
          { name: "Seafood", color: categoryColors.Seafood },
          { name: "Legumes", color: categoryColors.Legumes },
          { name: "Bakery", color: categoryColors.Bakery },
          { name: "Baking", color: categoryColors.Baking },
          { name: "Nuts", color: categoryColors.Nuts },
          { name: "Seeds", color: categoryColors.Seeds },
          { name: "Sweeteners", color: categoryColors.Sweeteners },
          { name: "Beverages", color: categoryColors.Beverages },
          { name: "Spreads", color: categoryColors.Spreads },
        ];

  useEffect(() => {
    return () => {
      if (colorIntervalRef.current) {
        clearInterval(colorIntervalRef.current);
      }
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSpinning && isCookingInternally) {
      completeAnimation();
    } else if (isSpinning && !isCookingInternally && !animationFinished) {
      startAnimation();
    }
  }, [isSpinning, isCookingInternally, animationFinished]);

  const startAnimation = () => {
    setIsCookingInternally(true);
    setIsComplete(false);
    setAnimationFinished(false);

    const categoriesToShow =
      uniqueCategories.length > 0
        ? uniqueCategories
        : ([
            "Meat",
            "Vegetables",
            "Fruit",
            "Grains",
            "Dairy",
            "Spices",
          ] as IngredientCategory[]);

    const categoryCounts: Record<string, number> = {};
    selectedIngredients.forEach((ing) => {
      if (ing.category) {
        categoryCounts[ing.category] = (categoryCounts[ing.category] || 0) + 1;
      }
    });

    const totalAnimationTime = Math.min(
      8000,
      2000 + selectedIngredients.length * 800
    );
    const baseDisplayTime = 1200;

    let categoryIndex = 0;
    let animationEndTimer: NodeJS.Timeout | null = null;

    const showNextCategory = () => {
      if (categoryIndex >= categoriesToShow.length) {
        if (animationTimerRef.current) {
          clearTimeout(animationTimerRef.current);
        }
        animationTimerRef.current = setTimeout(() => {
          completeAnimation();
        }, 1000);
        return;
      }

      const category = categoriesToShow[categoryIndex];
      const ingredient = displayIngredients.find(
        (ing) => ing.name === category
      ) || {
        name: category,
        color: categoryColors[category as IngredientCategory] || "#6366F1",
      };

      setContentColor(ingredient.color);
      setCurrentIngredient(ingredient.name);

      const count = categoryCounts[category] || 1;
      const displayTime = baseDisplayTime + (count - 1) * 400;

      categoryIndex++;

      animationTimerRef.current = setTimeout(showNextCategory, displayTime);
    };

    showNextCategory();

    animationEndTimer = setTimeout(() => {
      completeAnimation();
    }, totalAnimationTime);

    colorIntervalRef.current = animationEndTimer as unknown as NodeJS.Timeout;
  };

  const completeAnimation = () => {
    if (colorIntervalRef.current) {
      clearInterval(colorIntervalRef.current);
      colorIntervalRef.current = null;
    }

    setIsCookingInternally(false);
    setCurrentIngredient("");
    setIsComplete(true);
    setAnimationFinished(true);

    if (onComplete) {
      onComplete();
    }
  };

  const getFinalGradient = () => {
    if (displayIngredients.length === 0) return ["#FFD700", "#FFA500"];

    if (displayIngredients.length === 1) {
      const color = displayIngredients[0].color;
      return [color, adjustColorBrightness(color, -20)];
    }

    return [
      displayIngredients[0].color,
      displayIngredients[displayIngredients.length - 1].color,
    ];
  };

  const adjustColorBrightness = (hex: string, percent: number) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const finalColors = getFinalGradient();

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} className="relative w-80 h-80">
        {/* Subtle background glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)",
            boxShadow: "0 0 20px 3px rgba(0, 0, 0, 0.1)",
          }}
          animate={
            isCookingInternally
              ? {
                  background:
                    "radial-gradient(circle, rgba(255,140,0,0.2) 0%, transparent 70%)",
                  boxShadow: "0 0 40px 8px rgba(255, 140, 0, 0.3)",
                }
              : isComplete
                ? {
                    background:
                      "radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)",
                    boxShadow: "0 0 50px 12px rgba(255, 215, 0, 0.4)",
                  }
                : {
                    background:
                      "radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)",
                    boxShadow: "0 0 20px 3px rgba(0, 0, 0, 0.1)",
                  }
          }
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
        />

        {/* Main cooking pot SVG */}
        <motion.svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{
            filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.2))",
          }}
          animate={{
            scale: isCookingInternally ? 1.02 : isComplete ? 1.05 : 1,
            rotate: isCookingInternally ? [0, 1, -1, 0] : 0,
          }}
          transition={{
            scale: { duration: 0.5, ease: "easeInOut" },
            rotate: {
              duration: 2,
              repeat: isCookingInternally ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            },
          }}
        >
          <defs>
            {/* Pot gradient */}
            <radialGradient id="pot-gradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#5A6670" />
              <stop offset="50%" stopColor="#3D4852" />
              <stop offset="100%" stopColor="#2D3748" />
            </radialGradient>

            {/* Rim gradient */}
            <radialGradient id="rim-gradient" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#8A9BA8" />
              <stop offset="100%" stopColor="#5A6670" />
            </radialGradient>

            {/* Content gradient - blend colors from selected ingredients when complete */}
            <radialGradient id="content-gradient" cx="50%" cy="30%" r="70%">
              <stop
                offset="0%"
                stopColor={isComplete ? finalColors[0] : contentColor}
                stopOpacity="0.95"
              />
              <stop
                offset="100%"
                stopColor={isComplete ? finalColors[1] : contentColor}
                stopOpacity="0.8"
              />
            </radialGradient>

            {/* Handle gradient */}
            <linearGradient
              id="handle-gradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8A9BA8" />
              <stop offset="100%" stopColor="#5A6670" />
            </linearGradient>

            {/* Steam filter */}
            <filter
              id="steam-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* Shadow */}
          <ellipse cx="100" cy="175" rx="50" ry="8" fill="rgba(0,0,0,0.2)" />

          {/* Main pot body */}
          <path
            d="M 40 80 
               Q 40 60, 60 60
               L 140 60
               Q 160 60, 160 80
               L 160 140
               Q 160 160, 140 160
               L 60 160
               Q 40 160, 40 140
               Z"
            fill="url(#pot-gradient)"
            stroke="#2d3748"
            strokeWidth="2"
          />

          {/* Rim */}
          <ellipse
            cx="100"
            cy="65"
            rx="58"
            ry="8"
            fill="url(#rim-gradient)"
            stroke="#4a5568"
            strokeWidth="1"
          />

          {/* Handles */}
          <path
            d="M 35 90 Q 20 90, 20 100 Q 20 110, 35 110"
            fill="none"
            stroke="url(#handle-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 165 90 Q 180 90, 180 100 Q 180 110, 165 110"
            fill="none"
            stroke="url(#handle-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Pot content */}
          <motion.ellipse
            cx="100"
            cy="110"
            rx="52"
            ry="35"
            fill="url(#content-gradient)"
            animate={
              isCookingInternally
                ? {
                    rx: [52, 54, 50, 52],
                    ry: [35, 38, 32, 35],
                  }
                : isComplete
                  ? {
                      rx: [52, 53, 52],
                      ry: [35, 36, 35],
                    }
                  : {}
            }
            transition={{
              duration: isComplete ? 4 : 2.5,
              repeat: isCookingInternally
                ? Number.POSITIVE_INFINITY
                : isComplete
                  ? Number.POSITIVE_INFINITY
                  : 0,
              ease: "easeInOut",
            }}
          />

          {/* Simple bubbles */}
          <AnimatePresence>
            {isCookingInternally && (
              <>
                {Array.from({ length: 10 }).map((_, i) => {
                  const x = 75 + Math.random() * 50;
                  const y = 120 + Math.random() * 20;
                  const size = 2 + Math.random() * 3;

                  return (
                    <motion.circle
                      key={`bubble-${i}`}
                      cx={x}
                      cy={y}
                      r={size}
                      fill="rgba(255,255,255,0.6)"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 1.2],
                        y: [y, y - 30],
                      }}
                      transition={{
                        duration: 2 + Math.random(),
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.3,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}
              </>
            )}
          </AnimatePresence>

          {/* Enhanced Steam animation */}
          <AnimatePresence>
            {(isCookingInternally || isComplete) && (
              <>
                {/* Background steam glow */}
                <motion.ellipse
                  cx="100"
                  cy="50"
                  rx={isComplete ? 40 : 30}
                  ry={isComplete ? 25 : 15}
                  fill={
                    isComplete
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.08)"
                  }
                  filter="url(#steam-blur)"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isComplete
                      ? [0.15, 0.25, 0.15]
                      : [0.05, 0.1, 0.05],
                    ry: isComplete ? [25, 30, 25] : [15, 18, 15],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Individual steam paths - staggered for more natural look */}
                {Array.from({ length: isComplete ? 6 : 4 }).map((_, i) => {
                  const offset = isComplete ? 25 : 20;
                  const baseX =
                    100 - offset + (i * 2 * offset) / (isComplete ? 5 : 3);
                  const x = baseX + (Math.random() * 6 - 3);
                  const steamHeight = isComplete
                    ? 60 + (i % 3) * 10
                    : 40 + (i % 2) * 10;
                  const steamWidth = isComplete
                    ? 12 + (i % 3) * 3
                    : 8 + (i % 2) * 2;
                  const curveFactor = 0.8 + Math.random() * 0.4;

                  const steamPath = `
                    M ${x} 65 
                    C ${x - steamWidth * curveFactor} ${65 - steamHeight / 3}, 
                      ${x + steamWidth * (1 - curveFactor)} ${65 - (steamHeight * 2) / 3}, 
                      ${x + (i % 2 ? 5 : -5)} ${65 - steamHeight}
                  `;

                  return (
                    <motion.path
                      key={`steam-${i}`}
                      d={steamPath}
                      fill="none"
                      stroke={
                        isComplete
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(255,255,255,0.5)"
                      }
                      strokeWidth={isComplete ? 3.5 : 2.5}
                      strokeLinecap="round"
                      filter="url(#steam-blur)"
                      initial={{ opacity: 0, pathLength: 0 }}
                      animate={{
                        opacity: [0, isComplete ? 0.7 : 0.5, 0],
                        pathLength: [0, 1],
                      }}
                      transition={{
                        duration: isComplete ? 3.5 + (i % 3) * 0.5 : 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * (isComplete ? 0.4 : 0.3),
                        ease: "easeOut",
                      }}
                    />
                  );
                })}

                {/* Additional steam particles  */}
                {isComplete && (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const x = 85 + Math.random() * 30;
                      const y = 60 - Math.random() * 20;
                      const size = 2 + Math.random() * 3;

                      return (
                        <motion.circle
                          key={`steam-particle-${i}`}
                          cx={x}
                          cy={y}
                          r={size}
                          fill="rgba(255,255,255,0.6)"
                          filter="url(#steam-blur)"
                          initial={{ opacity: 0, y: 65 }}
                          animate={{
                            opacity: [0, 0.6, 0],
                            y: [65, y - 10 - Math.random() * 15],
                            x: [x, x + (Math.random() * 10 - 5)],
                          }}
                          transition={{
                            duration: 2.5 + Math.random() * 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.3,
                            ease: "easeOut",
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Highlight */}
          <ellipse
            cx="85"
            cy="85"
            rx="8"
            ry="15"
            fill="rgba(255,255,255,0.25)"
            transform="rotate(-20 85 85)"
          />

          {/* Cooking text */}
          {isCookingInternally && (
            <motion.text
              x="100"
              y="190"
              fontSize="12"
              fontWeight="600"
              fill="#FF8C00"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Cooking...
            </motion.text>
          )}

          {/* Completion text */}
          {isComplete && !isCookingInternally && (
            <motion.text
              x="100"
              y="190"
              fontSize="12"
              fontWeight="600"
              fill="#FFD700"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              Ready!
            </motion.text>
          )}
        </motion.svg>
      </div>

      {/* Current ingredient display */}
      <AnimatePresence>
        {currentIngredient && (
          <motion.div
            className="mt-4 px-4 py-2 bg-black/40 rounded-full backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white font-medium text-base">
              Adding: {currentIngredient}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion message */}
      <AnimatePresence>
        {isComplete && !isCookingInternally && (
          <motion.div
            className="mt-4 px-4 py-2 bg-amber-500/80 rounded-full backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span className="text-white font-medium text-base">
              Recipe is ready!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
