"use client";

import { getHealthScoreInfo } from "@/types";
import type { NutritionInfo, HealthScoreLabel } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

interface AIVerdictProps {
  healthScore: number;
  aiVerdict: string;
  allergens: string[];
  dietaryPref: string | null;
  userAllergens: string[];
  novaGroup: number;
  nutrition: NutritionInfo;
  additiveCount: number;
}

export default function AIVerdict({
  healthScore,
  aiVerdict,
  allergens,
  dietaryPref,
  userAllergens,
  novaGroup,
  nutrition,
  additiveCount,
}: AIVerdictProps) {
  const info = getHealthScoreInfo(healthScore);

  // Check for allergen matches
  const matchedAllergens = allergens.filter((a) =>
    userAllergens.some((ua) => a.toLowerCase().includes(ua.toLowerCase()))
  );

  // Build verdict highlights
  const highlights: Array<{ icon: React.ReactNode; text: string; type: "good" | "bad" | "warn" }> = [];

  if (novaGroup === 4) {
    highlights.push({
      icon: <AlertTriangle className="h-3 w-3" />,
      text: "Ultra-processed (NOVA 4)",
      type: "bad",
    });
  } else if (novaGroup === 1) {
    highlights.push({
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: "Minimally processed (NOVA 1)",
      type: "good",
    });
  }

  if (nutrition.sugar > 15) {
    highlights.push({
      icon: <AlertTriangle className="h-3 w-3" />,
      text: `High sugar: ${nutrition.sugar.toFixed(1)}g`,
      type: "bad",
    });
  }

  if (nutrition.saturated_fat > 5) {
    highlights.push({
      icon: <AlertTriangle className="h-3 w-3" />,
      text: `High sat fat: ${nutrition.saturated_fat.toFixed(1)}g`,
      type: "bad",
    });
  }

  if (nutrition.sodium > 0.5) {
    highlights.push({
      icon: <AlertTriangle className="h-3 w-3" />,
      text: `High sodium: ${(nutrition.sodium * 1000).toFixed(0)}mg`,
      type: "warn",
    });
  }

  if (nutrition.fiber > 5) {
    highlights.push({
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: `Good fiber: ${nutrition.fiber.toFixed(1)}g`,
      type: "good",
    });
  }

  if (nutrition.protein > 10) {
    highlights.push({
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: `High protein: ${nutrition.protein.toFixed(1)}g`,
      type: "good",
    });
  }

  if (additiveCount > 5) {
    highlights.push({
      icon: <XCircle className="h-3 w-3" />,
      text: `${additiveCount} additives`,
      type: "bad",
    });
  }

  const HIGHLIGHT_STYLES = {
    good: "text-primary-400 bg-primary-500/8 border-primary-500/10",
    bad: "text-danger-400 bg-danger-500/8 border-danger-500/10",
    warn: "text-accent-400 bg-accent-500/8 border-accent-500/10",
  };

  return (
    <div className="glass-card p-4 space-y-3">
      {/* Main Verdict */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${info.color}10`, color: info.color }}
        >
          {healthScore >= 61 ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark-50 mb-1">
            AI Verdict
          </p>
          <p className="text-xs text-dark-300 leading-relaxed">
            {aiVerdict}
          </p>
        </div>
      </div>

      {/* Allergen Warning */}
      {matchedAllergens.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-danger-500/8 border border-danger-500/12 p-3">
          <AlertTriangle className="h-4 w-4 text-danger-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-danger-300">
              Allergen Alert!
            </p>
            <p className="text-[10px] text-danger-400/80 mt-0.5">
              Contains ingredients matching your allergens:{" "}
              {matchedAllergens.map((a) => a.replace(/en:/g, "")).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {highlights.map((h, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                HIGHLIGHT_STYLES[h.type]
              }`}
            >
              {h.icon}
              {h.text}
            </span>
          ))}
        </div>
      )}

      {/* Dietary Compatibility */}
      {dietaryPref && (
        <div className="flex items-center gap-2 text-[10px] text-dark-500 pt-1">
          <Info className="h-3 w-3" />
          <span>
            Based on your {dietaryPref} dietary preference
          </span>
        </div>
      )}
    </div>
  );
}
