"use client";

// ============================================================
// ScanWise - AI Verdict Component
// ============================================================
// Displays the AI-generated verdict for a scanned product,
// including allergen warnings, dietary compatibility,
// and nutritional highlights.
// ============================================================

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

  // NOVA group warning
  if (novaGroup === 4) {
    highlights.push({
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      text: "Ultra-processed food (NOVA 4)",
      type: "bad",
    });
  } else if (novaGroup === 1) {
    highlights.push({
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      text: "Minimally processed (NOVA 1)",
      type: "good",
    });
  }

  // High sugar
  if (nutrition.sugar > 15) {
    highlights.push({
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      text: `High sugar: ${nutrition.sugar.toFixed(1)}g per 100g`,
      type: "bad",
    });
  }

  // High saturated fat
  if (nutrition.saturated_fat > 5) {
    highlights.push({
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      text: `High saturated fat: ${nutrition.saturated_fat.toFixed(1)}g per 100g`,
      type: "bad",
    });
  }

  // High sodium
  if (nutrition.sodium > 0.5) {
    highlights.push({
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      text: `High sodium: ${(nutrition.sodium * 1000).toFixed(0)}mg per 100g`,
      type: "warn",
    });
  }

  // Good fiber
  if (nutrition.fiber > 5) {
    highlights.push({
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      text: `Good fiber: ${nutrition.fiber.toFixed(1)}g per 100g`,
      type: "good",
    });
  }

  // Good protein
  if (nutrition.protein > 10) {
    highlights.push({
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      text: `High protein: ${nutrition.protein.toFixed(1)}g per 100g`,
      type: "good",
    });
  }

  // Many additives
  if (additiveCount > 5) {
    highlights.push({
      icon: <XCircle className="h-3.5 w-3.5" />,
      text: `${additiveCount} additives detected`,
      type: "bad",
    });
  }

  const HIGHLIGHT_STYLES = {
    good: "text-primary-400 bg-primary-500/10",
    bad: "text-danger-400 bg-danger-500/10",
    warn: "text-accent-400 bg-accent-500/10",
  };

  return (
    <div className="glass-card p-4 space-y-3">
      {/* Main Verdict */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: `${info.color}15`, color: info.color }}
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
        <div className="flex items-start gap-2 rounded-xl bg-danger-500/10 border border-danger-500/20 p-3">
          <AlertTriangle className="h-4 w-4 text-danger-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-danger-300">
              Allergen Alert!
            </p>
            <p className="text-[10px] text-danger-400/80 mt-0.5">
              This product contains ingredients matching your allergens:{" "}
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
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
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
        <div className="flex items-center gap-2 text-[10px] text-dark-500">
          <Info className="h-3 w-3" />
          <span>
            Based on your {dietaryPref} dietary preference
          </span>
        </div>
      )}
    </div>
  );
}
