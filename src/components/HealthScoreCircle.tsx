"use client";

import { useEffect, useState } from "react";
import { getHealthScoreInfo } from "@/types";

interface HealthScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function HealthScoreCircle({
  score,
  size = 180,
  strokeWidth = 12,
}: HealthScoreCircleProps) {
  const [animatedOffset, setAnimatedOffset] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const info = getHealthScoreInfo(score);
  const targetOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow effect behind the circle */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: info.color }}
      />

      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={info.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          className="score-ring"
          style={{
            filter: `drop-shadow(0 0 6px ${info.color}30)`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color: info.color }}>
          {score}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-dark-400 mt-1">
          {info.label}
        </span>
      </div>
    </div>
  );
}
