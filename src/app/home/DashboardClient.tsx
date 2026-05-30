"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ScanLine,
  Home,
  Clock,
  User,
  Search,
  GitCompare,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import type { ScanResult } from "@/types";
import { getHealthScoreInfo, HEALTH_SCORE_RANGES } from "@/types";

interface DashboardClientProps {
  profile: {
    id?: string;
    full_name: string | null;
    avatar_url?: string | null;
    free_scans_remaining: number;
    is_premium: boolean;
  };
  recentScans: ScanResult[];
}

function getScoreColor(score: number): string {
  const info = getHealthScoreInfo(score);
  return info.color;
}

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

export default function DashboardClient({
  profile,
  recentScans,
}: DashboardClientProps) {
  const router = useRouter();

  const displayName = profile.full_name || "User";
  const firstName = displayName.split(" ")[0];
  const freeScans = profile.free_scans_remaining;
  const isPremium = profile.is_premium;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ===== Top Bar (Fixed) ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 px-4 py-3 pt-safe">
        <h1 className="text-lg font-bold">
          <span className="gradient-text">ScanWise</span>
        </h1>
        <button
          onClick={() => router.push("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/10 text-primary-400 text-sm font-semibold hover:bg-primary-500/20 transition-colors"
        >
          {displayName.charAt(0).toUpperCase()}
        </button>
      </header>

      {/* ===== Scrollable Content ===== */}
      <main className="px-4 pt-20 pb-28">
        {/* Welcome Section */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-dark-50">
            Hello, {firstName} 👋
          </h2>
          <p className="text-dark-400 mt-1">
            What would you like to scan today?
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent-500/10 px-3 py-1.5">
            <span className="text-accent-400 text-sm font-medium">
              {freeScans} free scans left
            </span>
            {isPremium && (
              <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-xs font-medium text-primary-400">
                PRO
              </span>
            )}
          </div>
        </section>

        {/* Scan Button - Main CTA */}
        <section className="flex flex-col items-center py-6 mb-6">
          <button
            onClick={() => router.push("/scan")}
            className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary-500 pulse-glow transition-transform active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-90" />
            <ScanLine className="relative h-14 w-14 text-white" strokeWidth={1.5} />
          </button>
          <span className="mt-3 text-sm font-medium text-dark-300">
            Scan Now
          </span>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => router.push("/search")}
              className="glass-card flex flex-col items-center gap-2 p-4 hover:border-primary-500/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <Search className="h-5 w-5 text-primary-400" />
              </div>
              <span className="text-xs font-medium text-dark-300">Search</span>
            </button>

            <button
              onClick={() => router.push("/history")}
              className="glass-card flex flex-col items-center gap-2 p-4 hover:border-primary-500/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <Clock className="h-5 w-5 text-primary-400" />
              </div>
              <span className="text-xs font-medium text-dark-300">History</span>
            </button>

            <button
              disabled
              className="glass-card relative flex flex-col items-center gap-2 p-4 opacity-60 cursor-not-allowed"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-700">
                <GitCompare className="h-5 w-5 text-dark-500" />
              </div>
              <span className="text-xs font-medium text-dark-500">Compare</span>
              <span className="absolute -top-2 -right-2 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-dark-900">
                Soon
              </span>
            </button>
          </div>
        </section>

        {/* Recent Scans */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50">Recent Scans</h3>
            {recentScans.length > 0 && (
              <button
                onClick={() => router.push("/history")}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                See All
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Empty State */}
          {recentScans.length === 0 && (
            <div className="glass-card flex flex-col items-center gap-3 py-10 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-700">
                <ShoppingBag className="h-8 w-8 text-dark-500" />
              </div>
              <p className="text-dark-400 text-sm">
                Your first scan is just a tap away
              </p>
              <button
                onClick={() => router.push("/scan")}
                className="mt-2 rounded-xl bg-primary-500/10 px-5 py-2.5 text-sm font-medium text-primary-400 hover:bg-primary-500/20 transition-colors"
              >
                Start Scanning
              </button>
            </div>
          )}

          {/* Scan Cards */}
          <div className="space-y-3">
            {recentScans.map((scan) => {
              const scoreColor = getScoreColor(scan.health_score);
              const riskBadge =
                scan.risk_level === "poor" || scan.risk_level === "fair"
                  ? scan.risk_level === "poor"
                    ? "badge-high"
                    : "badge-moderate"
                  : "badge-safe";

              return (
                <button
                  key={scan.id}
                  onClick={() => router.push(`/result/${scan.id}`)}
                  className="glass-card flex w-full items-center gap-4 p-4 hover:border-dark-600 transition-colors text-left"
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
                      <span className={riskBadge}>{scan.risk_level}</span>
                      <span className="text-xs text-dark-500">
                        {formatRelativeTime(scan.scanned_at)}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="h-4 w-4 text-dark-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===== Bottom Navigation (Fixed) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-800 bg-dark-900/90 backdrop-blur-xl pb-safe">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => router.push("/home")}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Home className="h-5 w-5 text-primary-500" />
            <span className="text-[10px] font-medium text-primary-500">Home</span>
          </button>

          <button
            onClick={() => router.push("/scan")}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <ScanLine className="h-5 w-5 text-dark-500" />
            <span className="text-[10px] font-medium text-dark-500">Scan</span>
          </button>

          <button
            onClick={() => router.push("/history")}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Clock className="h-5 w-5 text-dark-500" />
            <span className="text-[10px] font-medium text-dark-500">History</span>
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <User className="h-5 w-5 text-dark-500" />
            <span className="text-[10px] font-medium text-dark-500">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
