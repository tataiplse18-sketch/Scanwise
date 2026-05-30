"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ScanResult, HealthScoreLabel } from "@/types";
import { getHealthScoreInfo } from "@/types";
import {
  ArrowLeft,
  Clock,
  ChevronRight,
  Trash2,
  Search,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface HistoryClientProps {
  scans: ScanResult[];
}

type FilterTab = "All" | HealthScoreLabel;

const FILTER_TABS: FilterTab[] = ["All", "poor", "fair", "good", "great"];

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HistoryClient({ scans }: HistoryClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredScans =
    activeFilter === "All"
      ? scans
      : scans.filter((scan) => scan.risk_level === activeFilter);

  async function handleDelete(scanId: string) {
    setDeletingId(scanId);
    try {
      await supabase.from("scans").delete().eq("id", scanId);
      setConfirmDeleteId(null);
      router.refresh();
    } catch {
      // Silently fail — user can try again
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <Link
          href="/home"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold text-dark-200">Scan History</h1>
        <div className="w-9" />
      </header>

      {/* ===== Filter Tabs ===== */}
      {scans.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const count =
                tab === "All"
                  ? scans.length
                  : scans.filter((s) => s.risk_level === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    activeFilter === tab
                      ? "bg-primary-500 text-white"
                      : "bg-dark-800 text-dark-400 hover:text-dark-300"
                  )}
                >
                  {tab === "All"
                    ? `All (${count})`
                    : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${count})`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Scan List ===== */}
      <main className="px-4 py-4 pb-28">
        {/* Empty State */}
        {scans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dark-800 mb-4">
              <Clock className="h-10 w-10 text-dark-600" />
            </div>
            <h2 className="text-lg font-semibold text-dark-200 mb-2">
              No scans yet
            </h2>
            <p className="text-dark-400 text-sm max-w-xs">
              Start scanning to build your history!
            </p>
            <Link
              href="/scan"
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              <Search className="h-4 w-4" />
              Start Scanning
            </Link>
          </div>
        )}

        {/* Filtered empty state */}
        {scans.length > 0 && filteredScans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-dark-400 text-sm">
              No scans with &quot;{activeFilter}&quot; rating found.
            </p>
          </div>
        )}

        {/* Scan Cards */}
        <div className="space-y-3">
          {filteredScans.map((scan) => {
            const scoreColor = getHealthScoreInfo(scan.health_score).color;
            const isDeleting = deletingId === scan.id;
            const isConfirming = confirmDeleteId === scan.id;

            return (
              <div key={scan.id} className="relative">
                <Link
                  href={`/result?barcode=${encodeURIComponent(scan.barcode)}`}
                  onClick={(e) => {
                    if (isConfirming) e.preventDefault();
                  }}
                  className={cn(
                    "glass-card flex w-full items-center gap-4 p-4 text-left transition-colors",
                    isConfirming && "border-danger-500/30"
                  )}
                >
                  {/* Health Score Circle */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: `${scoreColor}15`,
                      color: scoreColor,
                    }}
                  >
                    {scan.health_score}
                  </div>

                  {/* Scan Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-50 truncate">
                      {scan.barcode}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          scan.risk_level === "poor" && "bg-danger-500/15 text-danger-400",
                          scan.risk_level === "fair" && "bg-accent-500/15 text-accent-400",
                          scan.risk_level === "good" && "bg-primary-500/15 text-primary-400",
                          scan.risk_level === "great" && "bg-primary-500/15 text-primary-300"
                        )}
                      >
                        {scan.risk_level}
                      </span>
                      <span className="text-xs text-dark-500">
                        {formatRelativeTime(scan.scanned_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isConfirming ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(scan.id);
                          }}
                          className="rounded-lg bg-danger-500/20 px-2.5 py-1 text-[10px] font-medium text-danger-400 hover:bg-danger-500/30 transition-colors"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "..." : "Delete"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="rounded-lg bg-dark-700 px-2.5 py-1 text-[10px] font-medium text-dark-400 hover:bg-dark-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmDeleteId(scan.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-dark-600 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <ChevronRight className="h-4 w-4 text-dark-600" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </main>

      {/* ===== Bottom Navigation ===== */}
      <BottomNav />
    </div>
  );
}
