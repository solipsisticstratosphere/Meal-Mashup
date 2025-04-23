"use client";

import { useState, useEffect } from "react";
import type { IngredientCategory } from "@/lib/types";
import { useSpring, animated, type SpringValue } from "@react-spring/web";
import { easings } from "@react-spring/web";

interface WheelStyles {
  rotate: SpringValue<number>;
  scale: SpringValue<number>;
}

interface RouletteWheelProps {
  isSpinning: boolean;
  onComplete?: () => void;
}

const AnimatedSvg = animated("svg");

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
    "Grain",
    "Dairy",
    "Spice",
    "Herb",
    "Oil",
  ];

  const segmentGradients = [
    { start: "#FF6B6B", end: "#FF8E8E" },
    { start: "#4ECDC4", end: "#6EEAE2" },
    { start: "#FFD166", end: "#FFDF8C" },
    { start: "#66D7D1", end: "#8EEAE5" },
    { start: "#6B66FF", end: "#8C88FF" },
    { start: "#FFC6FF", end: "#FFE0FF" },
    { start: "#70D6FF", end: "#9CE3FF" },
    { start: "#FF70A6", end: "#FF9BC0" },
  ];

  const styles: WheelStyles = useSpring({
    rotate: targetRotation,
    scale: isSpinning ? 1.05 : 1,
    config: {
      duration: isSpinning ? 35000 : 300,
      easing: isSpinning ? easings.easeOutQuad : easings.easeOutBack,
    },
    onRest: () => {
      if (isSpinningInternally) {
        setIsSpinningInternally(false);
        if (onComplete) {
          onComplete();
        }
      }
    },
  });

  useEffect(() => {
    if (isSpinning && !isSpinningInternally) {
      setIsSpinningInternally(true);

      setTimeout(() => {
        setTargetRotation((prev) => prev + 1440);
      }, 200);
    }
  }, [isSpinning, isSpinningInternally, setTargetRotation]);

  // Custom animation styles
  const animatePulseGlow = {
    animation: "pulse-glow 1.5s infinite",
  };

  const animateSparkle0 = {
    animation: "pulse 0.8s infinite",
  };

  const animateSparkle1 = {
    animation: "pulse 1.2s infinite 0.2s",
  };

  const animateSparkle2 = {
    animation: "pulse 1s infinite 0.4s",
  };

  const animateSparkle3 = {
    animation: "pulse 1.4s infinite 0.6s",
  };

  // Triangle clip paths
  const triangleClipStyle = {
    clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
  };

  const triangleSmallClipStyle = {
    clipPath: "polygon(50% 100%, 20% 20%, 80% 20%)",
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80">
        {/* Outer glow effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: isSpinning
              ? "0 0 25px 5px rgba(255, 215, 0, 0.6)"
              : "0 0 15px 2px rgba(0, 0, 0, 0.2)",
            transition: "box-shadow 0.5s ease",
            ...(isSpinning ? animatePulseGlow : {}),
          }}
        ></div>

        <AnimatedSvg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-lg"
          style={{
            transform: styles.rotate.to(
              (r: number) => `rotate(${r}deg) scale(${styles.scale.get()})`
            ),
            transformOrigin: "center center",
            filter: "drop-shadow(0px 5px 5px rgba(0, 0, 0, 0.3))",
          }}
        >
          {/* Define gradients */}
          <defs>
            {segmentGradients.map((gradient, i) => (
              <radialGradient
                key={`gradient-${i}`}
                id={`segment-gradient-${i}`}
                cx="100"
                cy="100"
                r="80"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={gradient.end} />
                <stop offset="90%" stopColor={gradient.start} />
              </radialGradient>
            ))}

            {/* Metallic effect for the center */}
            <linearGradient
              id="center-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f0f0f0" />
              <stop offset="50%" stopColor="#d0d0d0" />
              <stop offset="100%" stopColor="#f0f0f0" />
            </linearGradient>

            {/* Texture pattern */}
            <pattern
              id="texture"
              patternUnits="userSpaceOnUse"
              width="10"
              height="10"
            >
              <path
                d="M0,5 L10,5"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <path
                d="M5,0 L5,10"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Outer ring */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="url(#center-gradient)"
            strokeWidth="5"
            filter="drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))"
          />

          {/* Wheel segments */}
          {categories.map((category, i) => {
            const angleIncrement = 360 / categories.length;
            const startAngle = i * angleIncrement;
            const endAngle = (i + 1) * angleIncrement;

            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const y1 = 100 + 80 * Math.sin(startRad);
            const x1 = 100 + 80 * Math.cos(startRad);
            const endRad = ((endAngle - 90) * Math.PI) / 180;
            const y2 = 100 + 80 * Math.sin(endRad);
            const x2 = 100 + 80 * Math.cos(endRad);

            const largeArcFlag = angleIncrement <= 180 ? 0 : 1;

            const path = `
              M 100 100
              L ${x1} ${y1}
              A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}
              Z
            `;

            // Calculate text position
            const textAngle = startAngle + angleIncrement / 2;
            const textRad = ((textAngle - 90) * Math.PI) / 180;
            const textDistance = 50; // Distance from center
            const textX = 100 + textDistance * Math.cos(textRad);
            const textY = 100 + textDistance * Math.sin(textRad);
            const textRotation =
              textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle;

            return (
              <g key={category}>
                <path
                  d={path}
                  fill={`url(#segment-gradient-${i})`}
                  stroke="white"
                  strokeWidth="1.5"
                  filter="url(#texture)"
                />
                <text
                  x={textX}
                  y={textY}
                  fontSize="8"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    transform: `rotate(${textRotation}deg)`,
                    transformOrigin: `${textX}px ${textY}px`,
                    textShadow: "0px 1px 1px rgba(0,0,0,0.3)",
                  }}
                >
                  {category}
                </text>
                <text
                  x={textX}
                  y={textY}
                  fontSize="10"
                  fontWeight="bold"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    transform: `rotate(${textRotation}deg)`,
                    transformOrigin: `${textX}px ${textY}px`,
                    opacity: 0.5,
                  }}
                >
                  {category}
                </text>
                {/* Divider lines between segments */}
                <line
                  x1="100"
                  y1="100"
                  x2={x1}
                  y2={y1}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Center hub with metallic effect */}
          <g>
            <circle
              cx="100"
              cy="100"
              r="15"
              fill="url(#center-gradient)"
              stroke="#888"
              strokeWidth="1"
              filter="drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))"
            />
            <circle
              cx="100"
              cy="100"
              r="10"
              fill="url(#center-gradient)"
              stroke="#888"
              strokeWidth="0.5"
            />
            <circle cx="95" cy="95" r="3" fill="white" opacity="0.6" />
          </g>

          {/* Decorative elements that appear during spinning */}
          {isSpinning && (
            <>
              {/* Sparkles around the wheel */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = 100 + 90 * Math.cos(rad);
                const y = 100 + 90 * Math.sin(rad);

                const sparkleStyle =
                  i % 4 === 0
                    ? animateSparkle0
                    : i % 4 === 1
                    ? animateSparkle1
                    : i % 4 === 2
                    ? animateSparkle2
                    : animateSparkle3;

                return (
                  <g key={`spark-${i}`} style={sparkleStyle}>
                    <circle cx={x} cy={y} r="2" fill="#FFD700" />
                    <path
                      d={`M ${x} ${y - 3} L ${x} ${y + 3} M ${x - 3} ${y} L ${
                        x + 3
                      } ${y}`}
                      stroke="#FFD700"
                      strokeWidth="1"
                      opacity="0.8"
                    />
                  </g>
                );
              })}
            </>
          )}
        </AnimatedSvg>

        {/* Enhanced pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-6 h-8 relative">
            {/* Shadow for 3D effect */}
            <div
              className="absolute w-4 h-6 bg-red-800 transform translate-x-1 translate-y-1 opacity-30"
              style={triangleClipStyle}
            ></div>
            {/* Main pointer */}
            <div
              className="absolute w-4 h-6 bg-gradient-to-b from-red-500 to-red-700"
              style={triangleClipStyle}
            ></div>
            {/* Highlight */}
            <div
              className="absolute w-2 h-3 bg-red-400 transform translate-x-1 translate-y-1 opacity-50"
              style={triangleSmallClipStyle}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
