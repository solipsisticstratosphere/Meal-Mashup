"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const categories = [
    "Белки",
    "Овощи",
    "Фрукты",
    "Злаки",
    "Молочные",
    "Специи",
    "Травы",
    "Масла",
  ];

  const segmentGradients = [
    { start: "#E53E3E", end: "#FC8181", textColor: "#FFFFFF" }, // Red - Белки
    { start: "#38A169", end: "#68D391", textColor: "#FFFFFF" }, // Green - Овощи
    { start: "#D69E2E", end: "#F6E05E", textColor: "#FFFFFF" }, // Yellow - Фрукты
    { start: "#3182CE", end: "#63B3ED", textColor: "#FFFFFF" }, // Blue - Злаки
    { start: "#805AD5", end: "#B794F6", textColor: "#FFFFFF" }, // Purple - Молочные
    { start: "#DD6B20", end: "#F6AD55", textColor: "#FFFFFF" }, // Orange - Специи
    { start: "#319795", end: "#4FD1C7", textColor: "#FFFFFF" }, // Teal - Травы
    { start: "#E53E3E", end: "#FBB6CE", textColor: "#FFFFFF" }, // Pink - Масла
  ];

  useEffect(() => {
    if (isSpinning && !isSpinningInternally) {
      setIsSpinningInternally(true);

      setTimeout(() => {
        setTargetRotation((prev) => prev + 1800 + Math.random() * 540);
      }, 200);

      setTimeout(() => {
        setIsSpinningInternally(false);
        if (onComplete) {
          onComplete();
        }
      }, 8500);
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
                    "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
                  ],
                  boxShadow: [
                    "0 0 30px 5px rgba(255, 215, 0, 0.5)",
                    "0 0 50px 12px rgba(255, 215, 0, 0.9)",
                    "0 0 30px 5px rgba(255, 215, 0, 0.5)",
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
            repeat: isSpinning ? Number.POSITIVE_INFINITY : 0,
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
              duration: isSpinning ? 8 : 0.3,

              ease: isSpinning ? [0.15, 0.35, 0.35, 0.85] : "easeInOut",
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
                dx="1"
                dy="1"
                stdDeviation="1"
                floodColor="#000000"
                floodOpacity="0.7"
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
            const textDistance = 55;
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
                  fontSize="10"
                  fontWeight="600"
                  fill={segmentGradients[i].textColor}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    transform: `rotate(${textRotation}deg)`,
                    transformOrigin: `${textX}px ${textY}px`,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                    fontFamily: "Arial, sans-serif",
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

          {/* Animated sparkles - теперь работают дольше */}
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
                        scale: [0.8, 1.4, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#FFD700"
                        opacity="0.9"
                      />
                      <circle cx={x} cy={y} r="2" fill="#FFF" opacity="1" />
                      <path
                        d={`M ${x} ${y - 6} L ${x} ${y + 6} M ${x - 6} ${y} L ${
                          x + 6
                        } ${y}`}
                        stroke="#FFD700"
                        strokeWidth="2"
                        opacity="0.8"
                        strokeLinecap="round"
                      />
                    </motion.g>
                  );
                })}

                {/* Trailing light effect - дольше и ярче */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,215,0,0.5)"
                  strokeWidth="3"
                  strokeDasharray="15 8"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    strokeDashoffset: [0, -60, -120],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.svg>

        {/* Animated pointer */}
        <motion.div
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
          animate={
            isSpinning
              ? {
                  y: [0, -4, 0],
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.1, 1],
                }
              : { y: 0, rotate: 0, scale: 1 }
          }
          transition={{
            duration: 0.4,
            repeat: isSpinning ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
        >
          <div className="w-7 h-12 relative">
            {/* Pointer shadow */}
            <div
              className="absolute w-6 h-10 bg-gray-900 transform translate-x-1 translate-y-1 opacity-30"
              style={triangleClipStyle}
            />

            {/* Main pointer body */}
            <div
              className="absolute w-6 h-10 bg-gradient-to-b from-red-300 via-red-500 to-red-700"
              style={triangleClipStyle}
            />

            {/* Pointer highlight */}
            <div
              className="absolute w-4 h-6 bg-gradient-to-b from-red-100 to-red-300 transform translate-x-1 translate-y-1 opacity-80"
              style={triangleHighlightStyle}
            />

            {/* Extra glow effect */}
            <div
              className="absolute w-6 h-10 bg-gradient-to-b from-yellow-200 to-transparent opacity-40"
              style={triangleClipStyle}
            />
          </div>
        </motion.div>

        {isSpinning && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              background:
                "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
              boxShadow: "0 0 40px 10px rgba(255, 215, 0, 0.3)",
            }}
          />
        )}

        <AnimatePresence>
          {isSpinning && (
            <>
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = i * 22.5 + (Math.random() * 15 - 7.5);
                const distance = 160 + Math.random() * 80;
                const x = Math.cos((angle * Math.PI) / 180) * distance;
                const y = Math.sin((angle * Math.PI) / 180) * distance;
                const size = 0.6 + Math.random() * 0.8;

                return (
                  <motion.div
                    key={`star-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      fontSize: `${size}rem`,
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      opacity: [0, 0.3, 0.6, 0.3, 0],
                      scale: [0, 0.8, 1, 0.8, 0],
                      rotate: [0, 90, 180, 270, 360],
                      x: [x, x + (Math.random() * 30 - 15), x],
                      y: [y, y + (Math.random() * 30 - 15), y],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.15 + Math.random() * 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <div className="text-yellow-200 opacity-40">⭐</div>
                  </motion.div>
                );
              })}

              {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30 + (Math.random() * 20 - 10);
                const distance = 180 + Math.random() * 70;
                const x = Math.cos((angle * Math.PI) / 180) * distance;
                const y = Math.sin((angle * Math.PI) / 180) * distance;

                return (
                  <motion.div
                    key={`light-${i}`}
                    className="absolute pointer-events-none w-1 h-1 bg-yellow-100 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      boxShadow: "0 0 4px rgba(255, 255, 200, 0.6)",
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 0.4, 0.8, 0.4, 0],
                      scale: [0, 1, 1.5, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.25 + Math.random() * 1,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}

              {Array.from({ length: 8 }).map((_, i) => {
                const angle = i * 45 + (Math.random() * 30 - 15);
                const distance = 200 + Math.random() * 50;
                const x = Math.cos((angle * Math.PI) / 180) * distance;
                const y = Math.sin((angle * Math.PI) / 180) * distance;

                return (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    }}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                      opacity: [0, 0.2, 0.5, 0.2, 0],
                      scale: [0, 0.5, 1, 0.5, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2.5 + Math.random() * 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.3 + Math.random() * 0.8,
                      ease: [0.4, 0, 0.6, 1],
                    }}
                  >
                    <div className="w-1 h-1 bg-yellow-200 rounded-full opacity-60" />
                    <div
                      className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full opacity-80"
                      style={{ transform: "scale(0.5)" }}
                    />
                  </motion.div>
                );
              })}

              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {[1, 2].map((ring, i) => (
                  <motion.div
                    key={`wave-${i}`}
                    className="absolute border border-yellow-200 rounded-full opacity-10"
                    style={{
                      width: `${320 + ring * 40}px`,
                      height: `${320 + ring * 40}px`,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      borderWidth: "1px",
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: [0, 0.15, 0],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{
                      duration: 5 + i,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 1.5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>

              {Array.from({ length: 6 }).map((_, i) => {
                const randomDelay = Math.random() * 3;
                const randomAngle = Math.random() * 360;
                const randomDistance = 140 + Math.random() * 100;
                const x =
                  Math.cos((randomAngle * Math.PI) / 180) * randomDistance;
                const y =
                  Math.sin((randomAngle * Math.PI) / 180) * randomDistance;

                return (
                  <motion.div
                    key={`twinkle-${i}`}
                    className="absolute pointer-events-none text-yellow-100 text-xs opacity-30"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: randomDelay,
                      repeatDelay: 2 + Math.random() * 3,
                      ease: "easeInOut",
                    }}
                  >
                    ✦
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
