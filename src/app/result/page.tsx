"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Heart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Leaf,
  Flame,
  Share2,
  RotateCcw,
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import type {
  NutritionInfo,
  IngredientRisk,
  IngredientRiskLevel,
  NovaGroup,
  HealthScoreLabel,
  ScanResult,
} from "@/types";
import {
  getHealthScoreInfo,
  NOVA_GROUP_LABELS,
  NOVA_GROUP_COLORS,
} from "@/types";

// ============================================================
// Types for Open Food Facts API response
// ============================================================

interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  categories?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    "saturated-fat_100g"?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    salt_100g?: number;
  };
  ingredients_text?: string;
  additives_tags?: string[];
  allergens_tags?: string[];
  nova_group?: number;
  nutriscore_grade?: string;
}

interface OFFResponse {
  status: number;
  status_verbose?: string;
  product?: OFFProduct;
}

// ============================================================
// Health Score Calculation
// ============================================================

function calculateHealthScore(product: OFFProduct): {
  score: number;
  nutrition: NutritionInfo;
  ingredients: IngredientRisk[];
  allergens: string[];
  novaGroup: NovaGroup;
  riskLevel: HealthScoreLabel;
  aiVerdict: string;
  alternatives: string[];
} {
  const nutriments = product.nutriments || {};
  const novaGroup = (product.nova_group || 1) as NovaGroup;

  // Build nutrition info
  const nutrition: NutritionInfo = {
    calories: Math.round(nutriments["energy-kcal_100g"] || 0),
    protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
    carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
    sugar: Math.round((nutriments.sugars_100g || 0) * 10) / 10,
    fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
    saturated_fat: Math.round((nutriments["saturated-fat_100g"] || 0) * 10) / 10,
    fiber: Math.round((nutriments.fiber_100g || 0) * 10) / 10,
    sodium: Math.round((nutriments.sodium_100g || 0) * 10) / 10,
  };

  // Calculate score starting from base 70
  let score = 70;

  // Deductions
  if (nutrition.sugar > 15) score -= 10;
  if (nutrition.sodium > 400) score -= 10;
  if (nutrition.saturated_fat > 5) score -= 10;

  const additiveCount = product.additives_tags?.length || 0;
  if (additiveCount > 3) {
    score -= (additiveCount - 3) * 5;
  }

  if (novaGroup === 4) score -= 15;
  if (novaGroup === 3) score -= 8;

  // Additions
  if (nutrition.fiber > 5) score += 5;
  if (nutrition.protein > 10) score += 5;
  if (nutrition.sugar < 5) score += 5;

  // Clamp between 0-100
  score = Math.min(Math.max(score, 0), 100);

  const riskLevel: HealthScoreLabel =
    score <= 30 ? "poor" : score <= 60 ? "fair" : score <= 80 ? "good" : "great";

  // Classify ingredients
  const ingredients = classifyIngredients(product);

  // Allergens
  const allergens = (product.allergens_tags || []).map((tag) =>
    tag.replace("en:", "").replace(/-/g, " ")
  );

  // AI Verdict
  const aiVerdict = generateVerdict(product, score, riskLevel, novaGroup, nutrition);

  // Alternatives
  const alternatives = generateAlternatives(product);

  return {
    score,
    nutrition,
    ingredients,
    allergens,
    novaGroup,
    riskLevel,
    aiVerdict,
    alternatives,
  };
}

function classifyIngredients(product: OFFProduct): IngredientRisk[] {
  const ingredients: IngredientRisk[] = [];
  const additives = product.additives_tags || [];
  const ingredientsText = product.ingredients_text || "";

  // Classify additives as high risk
  additives.slice(0, 10).forEach((additive) => {
    const name = additive.replace("en:", "").toUpperCase();
    ingredients.push({
      name,
      risk_level: "high",
      explanation: `${name} is a food additive commonly found in ultra-processed foods. Regular consumption should be limited.`,
    });
  });

  // Check for moderate risk items in ingredients text
  const moderateKeywords = [
    { keyword: "sugar", name: "Added Sugar", explanation: "High added sugar content is linked to obesity, diabetes, and other health issues." },
    { keyword: "palm oil", name: "Palm Oil", explanation: "Palm oil is high in saturated fat and its production has environmental concerns." },
    { keyword: "salt", name: "Excess Salt", explanation: "High sodium intake can lead to hypertension and cardiovascular problems." },
    { keyword: "corn syrup", name: "Corn Syrup", explanation: "High-fructose corn syrup is a refined sweetener linked to metabolic issues." },
    { keyword: "hydrogenated", name: "Hydrogenated Fat", explanation: "Hydrogenated fats contain trans fats which are harmful to heart health." },
  ];

  const lowerText = ingredientsText.toLowerCase();
  moderateKeywords.forEach(({ keyword, name, explanation }) => {
    if (lowerText.includes(keyword)) {
      ingredients.push({ name, risk_level: "moderate", explanation });
    }
  });

  // Add safe items if we found natural ingredients
  const safeKeywords = [
    { keyword: "water", name: "Water" },
    { keyword: "milk", name: "Milk" },
    { keyword: "wheat", name: "Wheat Flour" },
    { keyword: "rice", name: "Rice" },
    { keyword: "oat", name: "Oats" },
    { keyword: "fruit", name: "Fruit" },
    { keyword: "vegetable", name: "Vegetables" },
  ];

  safeKeywords.forEach(({ keyword, name }) => {
    if (lowerText.includes(keyword) && ingredients.length < 15) {
      ingredients.push({
        name,
        risk_level: "safe",
        explanation: `${name} is a natural ingredient with no known health concerns.`,
      });
    }
  });

  // If no ingredients were found, add a generic entry
  if (ingredients.length === 0) {
    ingredients.push({
      name: "Ingredient data unavailable",
      risk_level: "moderate",
      explanation: "Detailed ingredient information is not available for this product.",
    });
  }

  return ingredients;
}

function generateVerdict(
  product: OFFProduct,
  score: number,
  riskLevel: HealthScoreLabel,
  novaGroup: NovaGroup,
  nutrition: NutritionInfo
): string {
  const name = product.product_name || "This product";
  const parts: string[] = [];

  parts.push(`${name} has a health score of ${score}/100, which rates as "${riskLevel}".`);

  if (novaGroup === 4) {
    parts.push("It is classified as ultra-processed (NOVA Group 4), meaning it undergoes significant industrial processing.");
  } else if (novaGroup === 3) {
    parts.push("It is a processed food (NOVA Group 3) with some industrial modifications.");
  }

  if (nutrition.sugar > 15) {
    parts.push(`It contains high sugar (${nutrition.sugar}g per 100g).`);
  }
  if (nutrition.saturated_fat > 5) {
    parts.push(`It has notable saturated fat content (${nutrition.saturated_fat}g per 100g).`);
  }
  if (nutrition.sodium > 400) {
    parts.push(`Sodium levels are elevated (${nutrition.sodium}mg per 100g).`);
  }

  if (score >= 61) {
    parts.push("Overall, this is a reasonable choice with some nutritional value.");
  } else if (score >= 31) {
    parts.push("Consider consuming this in moderation and look for healthier alternatives.");
  } else {
    parts.push("We recommend seeking healthier alternatives due to the high level of processing and concerning nutritional profile.");
  }

  return parts.join(" ");
}

function generateAlternatives(product: OFFProduct): string[] {
  const categories = (product.categories || "").toLowerCase();

  if (categories.includes("soda") || categories.includes("drink") || categories.includes("beverage")) {
    return ["Sparkling Water with Lemon", "Unsweetened Iced Tea", "Fresh Fruit Juice"];
  }
  if (categories.includes("chip") || categories.includes("snack") || categories.includes("crisp")) {
    return ["Baked Vegetable Chips", "Trail Mix (No Added Sugar)", "Roasted Chickpeas"];
  }
  if (categories.includes("cereal") || categories.includes("breakfast")) {
    return ["Steel-Cut Oatmeal", "Granola with Low Sugar", "Greek Yogurt with Berries"];
  }
  if (categories.includes("chocolate") || categories.includes("candy") || categories.includes("sweet")) {
    return ["Dark Chocolate (70%+ Cocoa)", "Fresh Fruit", "Date-Sweetened Energy Bites"];
  }
  if (categories.includes("bread") || categories.includes("bake")) {
    return ["Whole Grain Bread", "Sourdough Bread", "Sprouted Grain Bread"];
  }
  if (categories.includes("sauce") || categories.includes("condiment")) {
    return ["Homemade Tomato Sauce", "Olive Oil & Vinegar Dressing", "Avocado-Based Sauce"];
  }

  return ["Fresh Whole Food Alternative", "Minimally Processed Option", "Homemade Version"];
}

// ============================================================
// Skeleton Loader Component
// ============================================================

function ResultSkeleton() {
  return (
    <div className="min-h-screen bg-dark-900 animate-pulse">
      <header className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
        <div className="h-9 w-9 rounded-xl bg-dark-700" />
        <div className="h-4 w-24 rounded bg-dark-700" />
        <div className="h-9 w-9 rounded-xl bg-dark-700" />
      </header>
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-dark-700" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-3/4 rounded bg-dark-700" />
            <div className="h-4 w-1/2 rounded bg-dark-700" />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="h-40 w-40 rounded-full bg-dark-700" />
        </div>
        <div className="h-20 rounded-2xl bg-dark-700" />
        <div className="h-40 rounded-2xl bg-dark-700" />
        <div className="h-32 rounded-2xl bg-dark-700" />
      </div>
    </div>
  );
}

// ============================================================
// Main Result Content Component
// ============================================================

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<OFFProduct | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateHealthScore> | null>(null);
  const [saved, setSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ingredients: true,
    nutrition: true,
    nova: true,
    allergens: true,
    alternatives: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchProduct = useCallback(async () => {
    if (!barcode) {
      setError("No barcode provided. Please scan a product first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch product data. Please try again.");
      }

      const data: OFFResponse = await res.json();

      if (data.status === 0 || !data.product) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const productData = data.product;
      setProduct(productData);

      const analysis = calculateHealthScore(productData);
      setResult(analysis);

      // Save scan to Supabase
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from("scans").insert({
            user_id: user.id,
            barcode: productData.code,
            health_score: analysis.score,
            risk_level: analysis.riskLevel,
            nutrition: analysis.nutrition,
            ingredients: analysis.ingredients,
            allergens: analysis.allergens,
            nova_group: analysis.novaGroup,
            alternatives: analysis.alternatives,
            ai_verdict: analysis.aiVerdict,
          });
          setSaved(true);
        }
      } catch {
        // Non-critical: scan saved locally even if Supabase fails
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [barcode, supabase.auth]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleShare = async () => {
    if (!product || !result) return;

    const shareText = `${product.product_name || "Product"} — Health Score: ${result.score}/100 (${result.riskLevel}). ${result.aiVerdict}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ScanWise: ${product.product_name || "Product"}`,
          text: shareText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Result copied to clipboard!");
    }
  };

  // ===== Loading State =====
  if (loading) {
    return <ResultSkeleton />;
  }

  // ===== Error State =====
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
          <button
            onClick={() => router.push("/scan")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-dark-200">Result</span>
          <div className="w-9" />
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card p-8 text-center max-w-sm w-full">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-500/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-danger-400" />
            </div>
            <h2 className="text-lg font-semibold text-dark-50 mb-2">
              Something went wrong
            </h2>
            <p className="text-dark-400 text-sm mb-6">{error}</p>
            <button
              onClick={fetchProduct}
              className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Product Not Found =====
  if (!product || !result) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
          <button
            onClick={() => router.push("/scan")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-dark-200">Result</span>
          <div className="w-9" />
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card p-8 text-center max-w-sm w-full">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dark-700 mb-4">
              <ShoppingCart className="h-8 w-8 text-dark-500" />
            </div>
            <h2 className="text-lg font-semibold text-dark-50 mb-2">
              Product not found
            </h2>
            <p className="text-dark-400 text-sm mb-2">
              Barcode <span className="text-dark-200 font-mono">{barcode}</span> was not found in the database.
            </p>
            <p className="text-dark-500 text-xs mb-6">
              This product may not be in Open Food Facts yet.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/scan")}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Scan Again
              </button>
              <a
                href={`https://world.openfoodfacts.org/cgi/product.pl?code=${barcode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-dark-800 hover:bg-dark-700 text-dark-300 font-medium py-3 rounded-xl transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Add to Open Food Facts
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== Full Result Display =====
  const scoreInfo = getHealthScoreInfo(result.score);
  const circumference = 2 * Math.PI * 58;
  const scoreOffset = circumference - (result.score / 100) * circumference;

  const safeIngredients = result.ingredients.filter((i) => i.risk_level === "safe");
  const moderateIngredients = result.ingredients.filter((i) => i.risk_level === "moderate");
  const highIngredients = result.ingredients.filter((i) => i.risk_level === "high");

  return (
    <div className="min-h-screen bg-dark-900 pb-safe">
      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <button
          onClick={() => router.push("/home")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-dark-200">Scan Result</span>
        <button
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* ===== 1. Product Header ===== */}
        <section className="flex items-center gap-4">
          {product.image_front_url || product.image_url ? (
            <img
              src={product.image_front_url || product.image_url}
              alt={product.product_name || "Product"}
              className="h-20 w-20 rounded-2xl object-cover border border-dark-700"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-dark-800 border border-dark-700">
              <Package className="h-8 w-8 text-dark-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-dark-50 truncate">
              {product.product_name || "Unknown Product"}
            </h1>
            <p className="text-sm text-dark-400 truncate">
              {product.brands || "Unknown Brand"}
            </p>
            <p className="text-xs text-dark-600 font-mono mt-1">
              {barcode}
            </p>
          </div>
        </section>

        {/* ===== 2. Health Score Circle ===== */}
        <section className="flex flex-col items-center py-4">
          <div className="relative">
            <svg width="140" height="140" className="-rotate-90">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r="58"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-dark-800"
              />
              {/* Score circle with animation */}
              <circle
                cx="70"
                cy="70"
                r="58"
                fill="none"
                stroke={scoreInfo.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={scoreOffset}
                className="score-ring"
                style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-3xl font-bold"
                style={{ color: scoreInfo.color }}
              >
                {result.score}
              </span>
              <span className="text-xs text-dark-400">/100</span>
            </div>
          </div>
          <p
            className="mt-3 text-lg font-semibold capitalize"
            style={{ color: scoreInfo.color }}
          >
            {result.riskLevel}
          </p>
          <p className="text-xs text-dark-500 text-center max-w-xs mt-1">
            {scoreInfo.description}
          </p>
        </section>

        {/* ===== 3. Risk Level Badge ===== */}
        <div className="flex justify-center">
          <span
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              result.riskLevel === "poor" && "bg-danger-500/15 text-danger-400",
              result.riskLevel === "fair" && "bg-accent-500/15 text-accent-400",
              result.riskLevel === "good" && "bg-primary-500/15 text-primary-400",
              result.riskLevel === "great" && "bg-primary-500/15 text-primary-300"
            )}
          >
            {result.riskLevel === "poor" && "🔴 High Risk"}
            {result.riskLevel === "fair" && "🟡 Moderate Risk"}
            {result.riskLevel === "good" && "🟢 Low Risk"}
            {result.riskLevel === "great" && "🟢 Minimal Risk"}
          </span>
        </div>

        {/* ===== 4. AI Verdict ===== */}
        <section className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-dark-200">AI Verdict</h3>
          </div>
          <p className="text-dark-300 text-sm leading-relaxed">
            {result.aiVerdict}
          </p>
        </section>

        {/* ===== 5. Ingredient Risk Breakdown ===== */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("ingredients")}
            className="flex w-full items-center justify-between p-5"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-dark-200">
                Ingredients Analysis
              </h3>
            </div>
            {expandedSections.ingredients ? (
              <ChevronUp className="h-4 w-4 text-dark-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-dark-500" />
            )}
          </button>

          {expandedSections.ingredients && (
            <div className="px-5 pb-5 space-y-4">
              {/* High Risk */}
              {highIngredients.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-danger-400 mb-2 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> High Risk ({highIngredients.length})
                  </p>
                  <div className="space-y-2">
                    {highIngredients.map((ing, i) => (
                      <div
                        key={`high-${i}`}
                        className="rounded-xl bg-danger-500/5 border border-danger-500/10 p-3"
                      >
                        <p className="text-sm font-medium text-dark-200">
                          {ing.name}
                        </p>
                        <p className="text-xs text-dark-500 mt-1">
                          {ing.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderate Risk */}
              {moderateIngredients.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-accent-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Moderate Risk ({moderateIngredients.length})
                  </p>
                  <div className="space-y-2">
                    {moderateIngredients.map((ing, i) => (
                      <div
                        key={`mod-${i}`}
                        className="rounded-xl bg-accent-500/5 border border-accent-500/10 p-3"
                      >
                        <p className="text-sm font-medium text-dark-200">
                          {ing.name}
                        </p>
                        <p className="text-xs text-dark-500 mt-1">
                          {ing.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe */}
              {safeIngredients.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-primary-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Safe ({safeIngredients.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {safeIngredients.map((ing, i) => (
                      <span
                        key={`safe-${i}`}
                        className="badge-safe"
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ===== 6. Nutrition Facts ===== */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("nutrition")}
            className="flex w-full items-center justify-between p-5"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-dark-200">
                Nutrition Facts
              </h3>
              <span className="text-xs text-dark-500">per 100g</span>
            </div>
            {expandedSections.nutrition ? (
              <ChevronUp className="h-4 w-4 text-dark-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-dark-500" />
            )}
          </button>

          {expandedSections.nutrition && (
            <div className="px-5 pb-5">
              <div className="space-y-3">
                {[
                  { label: "Calories", value: `${result.nutrition.calories}`, unit: "kcal", highlight: result.nutrition.calories > 350 },
                  { label: "Protein", value: `${result.nutrition.protein}`, unit: "g", highlight: result.nutrition.protein > 10 },
                  { label: "Carbs", value: `${result.nutrition.carbs}`, unit: "g", highlight: false },
                  { label: "Sugar", value: `${result.nutrition.sugar}`, unit: "g", highlight: result.nutrition.sugar > 15 },
                  { label: "Fat", value: `${result.nutrition.fat}`, unit: "g", highlight: false },
                  { label: "Saturated Fat", value: `${result.nutrition.saturated_fat}`, unit: "g", highlight: result.nutrition.saturated_fat > 5 },
                  { label: "Fiber", value: `${result.nutrition.fiber}`, unit: "g", highlight: result.nutrition.fiber > 5 },
                  { label: "Sodium", value: `${result.nutrition.sodium}`, unit: "mg", highlight: result.nutrition.sodium > 400 },
                ].map(({ label, value, unit, highlight }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b border-dark-800 last:border-0"
                  >
                    <span className="text-sm text-dark-300">{label}</span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        highlight ? "text-danger-400" : "text-dark-100"
                      )}
                    >
                      {value} {unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===== 7. NOVA Processing Level ===== */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("nova")}
            className="flex w-full items-center justify-between p-5"
          >
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-dark-200">
                NOVA Processing Level
              </h3>
            </div>
            {expandedSections.nova ? (
              <ChevronUp className="h-4 w-4 text-dark-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-dark-500" />
            )}
          </button>

          {expandedSections.nova && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold"
                  style={{
                    backgroundColor: `${NOVA_GROUP_COLORS[result.novaGroup]}15`,
                    color: NOVA_GROUP_COLORS[result.novaGroup],
                  }}
                >
                  {result.novaGroup}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: NOVA_GROUP_COLORS[result.novaGroup] }}
                  >
                    Group {result.novaGroup}
                  </p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {NOVA_GROUP_LABELS[result.novaGroup]}
                  </p>
                </div>
              </div>
              {/* NOVA scale bar */}
              <div className="flex gap-1 h-2">
                {[1, 2, 3, 4].map((group) => (
                  <div
                    key={group}
                    className={cn(
                      "flex-1 rounded-full transition-all",
                      group === result.novaGroup
                        ? "opacity-100"
                        : "opacity-20"
                    )}
                    style={{ backgroundColor: NOVA_GROUP_COLORS[group as NovaGroup] }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-dark-600">Unprocessed</span>
                <span className="text-[10px] text-dark-600">Ultra-processed</span>
              </div>
            </div>
          )}
        </section>

        {/* ===== 8. Allergen Alerts ===== */}
        {result.allergens.length > 0 && (
          <section className="glass-card overflow-hidden">
            <button
              onClick={() => toggleSection("allergens")}
              className="flex w-full items-center justify-between p-5"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-accent-400" />
                <h3 className="text-sm font-semibold text-dark-200">
                  Allergen Alerts
                </h3>
                <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-xs font-medium text-accent-400">
                  {result.allergens.length}
                </span>
              </div>
              {expandedSections.allergens ? (
                <ChevronUp className="h-4 w-4 text-dark-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-dark-500" />
              )}
            </button>

            {expandedSections.allergens && (
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-2">
                  {result.allergens.map((allergen, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500/10 border border-accent-500/20 px-3 py-1.5 text-sm font-medium text-accent-400"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===== 9. Safer Alternatives ===== */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("alternatives")}
            className="flex w-full items-center justify-between p-5"
          >
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-dark-200">
                Safer Alternatives
              </h3>
            </div>
            {expandedSections.alternatives ? (
              <ChevronUp className="h-4 w-4 text-dark-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-dark-500" />
            )}
          </button>

          {expandedSections.alternatives && (
            <div className="px-5 pb-5 space-y-2">
              {result.alternatives.map((alt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-primary-500/5 border border-primary-500/10 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 text-sm font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm text-dark-200">{alt}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== Action Buttons ===== */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share Result
          </button>
          <button
            onClick={() => router.push("/scan")}
            className="flex items-center justify-center gap-2 w-full bg-dark-800 hover:bg-dark-700 text-dark-300 font-medium py-3 rounded-xl transition-colors"
          >
            Scan Another Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Export with Suspense boundary for useSearchParams
// ============================================================

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <ResultContent />
    </Suspense>
  );
}
