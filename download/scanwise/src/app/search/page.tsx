"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Search as SearchIcon, ScanLine, ArrowRight } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Search Open Food Facts
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=10&json=1`
      );
      const data = await response.json();

      if (data.products) {
        setResults(
          data.products
            .filter((p: any) => p.code && p.product_name)
            .map((p: any) => ({
              barcode: p.code,
              name: p.product_name,
              brand: p.brands || "",
              image: p.image_url || null,
              novaGroup: p.nova_group || null,
            }))
        );
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(barcode: string) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check scan limit
      const { data: profile } = await supabase
        .from("profiles")
        .select("scan_count, is_premium")
        .eq("id", user.id)
        .single();

      const freeScansLeft = Math.max(0, 5 - (profile?.scan_count || 0));
      if (!profile?.is_premium && freeScansLeft <= 0) {
        router.push("/premium");
        return;
      }

      // Redirect to scan with barcode
      router.push(`/scan?barcode=${barcode}`);
    } catch {
      // Fallback
    }
  }

  return (
    <main className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-dark-50">Search Products</h1>
        <p className="text-sm text-dark-400">Find a product by name</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mx-4 mb-4">
        <div className="glass-card flex items-center gap-3 px-4 py-3">
          <SearchIcon className="h-5 w-5 text-dark-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a product..."
            className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-dark-700" />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-dark-700 mb-2" />
                  <div className="h-3 w-20 rounded bg-dark-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searched && results.length > 0 ? (
        <div className="px-4 space-y-3">
          {results.map((product) => (
            <button
              key={product.barcode}
              onClick={() => handleSelect(product.barcode)}
              className="glass-card w-full flex items-center gap-3 p-3 transition-colors hover:bg-dark-700/30 text-left"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-12 w-12 rounded-xl border border-dark-700/50 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-dark-700/50">
                  <ScanLine className="h-5 w-5 text-dark-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-dark-50">{product.name}</p>
                <p className="truncate text-xs text-dark-400">{product.brand}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-dark-600" />
            </button>
          ))}
        </div>
      ) : searched ? (
        <div className="flex flex-col items-center px-4 pt-12">
          <SearchIcon className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm font-medium text-dark-400">No products found</p>
          <p className="mt-1 text-xs text-dark-500">Try a different search term</p>
        </div>
      ) : (
        <div className="flex flex-col items-center px-4 pt-12">
          <SearchIcon className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm font-medium text-dark-400">Search for any food product</p>
          <p className="mt-1 text-xs text-dark-500">Type a product name to get started</p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
