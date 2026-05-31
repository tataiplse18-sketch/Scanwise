"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  Crown,
  Zap,
  Infinity,
  BarChart3,
  Shield,
  Star,
  Check,
  ArrowLeft,
} from "lucide-react";

export default function PremiumPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium, scan_count")
          .eq("id", user.id)
          .single();

        if (profile) {
          setIsPremium(profile.is_premium);
          setScanCount(profile.scan_count);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const freeScansLeft = Math.max(0, 5 - scanCount);

  const features = [
    { icon: Infinity, label: "Unlimited Scans", desc: "No daily or monthly limits" },
    { icon: BarChart3, label: "Weekly Reports", desc: "Detailed health trend analysis" },
    { icon: Shield, label: "AI Verdicts", desc: "Personalized health recommendations" },
    { icon: Star, label: "Priority Support", desc: "Get help faster when you need it" },
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
        <h1 className="text-xl font-bold text-dark-50">Premium</h1>
      </div>

      {isPremium ? (
        /* Already Premium */
        <div className="mx-4">
          <div className="glass-card border border-accent-500/20 p-6 text-center glow-accent">
            <Crown className="mx-auto mb-3 h-12 w-12 text-accent-400" />
            <h2 className="text-xl font-bold gradient-text">You&apos;re Premium!</h2>
            <p className="mt-2 text-sm text-dark-400">
              Enjoy unlimited scans and all premium features
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-500/15 px-4 py-2 text-sm font-medium text-accent-400">
              <Infinity className="h-4 w-4" />
              Unlimited Scans Active
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Current Plan */}
          <div className="mx-4 mb-6">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-400">Free Plan</p>
                  <p className="text-2xl font-bold text-dark-50">{freeScansLeft}</p>
                  <p className="text-xs text-dark-500">scans remaining</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-700/50">
                  <Zap className="h-8 w-8 text-dark-500" />
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-dark-700">
                <div
                  className="h-2 rounded-full bg-primary-500 transition-all"
                  style={{ width: `${(freeScansLeft / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="mx-4 mb-6">
            <div className="rounded-2xl border border-accent-500/20 bg-gradient-to-b from-accent-500/5 to-transparent p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-6 w-6 text-accent-400" />
                <h2 className="text-lg font-bold text-dark-50">Go Premium</h2>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.label} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/10">
                        <Icon className="h-4 w-4 text-accent-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-50">{feature.label}</p>
                        <p className="text-xs text-dark-400">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                <p className="text-3xl font-extrabold text-dark-50">
                  $4.99<span className="text-sm font-normal text-dark-400">/month</span>
                </p>
              </div>

              {/* CTA */}
              <button className="w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/20 transition-all hover:shadow-accent-500/30 active:scale-[0.98]">
                <Crown className="h-4 w-4 inline mr-2" />
                Upgrade Now
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </main>
  );
}
