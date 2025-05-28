"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IngredientCategory } from "@/lib/types";

interface RouletteWheelProps {
  isSpinning: boolean;
  onComplete?: () => void;
}

export default function RouletteWheel({
  isSpinning,
  onComplete,
}: RouletteWheelProps) {
  const [targetRotation, setTargetRotation] = useState(0);
  const [isSpinningInternally, setIsSpinningInternally] = useState(false);

  const categories: IngredientCategory[] = [
    "Protein",
    "Vegetables",
    "Fruit",
    "Grains",
    "Dairy",
    "Spices",
    "Herbs",
    "Oil",
  ];

  const segmentGradients = [
    { start: "#E53E3E", end: "#FC8181", textColor: "#FFFFFF" }, // Red - Protein
    { start: "#38A169", end: "#68D391", textColor: "#FFFFFF" }, // Green - Vegetables
    { start: "#D69E2E", end: "#F6E05E", textColor: "#2D3748" }, // Yellow - Fruit
    { start: "#3182CE", end: "#63B3ED", textColor: "#FFFFFF" }, // Blue - Grains
    { start: "#805AD5", end: "#B794F6", textColor: "#FFFFFF" }, // Purple - Dairy
    { start: "#DD6B20", end: "#F6AD55", textColor: "#FFFFFF" }, // Orange - Spices
    { start: "#319795", end: "#4FD1C7", textColor: "#FFFFFF" }, // Teal - Herbs
    { start: "#E53E3E", end: "#FBB6CE", textColor: "#2D3748" }, // Pink - Oil
  ];

  useEffect(() => {
    if (isSpinning && !isSpinningInternally) {
      setIsSpinningInternally(true);

      setTimeout(() => {
        setTargetRotation((prev) => prev + 1440 + Math.random() * 360);
      }, 200);

      // Simulate completion after animation
      setTimeout(() => {
        setIsSpinningInternally(false);
        if (onComplete) {
          onComplete();
        }
      }, 4000);
    }
  }, [isSpinning, isSpinningInternally, onComplete]);

  const triangleClipStyle = {
    clipPath: "polygon(50% 100%, 15% 0%, 85% 0%)",
  };

  const triangleHighlightStyle = {
    clipPath: "polygon(50% 85%, 25% 15%, 75% 15%)",
  };

  return (
    <div className="flex flex-col items-center">
      <style jsx>{`
        .wheel-text {
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="relative w-80 h-80">
        {/* Animated glow background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)",
            boxShadow: "0 0 20px 3px rgba(0, 0, 0, 0.15)",
          }}
          animate={
            isSpinning
              ? {
                  background: [
                    "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
                  ],
                  boxShadow: [
                    "0 0 20px 3px rgba(255, 215, 0, 0.4)",
                    "0 0 35px 8px rgba(255, 215, 0, 0.8)",
                    "0 0 20px 3px rgba(255, 215, 0, 0.4)",
                  ],
                }
              : {
                  background:
                    "radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)",
                  boxShadow: "0 0 20px 3px rgba(0, 0, 0, 0.15)",
                }
          }
          transition={{
            duration: isSpinning ? 2 : 0.5,
            repeat: isSpinning ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Main wheel SVG */}
        <motion.svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{
            transformOrigin: "center center",
            filter: "drop-shadow(0px 8px 15px rgba(0, 0, 0, 0.25))",
          }}
          animate={{
            rotate: targetRotation,
            scale: isSpinning ? 1.05 : 1,
          }}
          transition={{
            rotate: {
              duration: isSpinning ? 3.5 : 0.3,
              ease: isSpinning ? "easeOut" : "easeInOut",
            },
            scale: {
              duration: 0.3,
              ease: "easeInOut",
            },
          }}
        >
          <defs>
            {segmentGradients.map((gradient, i) => (
              <radialGradient
                key={`gradient-${i}`}
                id={`segment-gradient-${i}`}
                cx="100"
                cy="100"
                r="85"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={gradient.end} stopOpacity="0.9" />
                <stop offset="70%" stopColor={gradient.start} stopOpacity="1" />
                <stop
                  offset="100%"
                  stopColor={gradient.start}
                  stopOpacity="0.8"
                />
              </radialGradient>
            ))}

            <radialGradient id="center-gradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#cbd5e0" />
              <stop offset="100%" stopColor="#a0aec0" />
            </radialGradient>

            <filter
              id="text-shadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="1"
                floodColor="#000000"
                floodOpacity="0.5"
              />
            </filter>

            <linearGradient
              id="ring-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f7fafc" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e0" />
            </linearGradient>
          </defs>

          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="url(#ring-gradient)"
            strokeWidth="4"
            filter="drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.2))"
          />

          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />

          {categories.map((category, i) => {
            const angleIncrement = 360 / categories.length;
            const startAngle = i * angleIncrement;
            const endAngle = (i + 1) * angleIncrement;

            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const y1 = 100 + 85 * Math.sin(startRad);
            const x1 = 100 + 85 * Math.cos(startRad);
            const endRad = ((endAngle - 90) * Math.PI) / 180;
            const y2 = 100 + 85 * Math.sin(endRad);
            const x2 = 100 + 85 * Math.cos(endRad);

            const largeArcFlag = angleIncrement <= 180 ? 0 : 1;

            const path = `
              M 100 100
              L ${x1} ${y1}
              A 85 85 0 ${largeArcFlag} 1 ${x2} ${y2}
              Z
            `;

            const textAngle = startAngle + angleIncrement / 2;
            const textRad = ((textAngle - 90) * Math.PI) / 180;
            const textDistance = 60;
            const textX = 100 + textDistance * Math.cos(textRad);
            const textY = 100 + textDistance * Math.sin(textRad);
            const textRotation =
              textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle;

            return (
              <g key={category}>
                <path
                  d={path}
                  fill={`url(#segment-gradient-${i})`}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                />

                <path
                  d={`
                    M 100 100
                    L ${100 + 25 * Math.cos(startRad)} ${
                    100 + 25 * Math.sin(startRad)
                  }
                    A 25 25 0 ${largeArcFlag} 1 ${
                    100 + 25 * Math.cos(endRad)
                  } ${100 + 25 * Math.sin(endRad)}
                    Z
                  `}
                  fill="rgba(255,255,255,0.15)"
                />

                <text
                  x={textX}
                  y={textY}
                  fontSize="9"
                  fontWeight="700"
                  fill={segmentGradients[i].textColor}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="wheel-text"
                  filter="url(#text-shadow)"
                  style={{
                    transform: `rotate(${textRotation}deg)`,
                    transformOrigin: `${textX}px ${textY}px`,
                  }}
                >
                  {category}
                </text>

                <text
                  x={textX}
                  y={textY}
                  fontSize="11"
                  fontWeight="700"
                  fill="none"
                  stroke={
                    segmentGradients[i].textColor === "#FFFFFF"
                      ? "#000000"
                      : "#FFFFFF"
                  }
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="wheel-text"
                  style={{
                    transform: `rotate(${textRotation}deg)`,
                    transformOrigin: `${textX}px ${textY}px`,
                  }}
                >
                  {category}
                </text>

                {/* Segment divider lines */}
                <line
                  x1="100"
                  y1="100"
                  x2={x1}
                  y2={y1}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          <g>
            {/* Main center circle */}
            <circle
              cx="100"
              cy="100"
              r="18"
              fill="url(#center-gradient)"
              stroke="#94a3b8"
              strokeWidth="2"
              filter="drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25))"
            />

            {/* Inner circle detail */}
            <circle
              cx="100"
              cy="100"
              r="12"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
            />

            {/* Center highlight */}
            <circle cx="96" cy="96" r="4" fill="rgba(255,255,255,0.8)" />

            {/* Small center dot */}
            <circle cx="100" cy="100" r="3" fill="#64748b" />
          </g>

          {/* Animated sparkles */}
          <AnimatePresence>
            {isSpinning && (
              <>
                {/* Dynamic sparkles */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 100 + 100 * Math.cos(rad);
                  const y = 100 + 100 * Math.sin(rad);

                  return (
                    <motion.g
                      key={`spark-${i}`}
                      initial={{ opacity: 0.3, scale: 0.8 }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#FFD700"
                        opacity="0.8"
                      />
                      <circle cx={x} cy={y} r="1.5" fill="#FFF" opacity="0.9" />
                      <path
                        d={`M ${x} ${y - 5} L ${x} ${y + 5} M ${x - 5} ${y} L ${
                          x + 5
                        } ${y}`}
                        stroke="#FFD700"
                        strokeWidth="1.5"
                        opacity="0.7"
                        strokeLinecap="round"
                      />
                    </motion.g>
                  );
                })}

                {/* Trailing light effect */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,215,0,0.3)"
                  strokeWidth="2"
                  strokeDasharray="10 5"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    strokeDashoffset: [0, -50, -100],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.svg>

        {/* Animated pointer */}
        <motion.div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
          animate={
            isSpinning
              ? {
                  y: [0, -2, 0],
                  rotate: [0, 5, -5, 0],
                }
              : { y: 0, rotate: 0 }
          }
          transition={{
            duration: 0.3,
            repeat: isSpinning ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 relative">
            {/* Pointer shadow */}
            <div
              className="absolute w-5 h-8 bg-gray-800 transform translate-x-1 translate-y-1 opacity-20"
              style={triangleClipStyle}
            />

            {/* Main pointer body */}
            <div
              className="absolute w-5 h-8 bg-gradient-to-b from-red-400 via-red-600 to-red-800"
              style={triangleClipStyle}
            />

            {/* Pointer highlight */}
            <div
              className="absolute w-3 h-5 bg-gradient-to-b from-red-200 to-red-400 transform translate-x-1 translate-y-1 opacity-70"
              style={triangleHighlightStyle}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
