// ============================================================
// ScanWise - Complete TypeScript Type Definitions
// ============================================================

/**
 * Represents an authenticated user in the system.
 * Synced with the Supabase auth.users table and extended profile.
 */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  free_scans_remaining: number;
  is_premium: boolean;
}

/**
 * Represents a food product looked up by barcode.
 * Data sourced from Open Food Facts and enriched by ScanWise.
 */
export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

/**
 * Nutrition information per 100g serving.
 * All values are in standard units (g for macros, mg for sodium).
 */
export interface NutritionInfo {
  calories: number;     // kcal per 100g
  protein: number;      // g per 100g
  carbs: number;        // g per 100g
  sugar: number;        // g per 100g
  fat: number;          // g per 100g
  saturated_fat: number; // g per 100g
  fiber: number;        // g per 100g
  sodium: number;       // mg per 100g
}

/**
 * Risk level for an individual ingredient.
 * - "safe": No known health concerns
 * - "moderate": Some concerns for sensitive individuals or in excess
 * - "high": Known health risks, additives to avoid
 */
export type IngredientRiskLevel = "safe" | "moderate" | "high";

/**
 * Represents a single ingredient with its associated risk assessment.
 */
export interface IngredientRisk {
  name: string;
  risk_level: IngredientRiskLevel;
  explanation: string;
}

/**
 * NOVA food processing classification group.
 * - 1: Unprocessed or minimally processed foods
 * - 2: Processed culinary ingredients
 * - 3: Processed foods
 * - 4: Ultra-processed food and drink products
 */
export type NovaGroup = 1 | 2 | 3 | 4;

/**
 * Overall health score risk level label.
 * Categorized based on the 0-100 health score range.
 */
export type HealthScoreLabel = "poor" | "fair" | "good" | "great";

/**
 * Complete result of a barcode scan, including all analysis data.
 * This is the primary data structure returned after scanning a product.
 */
export interface ScanResult {
  id: string;
  user_id: string;
  product_id: string;
  barcode: string;
  /** Health score from 0-100, computed from nutrition, ingredients, and NOVA group */
  health_score: number;
  /** Categorical label derived from health_score */
  risk_level: HealthScoreLabel;
  /** Detailed nutrition breakdown per 100g */
  nutrition: NutritionInfo;
  /** List of ingredients with individual risk assessments */
  ingredients: IngredientRisk[];
  /** List of detected allergens (e.g., "peanuts", "dairy", "gluten") */
  allergens: string[];
  /** NOVA food processing classification (1-4) */
  nova_group: NovaGroup;
  /** Suggested healthier alternative product names */
  alternatives: string[];
  /** AI-generated plain-language summary verdict of the product */
  ai_verdict: string;
  /** ISO 8601 timestamp of when the scan was performed */
  scanned_at: string;
}

// ============================================================
// Health Score Label Utility
// ============================================================

/**
 * Mapping of health score ranges to their categorical labels.
 * Used to convert a numeric score (0-100) into a human-readable label.
 */
export const HEALTH_SCORE_RANGES: {
  label: HealthScoreLabel;
  min: number;
  max: number;
  color: string;
  description: string;
}[] = [
  {
    label: "poor",
    min: 0,
    max: 30,
    color: "#ef4444",
    description: "Highly processed with concerning ingredients. Consider healthier alternatives.",
  },
  {
    label: "fair",
    min: 31,
    max: 60,
    color: "#f59e0b",
    description: "Moderate nutritional quality. Some ingredients may be concerning.",
  },
  {
    label: "good",
    min: 61,
    max: 80,
    color: "#22c55e",
    description: "Good nutritional profile with minor areas for improvement.",
  },
  {
    label: "great",
    min: 81,
    max: 100,
    color: "#10b981",
    description: "Excellent choice! Clean ingredients and strong nutritional value.",
  },
];

/**
 * Returns the health score label for a given numeric score.
 */
export function getHealthScoreLabel(score: number): HealthScoreLabel {
  const clamped = Math.min(Math.max(score, 0), 100);
  const range = HEALTH_SCORE_RANGES.find(
    (r) => clamped >= r.min && clamped <= r.max
  );
  return range?.label ?? "fair";
}

/**
 * Returns the full health score range info for a given numeric score.
 */
export function getHealthScoreInfo(score: number) {
  const clamped = Math.min(Math.max(score, 0), 100);
  return (
    HEALTH_SCORE_RANGES.find((r) => clamped >= r.min && clamped <= r.max) ??
    HEALTH_SCORE_RANGES[1]
  );
}

// ============================================================
// Nova Group Utility
// ============================================================

/**
 * Human-readable descriptions for NOVA classification groups.
 */
export const NOVA_GROUP_LABELS: Record<NovaGroup, string> = {
  1: "Unprocessed or minimally processed",
  2: "Processed culinary ingredients",
  3: "Processed foods",
  4: "Ultra-processed food and drink products",
};

export const NOVA_GROUP_COLORS: Record<NovaGroup, string> = {
  1: "#10b981",
  2: "#22c55e",
  3: "#f59e0b",
  4: "#ef4444",
};
