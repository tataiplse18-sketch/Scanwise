"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedScoreCircleProps {
  score: number;
  riskLevel: string;
  color: string;
  description: string;
}

export default function AnimatedScoreCircle({
  score,
  riskLevel,
  color,
  description,
}: AnimatedScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedOffset, setAnimatedOffset] = useState(2 * Math.PI * 58); // full circumference = hidden
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const duration = 1500; // 1.5 seconds

  const circumference = 2 * Math.PI * 58;
  const targetOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    // Reset animation
    setAnimatedScore(0);
    setAnimatedOffset(circumference);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic timing
      const eased = 1 - Math.pow(1 - progress, 3);

      // Animate score number
      setAnimatedScore(Math.round(eased * score));

      // Animate SVG circle
      setAnimatedOffset(circumference - eased * (score / 100) * circumference);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    // Small delay before starting animation
    const timeout = setTimeout(() => {
      startTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [score, circumference]);

  // Risk level label
  const riskLabel =
    riskLevel === "poor"
      ? "Poor"
      : riskLevel === "fair"
      ? "Fair"
      : riskLevel === "good"
      ? "Good"
      : "Excellent";

  return (
    <section className="flex flex-col items-center py-4">
      <div className="relative">
        {/* Glow effect behind the circle */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30 transition-opacity duration-1000"
          style={{ backgroundColor: color }}
        />

        <svg width="160" height="160" className="-rotate-90 relative z-10">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-dark-800"
          />
          {/* Animated score circle */}
          <circle
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${color}66)`,
              transition: "none", // We handle animation via rAF
            }}
          />
        </svg>

        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-dark-400">/100</span>
        </div>
      </div>

      {/* Risk Level Label */}
      <p
        className="mt-3 text-lg font-semibold"
        style={{ color }}
      >
        {riskLabel}
      </p>
      <p className="text-xs text-dark-500 text-center max-w-xs mt-1">
        {description}
      </p>
    </section>
  );
}
