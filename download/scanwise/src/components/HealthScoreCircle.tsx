"use client";

import { useEffect, useState } from "react";
import { getHealthScoreInfo } from "@/types";

interface HealthScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function HealthScoreCircle({
  score,
  size = 160,
  strokeWidth = 10,
  className = "",
}: HealthScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const info = getHealthScoreInfo(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const center = size / 2;

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-dark-700/50"
        />
        {/* Foreground ring with animation */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={info.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring"
          style={{
            filter: `drop-shadow(0 0 8px ${info.color}40)`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color: info.color }}>
          {animatedScore}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-dark-400">
          {info.label}
        </span>
      </div>
    </div>
  );
}
