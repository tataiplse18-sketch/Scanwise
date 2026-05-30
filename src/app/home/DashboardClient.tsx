"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ScanLine,
  Search,
  GitCompare,
  ShoppingBag,
  ChevronRight,
  Crown,
  Zap,
  Clock,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import type { ScanResult } from "@/types";
import { getHealthScoreInfo } from "@/types";

interface DashboardClientProps {
  profile: {
    id?: string;
    full_name: string | null;
    avatar_url?: string | null;
    scan_count?: number;
    is_premium: boolean;
    dietary_pref?: string | null;
    allergens?: string[];
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
  const displayName = profile.full_name || "User";
  const firstName = displayName.split(" ")[0];
  const isPremium = profile.is_premium;
  const scanCount = profile.scan_count ?? 0;
  const freeScansLeft = isPremium ? Infinity : Math.max(0, 5 - scanCount);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ===== Top Bar (Fixed) ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 px-4 py-3 pt-safe">
        <h1 className="text-lg font-bold">
          <span className="gradient-text">ScanWise</span>
        </h1>
        <div className="flex items-center gap-2">
          {isPremium && (
            <span className="rounded-full bg-accent-500/15 px-2.5 py-0.5 text-[10px] font-bold text-accent-400 flex items-center gap-1">
              <Crown className="h-3 w-3" /> PRO
            </span>
          )}
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/10 text-primary-400 text-sm font-semibold hover:bg-primary-500/20 transition-colors"
          >
            {displayName.charAt(0).toUpperCase()}
          </Link>
        </div>
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
            {isPremium ? (
              <>
                <Crown className="h-3.5 w-3.5 text-accent-400" />
                <span className="text-accent-400 text-sm font-medium">
                  Unlimited scans
                </span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-accent-400" />
                <span className="text-accent-400 text-sm font-medium">
                  {freeScansLeft} free scan{freeScansLeft !== 1 ? "s" : ""} left
                </span>
              </>
            )}
          </div>
        </section>

        {/* Scan Button - Main CTA */}
        <section className="flex flex-col items-center py-6 mb-6">
          <Link
            href="/scan"
            className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary-500 pulse-glow transition-transform active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-90" />
            <ScanLine className="relative h-14 w-14 text-white" strokeWidth={1.5} />
          </Link>
          <span className="mt-3 text-sm font-medium text-dark-300">
            Scan Now
          </span>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/search"
              className="glass-card flex flex-col items-center gap-2 p-4 hover:border-primary-500/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <Search className="h-5 w-5 text-primary-400" />
              </div>
              <span className="text-xs font-medium text-dark-300">Search</span>
            </Link>

            <Link
              href="/history"
              className="glass-card flex flex-col items-center gap-2 p-4 hover:border-primary-500/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <Clock className="h-5 w-5 text-primary-400" />
              </div>
              <span className="text-xs font-medium text-dark-300">History</span>
            </Link>

            <span
              className="glass-card relative flex flex-col items-center gap-2 p-4 opacity-60 cursor-not-allowed"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-700">
                <GitCompare className="h-5 w-5 text-dark-500" />
              </div>
              <span className="text-xs font-medium text-dark-500">Compare</span>
              <span className="absolute -top-2 -right-2 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-dark-900">
                Soon
              </span>
            </span>
          </div>
        </section>

        {/* Free Scan Limit Warning */}
        {!isPremium && freeScansLeft <= 2 && freeScansLeft > 0 && (
          <section className="glass-card border-accent-500/20 p-4 mb-6 flex items-center gap-3">
            <Zap className="h-5 w-5 text-accent-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-200">
                Only {freeScansLeft} free scan{freeScansLeft !== 1 ? "s" : ""} left!
              </p>
              <p className="text-xs text-dark-500">Upgrade to Premium for unlimited scans</p>
            </div>
            <Link
              href="/premium"
              className="shrink-0 rounded-lg bg-accent-500/10 px-3 py-1.5 text-xs font-medium text-accent-400 hover:bg-accent-500/20 transition-colors"
            >
              Upgrade
            </Link>
          </section>
        )}

        {/* Paywall - All free scans used */}
        {!isPremium && freeScansLeft === 0 && (
          <section className="glass-card border-accent-500/30 p-5 mb-6 text-center">
            <Crown className="h-8 w-8 text-accent-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-dark-100 mb-1">
              You&apos;ve used all 5 free scans!
            </h3>
            <p className="text-xs text-dark-400 mb-4">
              Upgrade to Premium for unlimited scans and exclusive features
            </p>
            <Link
              href="/premium"
              className="block w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-2.5 text-sm font-bold text-dark-900 hover:opacity-90 transition-opacity text-center"
            >
              Upgrade to Premium
            </Link>
          </section>
        )}

        {/* Recent Scans */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50">Recent Scans</h3>
            {recentScans.length > 0 && (
              <Link
                href="/history"
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                See All
                <ChevronRight className="h-4 w-4" />
              </Link>
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
              <Link
                href="/scan"
                className="mt-2 rounded-xl bg-primary-500/10 px-5 py-2.5 text-sm font-medium text-primary-400 hover:bg-primary-500/20 transition-colors"
              >
                Start Scanning
              </Link>
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
                <Link
                  key={scan.id}
                  href={`/result?barcode=${encodeURIComponent(scan.barcode)}`}
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
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===== Bottom Navigation ===== */}
      <BottomNav />
    </div>
  );
}
