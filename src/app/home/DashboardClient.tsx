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
  Trophy,
  Activity,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import WeeklyReportCard from "@/components/WeeklyReportCard";
import type { ScanResult } from "@/types";
import { getHealthScoreInfo, getLevelFromXP, getXPForNextLevel } from "@/types";

interface DashboardClientProps {
  profile: {
    id?: string;
    full_name: string | null;
    avatar_url?: string | null;
    scan_count?: number;
    is_premium: boolean;
    dietary_pref?: string | null;
    allergens?: string[];
    xp_points?: number;
    level?: number;
  };
  recentScans: ScanResult[];
  weeklyScans: { health_score: number; scanned_at: string }[];
}

function getScoreColor(score: number): string {
  const info = getHealthScoreInfo(score);
  return info.color;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTimeEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌙";
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
  weeklyScans,
}: DashboardClientProps) {
  const displayName = profile.full_name || "User";
  const firstName = displayName.split(" ")[0];
  const isPremium = profile.is_premium;
  const scanCount = profile.scan_count ?? 0;
  const freeScansLeft = isPremium ? Infinity : Math.max(0, 5 - scanCount);
  const totalXP = profile.xp_points ?? 0;
  const userLevel = profile.level ?? getLevelFromXP(totalXP);
  const xpForCurrentLevel = (userLevel - 1) * 100;
  const xpForNextLevel = getXPForNextLevel(userLevel);
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpPercent = xpForNextLevel > 0 ? Math.min(Math.round((xpInCurrentLevel / xpForNextLevel) * 100), 100) : 0;

  // Calculate average health score from recent scans
  const avgHealthScore = recentScans.length > 0
    ? Math.round(recentScans.reduce((sum, s) => sum + s.health_score, 0) / recentScans.length)
    : null;
  const avgScoreInfo = avgHealthScore !== null ? getHealthScoreInfo(avgHealthScore) : null;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ===== Top Bar (Fixed) ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.04] px-4 py-3 pt-safe">
        <h1 className="text-lg font-bold">
          <span className="gradient-text">ScanWise</span>
        </h1>
        <div className="flex items-center gap-2">
          {isPremium && (
            <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 text-[10px] font-bold text-accent-400 flex items-center gap-1 border border-accent-500/15">
              <Crown className="h-3 w-3" /> PRO
            </span>
          )}
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/8 text-primary-400 text-sm font-semibold hover:bg-primary-500/15 transition-colors"
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
            {getTimeGreeting()}, {firstName} {getTimeEmoji()}
          </h2>
          <p className="text-dark-400 mt-1 text-sm">
            What would you like to scan today?
          </p>
        </section>

        {/* Level + XP Progress */}
        <Link
          href="/achievements"
          className="mb-5 flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 hover:border-primary-500/15 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/8">
            <Trophy className="h-4 w-4 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-dark-300">Level {userLevel}</span>
              <span className="text-[10px] text-dark-500">{xpInCurrentLevel}/{xpForNextLevel} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-dark-600 shrink-0" />
        </Link>

        {/* Health Score Summary + Quick Stats */}
        <section className="mb-6 grid grid-cols-3 gap-3">
          {/* Health Score Card */}
          {avgHealthScore !== null ? (
            <div className="glass-card-elevated flex flex-col items-center justify-center p-4 col-span-1">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold mb-1"
                style={{
                  backgroundColor: `${avgScoreInfo?.color}12`,
                  color: avgScoreInfo?.color,
                }}
              >
                {avgHealthScore}
              </div>
              <span className="text-[10px] font-medium text-dark-400">Avg Score</span>
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-4 col-span-1">
              <Activity className="h-6 w-6 text-dark-600 mb-1" />
              <span className="text-[10px] font-medium text-dark-500">Avg Score</span>
            </div>
          )}

          {/* Scan Count */}
          <div className="glass-card flex flex-col items-center justify-center p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/8 mb-1">
              <ScanLine className="h-4 w-4 text-primary-400" />
            </div>
            <span className="text-sm font-bold text-dark-50">{scanCount}</span>
            <span className="text-[10px] text-dark-500">Scans</span>
          </div>

          {/* Free Scans / Streak */}
          <div className="glass-card flex flex-col items-center justify-center p-4">
            {isPremium ? (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/8 mb-1">
                  <Crown className="h-4 w-4 text-accent-400" />
                </div>
                <span className="text-xs font-bold text-accent-400">∞</span>
                <span className="text-[10px] text-dark-500">Unlimited</span>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/8 mb-1">
                  <Zap className="h-4 w-4 text-accent-400" />
                </div>
                <span className="text-sm font-bold text-dark-50">{freeScansLeft}</span>
                <span className="text-[10px] text-dark-500">Free Left</span>
              </>
            )}
          </div>
        </section>

        {/* Scan Button - Main CTA */}
        <section className="flex flex-col items-center py-6 mb-6">
          <Link
            href="/scan"
            className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary-500 pulse-glow transition-transform active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-90" />
            <ScanLine className="relative h-12 w-12 text-white" strokeWidth={1.5} />
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
              className="glass-card flex flex-col items-center gap-2 p-4 hover:border-white/[0.1] transition-all duration-200 active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/8">
                <Search className="h-5 w-5 text-primary-400" />
              </div>
              <span className="text-xs font-medium text-dark-400">Search</span>
            </Link>

            <Link
              href="/history"
              className="glass-card flex flex-col items-center gap-2 p-4 hover:border-white/[0.1] transition-all duration-200 active:scale-[0.97]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/8">
                <Clock className="h-5 w-5 text-primary-400" />
              </div>
              <span className="text-xs font-medium text-dark-400">History</span>
            </Link>

            <span
              className="glass-card relative flex flex-col items-center gap-2 p-4 opacity-50 cursor-not-allowed"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03]">
                <GitCompare className="h-5 w-5 text-dark-600" />
              </div>
              <span className="text-xs font-medium text-dark-600">Compare</span>
              <span className="absolute -top-2 -right-2 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-dark-900">
                Soon
              </span>
            </span>
          </div>
        </section>

        {/* Weekly Health Report */}
        <WeeklyReportCard weeklyScans={weeklyScans} />

        {/* Premium upsell banners */}
        {!isPremium && freeScansLeft <= 2 && freeScansLeft > 0 && (
          <section className="glass-card border-accent-500/15 p-4 mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/8">
              <Zap className="h-5 w-5 text-accent-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-200">
                Only {freeScansLeft} free scan{freeScansLeft !== 1 ? "s" : ""} left!
              </p>
              <p className="text-xs text-dark-500">Upgrade to Premium for unlimited scans</p>
            </div>
            <Link
              href="/premium"
              className="shrink-0 rounded-lg bg-accent-500/10 border border-accent-500/15 px-3 py-1.5 text-xs font-medium text-accent-400 hover:bg-accent-500/15 transition-colors"
            >
              Upgrade
            </Link>
          </section>
        )}

        {!isPremium && freeScansLeft === 0 && (
          <section className="glass-card-elevated border-accent-500/20 p-5 mb-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 mx-auto mb-3">
              <Crown className="h-6 w-6 text-accent-400" />
            </div>
            <h3 className="text-sm font-semibold text-dark-100 mb-1">
              You&apos;ve used all 5 free scans!
            </h3>
            <p className="text-xs text-dark-500 mb-4">
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
            <h3 className="text-base font-semibold text-dark-50">Recent Scans</h3>
            {recentScans.length > 0 && (
              <Link
                href="/history"
                className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
              >
                See All
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Empty State */}
          {recentScans.length === 0 && (
            <div className="glass-card flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03]">
                <ShoppingBag className="h-8 w-8 text-dark-600" />
              </div>
              <p className="text-dark-400 text-sm">
                Your first scan is just a tap away
              </p>
              <Link
                href="/scan"
                className="mt-2 rounded-xl bg-primary-500/8 border border-primary-500/15 px-5 py-2.5 text-sm font-medium text-primary-400 hover:bg-primary-500/15 transition-colors"
              >
                Start Scanning
              </Link>
            </div>
          )}

          {/* Scan Cards */}
          <div className="space-y-2">
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
                  className="glass-card flex w-full items-center gap-4 p-4 hover:border-white/[0.1] transition-all duration-200 active:scale-[0.98] text-left"
                >
                  {/* Health Score */}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: `${scoreColor}10`,
                      color: scoreColor,
                    }}
                  >
                    {scan.health_score}
                  </div>

                  {/* Scan Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate">
                      {scan.barcode}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={riskBadge}>{scan.risk_level}</span>
                      <span className="text-[10px] text-dark-500">
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
