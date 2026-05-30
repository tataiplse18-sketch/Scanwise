"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MagnifyingGlass,
  X,
  Package,
  Loader2,
  Clock,
  Search,
} from "lucide-react";

// ============================================================
// Types for Open Food Facts search API
// ============================================================

interface OFFSearchProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  image_front_url?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  categories?: string;
}

interface OFFSearchResponse {
  count: number;
  page: number;
  page_size: number;
  products: OFFSearchProduct[];
}

const STORAGE_KEY = "scanwise_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage not available
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

function getNutriScoreColor(grade?: string): string {
  switch (grade?.toLowerCase()) {
    case "a":
      return "bg-primary-500/15 text-primary-400";
    case "b":
      return "bg-primary-500/10 text-primary-300";
    case "c":
      return "bg-accent-500/15 text-accent-400";
    case "d":
      return "bg-accent-500/10 text-accent-300";
    case "e":
      return "bg-danger-500/15 text-danger-400";
    default:
      return "bg-dark-700 text-dark-400";
  }
}

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OFFSearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    saveRecentSearch(searchQuery.trim());
    setRecentSearches(getRecentSearches());

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          searchQuery.trim()
        )}&page_size=20&json=1`
      );

      if (!res.ok) {
        throw new Error("Failed to search products. Please try again.");
      }

      const data: OFFSearchResponse = await res.json();
      setResults(data.products || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    searchProducts(query);
  }

  function handleRecentClick(recentQuery: string) {
    setQuery(recentQuery);
    searchProducts(recentQuery);
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-50 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push("/home")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food products..."
              autoFocus
              className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setSearched(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* ===== Loading State ===== */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="glass-card flex items-center gap-4 p-4 animate-pulse"
              >
                <div className="h-14 w-14 rounded-xl bg-dark-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-dark-700" />
                  <div className="h-3 w-1/2 rounded bg-dark-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Error State ===== */}
        {error && !loading && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-500/10 mb-4">
              <X className="h-8 w-8 text-danger-400" />
            </div>
            <p className="text-dark-300 text-sm">{error}</p>
            <button
              onClick={() => searchProducts(query)}
              className="mt-4 rounded-xl bg-primary-500/10 px-5 py-2.5 text-sm font-medium text-primary-400 hover:bg-primary-500/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ===== No Results State ===== */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-800 mb-4">
              <Search className="h-8 w-8 text-dark-600" />
            </div>
            <h2 className="text-lg font-semibold text-dark-200 mb-2">
              No products found
            </h2>
            <p className="text-dark-400 text-sm max-w-xs">
              No results for &quot;{query}&quot;. Try a different search term.
            </p>
          </div>
        )}

        {/* ===== Search Results ===== */}
        {!loading && !error && results.length > 0 && (
          <div>
            <p className="text-xs text-dark-500 mb-3 px-1">
              {results.length} product{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {results.map((product) => (
                <button
                  key={product.code}
                  onClick={() =>
                    router.push(`/result?barcode=${product.code}`)
                  }
                  className="glass-card flex w-full items-center gap-4 p-4 hover:border-dark-600 transition-colors text-left"
                >
                  {/* Product Image */}
                  {product.image_front_small_url ||
                  product.image_front_url ? (
                    <img
                      src={
                        product.image_front_small_url ||
                        product.image_front_url
                      }
                      alt={product.product_name || "Product"}
                      className="h-14 w-14 rounded-xl object-cover border border-dark-700 shrink-0"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-dark-700 border border-dark-700">
                      <Package className="h-6 w-6 text-dark-500" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-50 truncate">
                      {product.product_name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-dark-400 truncate mt-0.5">
                      {product.brands || "Unknown Brand"}
                    </p>
                  </div>

                  {/* Nutri-Score Badge */}
                  {product.nutriscore_grade && (
                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-2 py-1 text-xs font-bold uppercase",
                        getNutriScoreColor(product.nutriscore_grade)
                      )}
                    >
                      {product.nutriscore_grade}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== Initial State: Recent Searches ===== */}
        {!searched && !loading && (
          <div>
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Recent Searches
                  </h3>
                  <button
                    onClick={() => {
                      clearRecentSearches();
                      setRecentSearches([]);
                    }}
                    className="text-xs text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((recent) => (
                    <button
                      key={recent}
                      onClick={() => handleRecentClick(recent)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-dark-800 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-dark-600 shrink-0" />
                      <span className="text-sm text-dark-300">{recent}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentSearches.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dark-800 mb-4">
                  <MagnifyingGlass className="h-10 w-10 text-dark-600" />
                </div>
                <h2 className="text-lg font-semibold text-dark-200 mb-2">
                  Search for any food product
                </h2>
                <p className="text-dark-400 text-sm max-w-xs">
                  Type a product name to find health scores and ingredient
                  analysis
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
