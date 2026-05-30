"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  GitCompare,
  ArrowLeft,
  Check,
  X,
  Trash2,
  Trophy,
} from "lucide-react";
import { NOVA_GROUP_LABELS, NOVA_GROUP_COLORS, getHealthScoreInfo } from "@/types";
import type { NovaGroup } from "@/types";

interface CompareProduct {
  id: string;
  name: string;
  health_score: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
    saturated_fat: number;
    fiber: number;
    sodium: number;
  };
  nova_group: number;
  allergens: string[];
  ingredients: { name: string; risk_level: string }[];
}

export default function ComparePage() {
  const [products, setProducts] = useState<CompareProduct[]>([]);

  useEffect(() => {
    const compareList = JSON.parse(localStorage.getItem("scanwise_compare") || "[]");
    setProducts(compareList);
  }, []);

  function clearComparison() {
    localStorage.removeItem("scanwise_compare");
    setProducts([]);
  }

  function removeProduct(id: string) {
    const updated = products.filter((p) => p.id !== id);
    localStorage.setItem("scanwise_compare", JSON.stringify(updated));
    setProducts(updated);
  }

  // Determine winner for a metric (lower is better for bad things, higher for good)
  function getWinner(metric: string): number | null {
    if (products.length < 2) return null;
    const [a, b] = products;
    switch (metric) {
      case "health_score":
        return a.health_score >= b.health_score ? 0 : 1;
      case "protein":
      case "fiber":
        return (a.nutrition[metric as keyof typeof a.nutrition] || 0) >=
          (b.nutrition[metric as keyof typeof b.nutrition] || 0)
          ? 0
          : 1;
      case "calories":
      case "sugar":
      case "fat":
      case "saturated_fat":
      case "sodium":
      case "nova_group":
        return (a.nutrition[metric as keyof typeof a.nutrition] || 0) <=
          (b.nutrition[metric as keyof typeof b.nutrition] || 0)
          ? 0
          : 1;
      case "allergens":
        return a.allergens.length <= b.allergens.length ? 0 : 1;
      case "additives":
        return (a.ingredients?.length || 0) <= (b.ingredients?.length || 0) ? 0 : 1;
      default:
        return null;
    }
  }

  const overallWinner =
    products.length === 2
      ? products[0].health_score >= products[1].health_score
        ? 0
        : 1
      : null;

  if (products.length < 2) {
    return (
      <main className="min-h-screen bg-dark-900 pb-24 flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <Link
            href="/home"
            className="rounded-xl bg-dark-800/80 p-2 text-dark-400 hover:text-dark-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-dark-50">Compare Products</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <GitCompare className="mb-4 h-16 w-16 text-dark-600" />
          <h2 className="text-lg font-semibold text-dark-50">
            {products.length === 0 ? "No Products to Compare" : "Add One More Product"}
          </h2>
          <p className="mt-2 text-sm text-dark-400 text-center">
            {products.length === 0
              ? "Scan two products and add them to comparison from the result page."
              : "You have 1 product saved. Scan and add one more to compare."}
          </p>

          {products.length > 0 && (
            <div className="mt-4 w-full max-w-sm">
              {products.map((p) => (
                <div key={p.id} className="glass-card flex items-center gap-3 p-3 mb-2">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{
                      backgroundColor: `${getHealthScoreInfo(p.health_score).color}15`,
                      color: getHealthScoreInfo(p.health_score).color,
                    }}
                  >
                    {p.health_score}
                  </div>
                  <span className="flex-1 truncate text-sm text-dark-50">{p.name}</span>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="text-dark-500 hover:text-danger-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/scan"
            className="mt-6 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
          >
            Scan a Product
          </Link>
        </div>

        <BottomNav />
      </main>
    );
  }

  const comparisonMetrics = [
    { label: "Health Score", key: "health_score", getValue: (p: CompareProduct) => p.health_score, unit: "/100" },
    { label: "Calories", key: "calories", getValue: (p: CompareProduct) => p.nutrition.calories?.toFixed(0), unit: "kcal" },
    { label: "Protein", key: "protein", getValue: (p: CompareProduct) => p.nutrition.protein?.toFixed(1), unit: "g" },
    { label: "Sugar", key: "sugar", getValue: (p: CompareProduct) => p.nutrition.sugar?.toFixed(1), unit: "g" },
    { label: "Fat", key: "fat", getValue: (p: CompareProduct) => p.nutrition.fat?.toFixed(1), unit: "g" },
    { label: "Fiber", key: "fiber", getValue: (p: CompareProduct) => p.nutrition.fiber?.toFixed(1), unit: "g" },
    { label: "Sodium", key: "sodium", getValue: (p: CompareProduct) => p.nutrition.sodium?.toFixed(0), unit: "mg" },
    { label: "NOVA Group", key: "nova_group", getValue: (p: CompareProduct) => p.nova_group, unit: "" },
    { label: "Allergens", key: "allergens", getValue: (p: CompareProduct) => p.allergens.length, unit: "" },
    { label: "Additives", key: "additives", getValue: (p: CompareProduct) => p.ingredients?.length || 0, unit: "" },
  ];

  return (
    <main className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <Link
          href="/home"
          className="rounded-xl bg-dark-800/80 p-2 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-dark-50">Compare</h1>
        <button
          onClick={clearComparison}
          className="ml-auto flex items-center gap-1 text-xs text-dark-400 hover:text-danger-400 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      {/* Overall Winner */}
      {overallWinner !== null && (
        <div className="mx-4 mb-4">
          <div
            className={`glass-card p-4 text-center ${
              overallWinner === 0 ? "border border-primary-500/20" : "border border-primary-500/20"
            }`}
            style={{
              boxShadow:
                overallWinner === 0
                  ? "0 0 20px rgba(16,185,129,0.1)"
                  : "0 0 20px rgba(16,185,129,0.1)",
            }}
          >
            <Trophy className="mx-auto mb-2 h-6 w-6 text-primary-400" />
            <p className="text-sm font-semibold text-dark-50">
              {products[overallWinner].name} wins!
            </p>
            <p className="text-xs text-dark-400">
              Overall health score: {products[overallWinner].health_score}/100
            </p>
          </div>
        </div>
      )}

      {/* Product Headers */}
      <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
        {products.map((product, idx) => {
          const info = getHealthScoreInfo(product.health_score);
          return (
            <div
              key={product.id}
              className={`glass-card p-3 text-center ${
                overallWinner === idx ? "border-primary-500/30" : ""
              }`}
              style={{
                boxShadow:
                  overallWinner === idx
                    ? `0 0 15px ${info.color}20`
                    : undefined,
              }}
            >
              <div
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
                style={{ backgroundColor: `${info.color}15`, color: info.color }}
              >
                {product.health_score}
              </div>
              <p className="truncate text-sm font-semibold text-dark-50">{product.name}</p>
              <p className="text-xs font-medium" style={{ color: info.color }}>
                {info.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mx-4">
        <div className="glass-card overflow-hidden">
          {comparisonMetrics.map((metric, i) => {
            const winner = getWinner(metric.key);
            return (
              <div
                key={metric.key}
                className={`flex items-center px-4 py-3 ${
                  i > 0 ? "border-t border-dark-700/50" : ""
                }`}
              >
                <span className="flex-1 text-xs text-dark-400">{metric.label}</span>
                {products.map((product, idx) => (
                  <span
                    key={product.id}
                    className={`w-20 text-center text-sm font-medium ${
                      winner === idx ? "text-primary-400" : "text-dark-200"
                    }`}
                  >
                    {metric.getValue(product)}{metric.unit}
                    {winner === idx && (
                      <Check className="inline h-3 w-3 ml-1 text-primary-400" />
                    )}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
