"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Clock, Search, Filter, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { getHealthScoreInfo } from "@/types";

interface ScanItem {
  id: string;
  barcode: string;
  health_score: number;
  scanned_at: string;
  products?: { name: string; brand: string | null; image_url: string | null }[];
}

type FilterType = "all" | "poor" | "fair" | "good" | "great";

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [filtered, setFiltered] = useState<ScanItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: scansData } = await supabase
          .from("scan_results")
          .select("id, barcode, health_score, scanned_at")
          .eq("user_id", user.id)
          .order("scanned_at", { ascending: false });

        if (scansData && scansData.length > 0) {
          const barcodes = scansData.map((s) => s.barcode);
          const { data: productsData } = await supabase
            .from("products")
            .select("barcode, name, brand, image_url")
            .in("barcode", barcodes);

          const productMap = new Map(
            (productsData || []).map((p) => [p.barcode, { name: p.name, brand: p.brand, image_url: p.image_url }])
          );

          const enriched = scansData.map((scan) => ({
            ...scan,
            products: productMap.has(scan.barcode)
              ? [productMap.get(scan.barcode)!]
              : [],
          }));

          setScans(enriched);
          setFiltered(enriched);
        }
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  useEffect(() => {
    let result = scans;

    if (filter !== "all") {
      result = result.filter((s) => {
        const info = getHealthScoreInfo(s.health_score);
        return info.label === filter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        const name = s.products?.[0]?.name?.toLowerCase() || "";
        const brand = s.products?.[0]?.brand?.toLowerCase() || "";
        return name.includes(q) || brand.includes(q) || s.barcode.includes(q);
      });
    }

    setFiltered(result);
  }, [filter, searchQuery, scans]);

  const filters: { key: FilterType; label: string; color: string }[] = [
    { key: "all", label: "All", color: "text-dark-300" },
    { key: "poor", label: "Poor", color: "text-danger-400" },
    { key: "fair", label: "Fair", color: "text-accent-400" },
    { key: "good", label: "Good", color: "text-primary-400" },
    { key: "great", label: "Great", color: "text-primary-300" },
  ];

  return (
    <main className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-dark-50">Scan History</h1>
        <p className="text-sm text-dark-400">{scans.length} products scanned</p>
      </div>

      {/* Search */}
      <div className="mx-4 mb-4">
        <div className="glass-card flex items-center gap-3 px-4 py-3">
          <Search className="h-4 w-4 text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, brand, or barcode..."
            className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mx-4 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary-500/15 text-primary-400 border border-primary-500/30"
                : "bg-dark-800/50 text-dark-400 border border-dark-700/50 hover:text-dark-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Scan List */}
      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
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
      ) : filtered.length > 0 ? (
        <div className="px-4 space-y-3">
          {filtered.map((scan) => {
            const product = scan.products?.[0];
            const info = getHealthScoreInfo(scan.health_score);
            return (
              <Link
                key={scan.id}
                href={`/result?id=${scan.id}`}
                className="glass-card flex items-center gap-3 p-3 transition-colors hover:bg-dark-700/30"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ backgroundColor: `${info.color}15`, color: info.color }}
                >
                  {scan.health_score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-dark-50">
                    {product?.name || `Product ${scan.barcode}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium" style={{ color: info.color }}>
                      {info.label}
                    </span>
                    <span className="text-dark-600">·</span>
                    <span className="flex items-center gap-1 text-xs text-dark-500">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(scan.scanned_at)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-dark-600" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center px-4 pt-12">
          <Filter className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm font-medium text-dark-400">
            {scans.length > 0 ? "No matching scans" : "No scans yet"}
          </p>
          <p className="mt-1 text-xs text-dark-500">
            {scans.length > 0
              ? "Try a different filter or search term"
              : "Scan your first product to see results here"}
          </p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
