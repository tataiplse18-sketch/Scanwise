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
  Package,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Info,
} from "lucide-react";
import { NOVA_GROUP_LABELS, NOVA_GROUP_COLORS, getHealthScoreInfo } from "@/types";
import type { ScanResult, NovaGroup } from "@/types";

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("id");

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
      if (!scanId) {
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

        // Load scan result
        const { data: scanData } = await supabase
          .from("scan_results")
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
        const compareList = JSON.parse(localStorage.getItem("scanwise_compare") || "[]");
        if (compareList.some((item: any) => item.id === scanId)) {
          setCompareSaved(true);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [scanId, router]);

  function handleCompare() {
    if (!scan) return;
    const compareList = JSON.parse(localStorage.getItem("scanwise_compare") || "[]");

    if (compareSaved) {
      // Remove from comparison
      const filtered = compareList.filter((item: any) => item.id !== scan.id);
      localStorage.setItem("scanwise_compare", JSON.stringify(filtered));
      setCompareSaved(false);
    } else {
      if (compareList.length >= 2) {
        compareList.shift(); // Remove oldest
      }
      compareList.push({
        id: scan.id,
        name: productName,
        health_score: scan.health_score,
        nutrition: scan.nutrition,
        nova_group: scan.nova_group,
        allergens: scan.allergens,
        ingredients: scan.ingredients,
      });
      localStorage.setItem("scanwise_compare", JSON.stringify(compareList));
      setCompareSaved(true);
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
          <Link
            href="/compare"
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
          >
            View <ChevronDown className="h-3 w-3" />
          </Link>
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
        />
      </div>

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
