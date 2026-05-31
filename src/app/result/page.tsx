"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import HealthScoreCircle from "@/components/HealthScoreCircle";
import AIVerdict from "@/components/AIVerdict";
import ShareButton from "@/components/ShareButton";
import {
  ArrowLeft,
  AlertTriangle,
  Leaf,
  Flame,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Info,
} from "lucide-react";
import { showToast } from "@/components/Toast";
import { NOVA_GROUP_LABELS, NOVA_GROUP_COLORS, getHealthScoreInfo } from "@/types";
import type { ScanResult, NovaGroup, HealthScoreLabel } from "@/types";
import { checkAndUnlockAchievements, updateStreak } from "@/lib/achievements";
import { incrementShareCountAction, incrementCompareCountAction } from "@/app/auth-actions";

// ============================================================
// Healthy Alternatives Map
// ============================================================

const ALTERNATIVES_MAP: Record<string, Array<{ name: string; reason: string; estimatedScore: number }>> = {
  chips: [
    { name: "Makhana (Fox Nuts)", reason: "Low calorie, high protein snack", estimatedScore: 82 },
    { name: "Baked Namkeen", reason: "Less oil than fried options", estimatedScore: 68 },
    { name: "Roasted Chana", reason: "High fiber, high protein", estimatedScore: 85 },
  ],
  biscuit: [
    { name: "Oats Cookies", reason: "Whole grain, less sugar", estimatedScore: 72 },
    { name: "Digestive Biscuits", reason: "More fiber, less sweet", estimatedScore: 65 },
    { name: "Multigrain Cookies", reason: "Better nutrition profile", estimatedScore: 70 },
  ],
  noodle: [
    { name: "Oats Upma", reason: "Whole grain breakfast", estimatedScore: 80 },
    { name: "Vermicelli (Sevai)", reason: "Lighter, less processed", estimatedScore: 72 },
    { name: "Millets Pulao", reason: "High nutrition grain", estimatedScore: 83 },
  ],
  cola: [
    { name: "Nimbu Pani", reason: "Natural, no preservatives", estimatedScore: 88 },
    { name: "Coconut Water", reason: "Natural electrolytes", estimatedScore: 92 },
    { name: "Jaljeera", reason: "Aids digestion, zero sugar", estimatedScore: 90 },
  ],
  chocolate: [
    { name: "Dark Chocolate (70%+)", reason: "Antioxidants, less sugar", estimatedScore: 75 },
    { name: "Dates", reason: "Natural sweetness + iron", estimatedScore: 88 },
    { name: "Fig (Anjeer)", reason: "High fiber, natural sweet", estimatedScore: 85 },
  ],
  bread: [
    { name: "Whole Wheat Bread", reason: "More fiber and nutrients", estimatedScore: 72 },
    { name: "Multigrain Bread", reason: "Variety of grains, better nutrition", estimatedScore: 78 },
    { name: "Sourdough Bread", reason: "Better gut health", estimatedScore: 74 },
  ],
  juice: [
    { name: "Fresh Fruit", reason: "Whole fruit with fiber", estimatedScore: 85 },
    { name: "Vegetable Juice", reason: "Low sugar, high nutrients", estimatedScore: 88 },
    { name: "Coconut Water", reason: "Natural hydration", estimatedScore: 90 },
  ],
  ice_cream: [
    { name: "Greek Yogurt", reason: "High protein, probiotics", estimatedScore: 80 },
    { name: "Frozen Fruit Pops", reason: "Natural fruit, no added sugar", estimatedScore: 85 },
    { name: "Kulfi (Homemade)", reason: "Less processed, natural ingredients", estimatedScore: 72 },
  ],
  default: [
    { name: "Fresh Fruits", reason: "Natural vitamins and fiber", estimatedScore: 90 },
    { name: "Plain Curd (Dahi)", reason: "Probiotics, protein, calcium", estimatedScore: 88 },
    { name: "Makhana", reason: "Low calorie, high protein snack", estimatedScore: 82 },
  ],
};

function getAlternatives(productName: string): Array<{ name: string; reason: string; estimatedScore: number }> {
  const lower = productName.toLowerCase();
  for (const key of Object.keys(ALTERNATIVES_MAP)) {
    if (key !== "default" && lower.includes(key)) {
      return ALTERNATIVES_MAP[key];
    }
  }
  return ALTERNATIVES_MAP.default;
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("id");
  const barcodeParam = searchParams.get("barcode");

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [productName, setProductName] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [userAllergens, setUserAllergens] = useState<string[]>([]);
  const [dietaryPref, setDietaryPref] = useState<string | null>(null);
  const [compareSaved, setCompareSaved] = useState(false);

  useEffect(() => {
    async function loadResult() {
      if (!scanId && !barcodeParam) {
        router.push("/scan");
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }

        if (scanId) {
          // Load scan result from database by ID
          const { data: scanData } = await supabase
            .from("scans")
            .select("*")
            .eq("id", scanId)
            .eq("user_id", user.id)
            .single();

          if (scanData) {
            setScan(scanData as ScanResult);

            // Load product info
            const { data: productData } = await supabase
              .from("products")
              .select("name, brand, image_url")
              .eq("barcode", scanData.barcode)
              .single();

            if (productData) {
              setProductName(productData.name);
              setProductBrand(productData.brand || "");
              setProductImage(productData.image_url);
            }
          }
        } else if (barcodeParam) {
          // Fallback: fetch from Open Food Facts directly (no DB save)
          const response = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${barcodeParam}.json`
          );
          const data = await response.json();

          if (data.status === 1 && data.product) {
            const product = data.product;
            setProductName(product.product_name || "Unknown Product");
            setProductBrand(product.brands || "");
            setProductImage(product.image_url || null);

            // Build a scan-like object from the API data
            const nutriments = product.nutriments || {};
            const additives = product.additives_tags || [];
            const highRisk = ["e102", "e110", "e120", "e129", "e211", "e220", "e250", "e320", "e621", "e951"];
            const moderateRisk = ["e412", "e415", "e471", "e322", "e407"];

            const ingredientsList = additives.slice(0, 10).map((tag: string) => {
              const code = tag.replace("en:", "");
              let risk = "safe";
              if (highRisk.includes(code)) risk = "high";
              else if (moderateRisk.includes(code)) risk = "moderate";
              return {
                name: code.toUpperCase(),
                risk_level: risk,
                explanation: risk === "high" ? "Known health risk — try to avoid" : risk === "moderate" ? "Some concerns in excess" : "Generally safe",
              };
            });

            // Calculate health score
            let score = 70;
            const novaGroup = product.nova_group || 4;
            if (novaGroup === 4) score -= 25;
            else if (novaGroup === 3) score -= 15;
            else if (novaGroup === 2) score -= 5;
            const sugar = nutriments.sugars_100g || 0;
            if (sugar > 20) score -= 15;
            else if (sugar > 10) score -= 8;
            else if (sugar > 5) score -= 3;
            const satFat = nutriments["saturated-fat_100g"] || 0;
            if (satFat > 5) score -= 12;
            else if (satFat > 3) score -= 6;
            const sodium = nutriments.sodium_100g || 0;
            if (sodium > 0.5) score -= 10;
            else if (sodium > 0.3) score -= 5;
            if (additives.length > 5) score -= 10;
            else if (additives.length > 2) score -= 5;
            const fiber = nutriments.fiber_100g || 0;
            if (fiber > 5) score += 5;
            else if (fiber > 2) score += 3;
            const protein = nutriments.proteins_100g || 0;
            if (protein > 10) score += 5;
            else if (protein > 5) score += 2;
            score = Math.max(0, Math.min(100, score));

            let label: HealthScoreLabel;
            let verdict: string;
            if (score < 30) { label = "poor"; verdict = "This product is highly processed with concerning levels of sugar, sodium, or additives. Consider choosing a healthier alternative."; }
            else if (score < 60) { label = "fair"; verdict = "This product has moderate nutritional quality. Some ingredients may be concerning — consume in moderation."; }
            else if (score < 80) { label = "good"; verdict = "This is a reasonably good choice with a decent nutritional profile. Minor areas for improvement."; }
            else { label = "great"; verdict = "Excellent choice! This product has clean ingredients and strong nutritional value."; }

            const scanData = {
              id: "preview",
              user_id: user.id,
              product_id: "",
              barcode: barcodeParam,
              health_score: score,
              risk_level: label,
              nutrition: {
                calories: nutriments["energy-kcal_100g"] || 0,
                protein: nutriments.proteins_100g || 0,
                carbs: nutriments.carbohydrates_100g || 0,
                sugar: nutriments.sugars_100g || 0,
                fat: nutriments.fat_100g || 0,
                saturated_fat: nutriments["saturated-fat_100g"] || 0,
                fiber: nutriments.fiber_100g || 0,
                sodium: nutriments.sodium_100g || 0,
              },
              ingredients: ingredientsList,
              allergens: product.allergens_tags || [],
              nova_group: novaGroup,
              alternatives: [],
              ai_verdict: verdict,
              scanned_at: new Date().toISOString(),
            };

            setScan(scanData as ScanResult);
          }
        }

        // Load user profile for allergens and dietary pref
        const { data: profile } = await supabase
          .from("profiles")
          .select("allergens, dietary_pref")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserAllergens(profile.allergens || []);
          setDietaryPref(profile.dietary_pref);
        }

        // Check if already in comparison
        if (scanId) {
          const compareList = JSON.parse(localStorage.getItem("scanwise_compare") || "[]");
          if (compareList.some((item: any) => item.id === scanId)) {
            setCompareSaved(true);
          }
        }

        // Check achievements and update streak after scan
        if (user) {
          try {
            await updateStreak(user.id);
            const newUnlocks = await checkAndUnlockAchievements(user.id);
            if (newUnlocks.length > 0) {
              const first = newUnlocks[0];
              showToast({
                message: `${first.icon} Achievement Unlocked: ${first.title}!`,
                type: "success",
                duration: 4000,
              });
            }
          } catch {
            // Non-critical: achievement check failed silently
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [scanId, barcodeParam, router]);

  function handleCompare() {
    if (!scan) return;
    const compareList: any[] = JSON.parse(localStorage.getItem("scanwise_compare") || "[]");

    if (compareSaved) {
      // Remove from comparison
      const filtered = compareList.filter((item: any) => item.id !== scan.id);
      localStorage.setItem("scanwise_compare", JSON.stringify(filtered));
      setCompareSaved(false);
      showToast({ message: "Product removed from comparison", type: "info" });
    } else {
      if (compareList.length >= 2) {
        showToast({ message: "Comparison full! Clear first from Compare page.", type: "error" });
        return;
      }
      compareList.push({
        id: scan.id,
        barcode: scan.barcode,
        product_name: productName,
        health_score: scan.health_score,
        calories: scan.nutrition.calories,
        sugar: scan.nutrition.sugar,
        fat: scan.nutrition.fat,
        saturated_fat: scan.nutrition.saturated_fat,
        nova_group: scan.nova_group,
        additives_count: scan.ingredients?.length || 0,
      });
      localStorage.setItem("scanwise_compare", JSON.stringify(compareList));
      setCompareSaved(true);

      // Track compare achievement
      incrementCompareCountAction().catch(() => {});

      if (compareList.length === 1) {
        showToast({ message: "Product added! Scan another to compare", type: "success" });
      } else {
        showToast({ message: "2 products ready! Go to Compare page", type: "success" });
      }
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-dark-900 pb-24 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary-500/30 border-t-primary-500" />
      </main>
    );
  }

  if (!scan) {
    return (
      <main className="min-h-screen bg-dark-900 pb-24 flex flex-col items-center justify-center px-4">
        <AlertTriangle className="mb-4 h-12 w-12 text-accent-400" />
        <h2 className="text-lg font-semibold text-dark-50">Scan Not Found</h2>
        <p className="mt-2 text-sm text-dark-400">This scan result doesn&apos;t exist or you don&apos;t have access.</p>
        <Link
          href="/scan"
          className="mt-4 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
        >
          Scan Again
        </Link>
      </main>
    );
  }

  const novaColor = NOVA_GROUP_COLORS[scan.nova_group as NovaGroup] || "#64748b";

  return (
    <main className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="rounded-xl bg-dark-800/80 p-2 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-bold text-dark-50">{productName || "Product"}</h1>
          {productBrand && (
            <p className="truncate text-xs text-dark-400">{productBrand}</p>
          )}
        </div>
      </div>

      {/* Product Image */}
      {productImage && (
        <div className="mx-4 mb-4 flex justify-center">
          <img
            src={productImage}
            alt={productName}
            className="h-32 w-32 rounded-2xl border border-dark-700/50 object-cover"
          />
        </div>
      )}

      {/* Health Score Circle */}
      <div className="flex justify-center mb-6">
        <HealthScoreCircle score={scan.health_score} size={180} strokeWidth={12} />
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mb-4 flex items-center gap-3">
        <ShareButton
          productName={productName}
          healthScore={scan.health_score}
          barcode={scan.barcode}
        />
        <button
          onClick={handleCompare}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
            compareSaved
              ? "border-primary-500/30 bg-primary-500/10 text-primary-400"
              : "border-dark-700/50 bg-dark-800/50 text-dark-300 hover:border-primary-500/30 hover:text-primary-400"
          }`}
        >
          <GitCompare className="h-4 w-4" />
          {compareSaved ? "Added" : "Compare"}
        </button>
        {compareSaved && (
          <span className="flex items-center gap-1 text-xs text-primary-400">
            <Info className="h-3 w-3" /> Ready to compare
          </span>
        )}
      </div>

      {/* AI Verdict */}
      <div className="mx-4 mb-4">
        <AIVerdict
          healthScore={scan.health_score}
          aiVerdict={scan.ai_verdict}
          allergens={scan.allergens}
          dietaryPref={dietaryPref}
          userAllergens={userAllergens}
          novaGroup={scan.nova_group as number}
          nutrition={scan.nutrition}
          additiveCount={scan.ingredients?.length || 0}
        />
      </div>

      {/* Healthy Alternatives - Only show for low health score */}
      {scan.health_score < 60 && (() => {
        const alternatives = getAlternatives(productName || "");
        return (
          <div className="mx-4 mb-4">
            <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 px-1">
              Healthier Alternatives
            </p>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/10">
                  <Leaf className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark-50">Try These Instead</p>
                  <p className="text-[10px] text-dark-400">Healthier options with better scores</p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {alternatives.map((alt) => (
                  <div key={alt.name} className="min-w-[140px] flex-shrink-0 rounded-xl bg-dark-800/50 border border-dark-700/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 mb-2">
                      <Leaf className="h-5 w-5 text-primary-400" />
                    </div>
                    <p className="text-xs font-semibold text-dark-50 mb-0.5">{alt.name}</p>
                    <p className="text-[10px] text-dark-400 mb-2">{alt.reason}</p>
                    <span className="inline-flex items-center rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-bold text-primary-400">
                      Score: {alt.estimatedScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* NOVA Group */}
      <div className="mx-4 mb-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              style={{ backgroundColor: `${novaColor}15`, color: novaColor }}
            >
              {scan.nova_group}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-dark-50">NOVA Group</p>
              <p className="text-xs text-dark-400">
                {NOVA_GROUP_LABELS[scan.nova_group as NovaGroup] || "Unknown classification"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Facts (collapsible) */}
      <div className="mx-4 mb-4">
        <button
          onClick={() => setShowNutrition(!showNutrition)}
          className="glass-card w-full flex items-center justify-between p-4 transition-colors hover:bg-dark-700/30"
        >
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-accent-400" />
            <span className="text-sm font-semibold text-dark-50">Nutrition Facts</span>
          </div>
          {showNutrition ? (
            <ChevronUp className="h-4 w-4 text-dark-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-dark-400" />
          )}
        </button>
        {showNutrition && (
          <div className="glass-card border-t-0 rounded-t-none p-4 space-y-3">
            <NutritionRow label="Calories" value={scan.nutrition.calories} unit="kcal" />
            <NutritionRow label="Protein" value={scan.nutrition.protein} unit="g" good />
            <NutritionRow label="Carbs" value={scan.nutrition.carbs} unit="g" />
            <NutritionRow label="Sugar" value={scan.nutrition.sugar} unit="g" bad />
            <NutritionRow label="Fat" value={scan.nutrition.fat} unit="g" />
            <NutritionRow label="Saturated Fat" value={scan.nutrition.saturated_fat} unit="g" bad />
            <NutritionRow label="Fiber" value={scan.nutrition.fiber} unit="g" good />
            <NutritionRow label="Sodium" value={scan.nutrition.sodium} unit="mg" bad />
            <p className="text-[10px] text-dark-600 text-right">per 100g serving</p>
          </div>
        )}
      </div>

      {/* Ingredients Risk (collapsible) */}
      {scan.ingredients && scan.ingredients.length > 0 && (
        <div className="mx-4 mb-4">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="glass-card w-full flex items-center justify-between p-4 transition-colors hover:bg-dark-700/30"
          >
            <div className="flex items-center gap-3">
              <Leaf className="h-5 w-5 text-primary-400" />
              <span className="text-sm font-semibold text-dark-50">Ingredient Risks</span>
              <span className="badge-moderate">{scan.ingredients.length}</span>
            </div>
            {showIngredients ? (
              <ChevronUp className="h-4 w-4 text-dark-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-dark-400" />
            )}
          </button>
          {showIngredients && (
            <div className="glass-card border-t-0 rounded-t-none p-4 space-y-2">
              {scan.ingredients.map((ing, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      ing.risk_level === "high"
                        ? "bg-danger-500"
                        : ing.risk_level === "moderate"
                        ? "bg-accent-500"
                        : "bg-primary-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-dark-50">{ing.name}</p>
                    <p className="text-xs text-dark-400">{ing.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Allergens */}
      {scan.allergens && scan.allergens.length > 0 && (
        <div className="mx-4 mb-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-accent-400" />
              <span className="text-sm font-semibold text-dark-50">Allergens</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {scan.allergens.map((allergen, i) => {
                const isMatch = userAllergens.some((ua) =>
                  allergen.toLowerCase().includes(ua.toLowerCase())
                );
                return (
                  <span
                    key={i}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isMatch
                        ? "bg-danger-500/15 text-danger-400 border border-danger-500/30"
                        : "bg-dark-700/50 text-dark-300"
                    }`}
                  >
                    {allergen.replace(/en:/g, "")}
                    {isMatch && " ⚠️"}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

function NutritionRow({
  label,
  value,
  unit,
  good,
  bad,
}: {
  label: string;
  value: number;
  unit: string;
  good?: boolean;
  bad?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-dark-300">{label}</span>
      <span
        className={`text-sm font-medium ${
          good ? "text-primary-400" : bad ? "text-danger-400" : "text-dark-50"
        }`}
      >
        {typeof value === "number" ? value.toFixed(1) : value} {unit}
      </span>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary-500/30 border-t-primary-500" />
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
