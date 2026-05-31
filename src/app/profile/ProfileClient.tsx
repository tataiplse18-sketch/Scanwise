"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/auth-actions";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  LogOut,
  Edit3,
  Shield,
  Bell,
  Moon,
  ChevronRight,
  Crown,
  Calendar,
  Scan,
  Loader2,
  Leaf,
  Zap,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface ProfileClientProps {
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    scan_count: number;
    is_premium: boolean;
    dietary_pref: string | null;
    allergens: string[];
    onboarding_done: boolean;
    created_at: string;
  };
  scanCount: number;
}

const DIETARY_LABELS: Record<string, { label: string; emoji: string }> = {
  veg: { label: "Vegetarian", emoji: "🥬" },
  eggetarian: { label: "Eggetarian", emoji: "🥚" },
  "non-veg": { label: "Non-Vegetarian", emoji: "🍗" },
  vegan: { label: "Vegan", emoji: "🌱" },
  jain: { label: "Jain", emoji: "🙏" },
};

const ALLERGEN_LABELS: Record<string, string> = {
  peanuts: "🥜 Peanuts",
  dairy: "🥛 Dairy",
  gluten: "🌾 Gluten",
  soy: "🫘 Soy",
  shellfish: "🦐 Shellfish",
  eggs: "🥚 Eggs",
  "tree-nuts": "🌰 Tree Nuts",
  fish: "🐟 Fish",
  sesame: "⚪ Sesame",
  mustard: "🟡 Mustard",
};

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfileClient({
  profile,
  scanCount,
}: ProfileClientProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const freeScansLeft = profile.is_premium ? Infinity : Math.max(0, 5 - (profile.scan_count ?? 0));
  const dietaryInfo = profile.dietary_pref ? DIETARY_LABELS[profile.dietary_pref] : null;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const result = await logoutAction();
      if (result?.success) {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
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
        <h1 className="text-sm font-semibold text-dark-200">Profile</h1>
        <div className="w-9" />
      </header>

      <main className="px-4 py-6 pb-28 space-y-6">
        {/* ===== User Info Card ===== */}
        <section className="glass-card p-6 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 text-primary-400 text-2xl font-bold mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-dark-50">{displayName}</h2>
          <p className="text-sm text-dark-400 mt-1">{profile.email}</p>

          {/* Premium Badge */}
          {profile.is_premium && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-medium text-accent-400">
              <Crown className="h-3 w-3" />
              Premium Member
            </span>
          )}

          {/* Dietary Preference Badge */}
          {dietaryInfo && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400">
              <Leaf className="h-3 w-3" />
              {dietaryInfo.emoji} {dietaryInfo.label}
            </span>
          )}

          <div className="relative mt-4 group">
            <button
              disabled
              className="flex items-center gap-2 rounded-xl bg-dark-800 px-5 py-2.5 text-sm font-medium text-dark-400 cursor-not-allowed"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-dark-700 px-2.5 py-1 text-[10px] font-medium text-dark-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Coming Soon
            </span>
          </div>
        </section>

        {/* ===== Stats Row ===== */}
        <section className="grid grid-cols-3 gap-3">
          <div className="glass-card flex flex-col items-center p-4">
            <Scan className="h-5 w-5 text-primary-400 mb-2" />
            <span className="text-xl font-bold text-dark-50">{scanCount}</span>
            <span className="text-[10px] text-dark-400 mt-0.5">Total Scans</span>
          </div>
          <div className="glass-card flex flex-col items-center p-4">
            <Zap className="h-5 w-5 text-accent-400 mb-2" />
            <span className="text-xl font-bold text-dark-50">
              {profile.is_premium ? "∞" : freeScansLeft}
            </span>
            <span className="text-[10px] text-dark-400 mt-0.5">
              {profile.is_premium ? "Unlimited" : "Free Left"}
            </span>
          </div>
          <div className="glass-card flex flex-col items-center p-4">
            <Calendar className="h-5 w-5 text-dark-400 mb-2" />
            <span className="text-xs font-bold text-dark-50">
              {formatMemberSince(profile.created_at)}
            </span>
            <span className="text-[10px] text-dark-400 mt-0.5">Member Since</span>
          </div>
        </section>

        {/* ===== Allergens Section ===== */}
        {profile.allergens && profile.allergens.length > 0 && (
          <section className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-accent-400" />
              <h3 className="text-sm font-semibold text-dark-200">Your Allergens</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="inline-flex items-center gap-1 rounded-xl bg-accent-500/10 border border-accent-500/20 px-3 py-1.5 text-xs font-medium text-accent-400"
                >
                  {ALLERGEN_LABELS[allergen] || allergen}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ===== Settings Section ===== */}
        <section>
          <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 px-1">
            Settings
          </h3>
          <div className="glass-card divide-y divide-dark-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10">
                  <Shield className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">
                    Dietary Restrictions
                  </p>
                  <p className="text-xs text-dark-500">{dietaryInfo ? `${dietaryInfo.emoji} ${dietaryInfo.label}` : "Not set"}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-dark-600" />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10">
                  <Bell className="h-4 w-4 text-accent-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">
                    Allergen Alerts
                  </p>
                  <p className="text-xs text-dark-500">
                    {profile.allergens?.length ?? 0} allergen{profile.allergens?.length !== 1 ? "s" : ""} set
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-dark-600" />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-600/30">
                  <Moon className="h-4 w-4 text-dark-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">Theme</p>
                  <p className="text-xs text-dark-500">Currently: Dark</p>
                </div>
              </div>
              <span className="rounded-full bg-primary-500/15 px-2.5 py-0.5 text-xs font-medium text-primary-400">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* ===== Upgrade Card (if not premium) ===== */}
        {!profile.is_premium && (
          <section className="glass-card p-5 border-accent-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="h-5 w-5 text-accent-400" />
              <h3 className="text-sm font-semibold text-dark-200">
                Upgrade to Premium
              </h3>
            </div>
            <p className="text-xs text-dark-400 mb-4">
              Get unlimited scans, advanced ingredient analysis, and personalized
              dietary recommendations.
            </p>
            <Link
              href="/premium"
              className="block w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-2.5 text-sm font-bold text-dark-900 hover:opacity-90 transition-opacity text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4" />
                Upgrade - ₹199/month
              </span>
            </Link>
          </section>
        )}

        {/* ===== Logout Button ===== */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-danger-500/10 py-3.5 text-sm font-medium text-danger-400 transition-colors",
            "hover:bg-danger-500/15",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loggingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Log Out
            </>
          )}
        </button>
      </main>

      {/* ===== Bottom Navigation ===== */}
      <BottomNav />
    </div>
  );
}
