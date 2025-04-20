"use client";

import { useState, useEffect } from "react";
import { IngredientCategory } from "@/lib/types";

interface RouletteWheelProps {
  isSpinning: boolean;
  onComplete?: () => void;
}

export default function RouletteWheel({
  isSpinning,
  onComplete,
}: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);

  const categories: IngredientCategory[] = [
    "Protein",
    "Vegetable",
    "Fruit",
    "Grain",
    "Dairy",
    "Spice",
    "Herb",
    "Oil",
  ];

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#66D7D1",
    "#6B66FF",
    "#FFC6FF",
    "#70D6FF",
    "#FF70A6",
  ];

  useEffect(() => {
    if (isSpinning) {
      const targetRotation = rotation + 1440;
      let animationStartTime: number;
      const duration = 3000;

      const animateRotation = (timestamp: number) => {
        if (!animationStartTime) animationStartTime = timestamp;
        const elapsedTime = timestamp - animationStartTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);
        const newRotation = rotation + easeOut * 1440;

        setCurrentRotation(newRotation);

        if (progress < 1) {
          requestAnimationFrame(animateRotation);
        } else {
          setRotation(targetRotation);
          if (onComplete) onComplete();
        }
      };

      requestAnimationFrame(animateRotation);
    }
  }, [isSpinning, rotation, onComplete]);

  const segments = categories.map((category, i) => {
    const angleIncrement = 360 / categories.length;
    const startAngle = i * angleIncrement;
    const endAngle = (i + 1) * angleIncrement;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const largeArcFlag = angleIncrement <= 180 ? 0 : 1;

    const path = `
      M 100 100
      L ${x1} ${y1}
      A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;

    return (
      <path
        key={category}
        d={path}
        fill={colors[i]}
        stroke="white"
        strokeWidth="1"
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `rotate(${currentRotation}deg)` }}
        >
          {segments}

          <circle
            cx="100"
            cy="100"
            r="10"
            fill="white"
            stroke="#333"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-4 h-6 bg-red-600 clip-triangle"></div>
        </div>
      </div>

      {isSpinning && (
        <p className="mt-6 text-lg animate-pulse text-center font-medium">
          Creating your random recipe...
        </p>
      )}

      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
        }
      `}</style>
    </div>
  );
}
