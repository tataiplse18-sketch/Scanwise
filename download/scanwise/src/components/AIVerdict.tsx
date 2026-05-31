"use client";

import { getHealthScoreInfo } from "@/types";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface AIVerdictProps {
  healthScore: number;
  aiVerdict: string;
  allergens: string[];
  dietaryPref?: string | null;
  userAllergens?: string[];
  novaGroup?: number;
}

export default function AIVerdict({
  healthScore,
  aiVerdict,
  allergens,
  dietaryPref,
  userAllergens = [],
  novaGroup,
}: AIVerdictProps) {
  const info = getHealthScoreInfo(healthScore);

  // Determine verdict level
  let verdictLevel: "avoid" | "moderate" | "good" | "excellent";
  let verdictLabel: string;
  let verdictColor: string;
  let verdictBg: string;
  let VerdictIcon: typeof Shield;

  if (healthScore < 30) {
    verdictLevel = "avoid";
    verdictLabel = "Avoid";
    verdictColor = "text-danger-400";
    verdictBg = "bg-danger-500/10 border-danger-500/20";
    VerdictIcon = XCircle;
  } else if (healthScore < 60) {
    verdictLevel = "moderate";
    verdictLabel = "Moderate";
    verdictColor = "text-accent-400";
    verdictBg = "bg-accent-500/10 border-accent-500/20";
    VerdictIcon = AlertTriangle;
  } else if (healthScore < 80) {
    verdictLevel = "good";
    verdictLabel = "Good Choice";
    verdictColor = "text-primary-400";
    verdictBg = "bg-primary-500/10 border-primary-500/20";
    VerdictIcon = CheckCircle;
  } else {
    verdictLevel = "excellent";
    verdictLabel = "Excellent";
    verdictColor = "text-primary-300";
    verdictBg = "bg-primary-500/15 border-primary-400/30";
    VerdictIcon = Shield;
  }

  // Generate personalized advice
  const advice: string[] = [];

  // Check allergens against user profile
  const matchedAllergens = allergens.filter((a) =>
    userAllergens.some((ua) => a.toLowerCase().includes(ua.toLowerCase()))
  );
  if (matchedAllergens.length > 0) {
    advice.push(
      `⚠️ Contains ${matchedAllergens.join(", ")} — which matches your allergen profile. Avoid this product.`
    );
  }

  // Dietary preference check
  if (dietaryPref === "vegetarian" || dietaryPref === "vegan") {
    const nonVegKeywords = ["meat", "chicken", "beef", "pork", "fish", "gelatin", "rennet"];
    const found = allergens.filter((a) =>
      nonVegKeywords.some((k) => a.toLowerCase().includes(k))
    );
    if (found.length > 0) {
      advice.push(
        `🥬 This product contains ${found.join(", ")} — not suitable for your ${dietaryPref} diet.`
      );
    }
  }

  // NOVA group advice
  if (novaGroup === 4) {
    advice.push(
      "🔬 Ultra-processed food (NOVA 4) — high in additives, preservatives, and artificial ingredients. Limit consumption."
    );
  } else if (novaGroup === 3 && verdictLevel !== "good" && verdictLevel !== "excellent") {
    advice.push(
      "🧪 Processed food (NOVA 3) — check the ingredient list for hidden sugars and sodium."
    );
  }

  // General advice based on score
  if (verdictLevel === "avoid") {
    advice.push("💡 Consider looking for a healthier alternative with fewer additives and lower sugar content.");
  } else if (verdictLevel === "excellent") {
    advice.push("✅ Great pick! This product has clean ingredients and strong nutritional value.");
  } else if (advice.length === 0) {
    advice.push("💡 Check the full ingredient list for any items that may not align with your health goals.");
  }

  return (
    <div className={`rounded-2xl border p-4 ${verdictBg}`}>
      {/* Verdict Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`animate-pulse ${verdictColor}`}>
          <VerdictIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-dark-50">AI Verdict</h3>
          <span className={`text-lg font-extrabold ${verdictColor}`}>{verdictLabel}</span>
        </div>
        <div className="ml-auto">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{
              backgroundColor: `${info.color}20`,
              color: info.color,
            }}
          >
            {healthScore}/100
          </span>
        </div>
      </div>

      {/* Verdict Text */}
      <p className="text-sm text-dark-300 leading-relaxed mb-3">
        {aiVerdict || info.description}
      </p>

      {/* Personalized Advice */}
      {advice.length > 0 && (
        <div className="space-y-2 border-t border-dark-700/50 pt-3">
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
            Personalized Advice
          </p>
          {advice.map((tip, i) => (
            <p key={i} className="text-xs text-dark-300 leading-relaxed">
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
