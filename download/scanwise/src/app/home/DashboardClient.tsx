"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import WeeklyReportCard from "@/components/WeeklyReportCard";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import {
  ScanLine,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight,
  Crown,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { getHealthScoreInfo } from "@/types";
import type { NovaGroup } from "@/types";

interface RecentScan {
  id: string;
  barcode: string;
  health_score: number;
  scanned_at: string;
  products?: { name: string; brand: string | null; image_url: string | null }[];
}

interface ProfileData {
  full_name: string | null;
  scan_count: number;
  is_premium: boolean;
  onboarding_done: boolean;
}

export default function DashboardClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        // Load profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, scan_count, is_premium, onboarding_done")
          .eq("id", user.id)
          .single();

        if (profileData && !profileData.onboarding_done) {
          window.location.href = "/onboarding";
          return;
        }

        setProfile(profileData || { full_name: null, scan_count: 0, is_premium: false, onboarding_done: true });

        // Load recent scans
        const { data: scansData } = await supabase
          .from("scan_results")
          .select("id, barcode, health_score, scanned_at")
          .eq("user_id", user.id)
          .order("scanned_at", { ascending: false })
          .limit(5);

        if (scansData && scansData.length > 0) {
          // Get product info for each scan
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

          setRecentScans(enriched);
        }
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const scanCount = profile?.scan_count || 0;
  const freeScansLeft = Math.max(0, 5 - scanCount);
  const isPremium = profile?.is_premium || false;

  return (
    <main className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-dark-400">Hey {firstName}!</p>
            <h1 className="text-xl font-bold text-dark-50">Dashboard</h1>
          </div>
          <Link href="/profile" className="rounded-full bg-dark-800 p-2">
            <ScanLine className="h-5 w-5 text-dark-400" />
          </Link>
        </div>
      </div>

      {/* Scan Limit Banner */}
      {!isPremium && (
        <div className="mx-4 mb-4">
          <div className="glass-card flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
              <Zap className="h-5 w-5 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-50">
                {freeScansLeft} free scans left
              </p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-dark-700">
                <div
                  className="h-1.5 rounded-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${(freeScansLeft / 5) * 100}%` }}
                />
              </div>
            </div>
            <Link
              href="/premium"
              className="shrink-0 rounded-lg bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-400 hover:bg-accent-500/20 transition-colors"
            >
              <Crown className="h-3.5 w-3.5 inline mr-1" />
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Quick Scan Button */}
      <div className="mx-4 mb-6">
        <Link
          href="/scan"
          className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-4 font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/30 active:scale-[0.98] pulse-glow"
        >
          <ScanLine className="h-6 w-6" />
          Scan a Product
        </Link>
      </div>

      {/* Weekly Report */}
      <div className="mx-4 mb-6">
        <WeeklyReportCard />
      </div>

      {/* Recent Scans */}
      <div className="mx-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-dark-50">Recent Scans</h2>
          {recentScans.length > 0 && (
            <Link href="/history" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
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
        ) : recentScans.length > 0 ? (
          <div className="space-y-3">
            {recentScans.map((scan) => {
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
                      <span
                        className="text-xs font-medium"
                        style={{ color: info.color }}
                      >
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
          <div className="glass-card flex flex-col items-center p-8 text-center">
            <ScanLine className="mb-3 h-10 w-10 text-dark-600" />
            <p className="text-sm font-medium text-dark-400">No scans yet</p>
            <p className="mt-1 text-xs text-dark-500">
              Scan your first product to see results here
            </p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      {scanCount > 0 && (
        <div className="mx-4 mt-6 grid grid-cols-2 gap-3">
          <div className="glass-card p-4 text-center">
            <TrendingUp className="mx-auto mb-1 h-5 w-5 text-primary-400" />
            <p className="text-lg font-bold text-dark-50">{scanCount}</p>
            <p className="text-xs text-dark-500">Total Scans</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Zap className="mx-auto mb-1 h-5 w-5 text-accent-400" />
            <p className="text-lg font-bold text-dark-50">{freeScansLeft}</p>
            <p className="text-xs text-dark-500">Scans Left</p>
          </div>
        </div>
      )}

      <BottomNav />
      <PWAInstallBanner />
    </main>
  );
}
