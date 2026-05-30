"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/auth-actions";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Home,
  ScanLine,
  Clock,
  User,
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
} from "lucide-react";

interface ProfileClientProps {
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    free_scans_remaining: number;
    is_premium: boolean;
    created_at: string;
  };
  scanCount: number;
}

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
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    setLoggingOut(true);
    // Call the SERVER ACTION — signs out on the server (clears cookies)
    // and redirects to /login. If redirect happens, we won't reach the
    // line below.
    try {
      await logoutAction();
    } catch {
      // If something goes wrong, force navigation to login
      window.location.href = "/login";
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <button
          onClick={() => router.push("/home")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-dark-200">Profile</h1>
        <div className="w-9" />
      </header>

      <main className="px-4 py-6 pb-28 space-y-6">
        {/* ===== User Info Card ===== */}
        <section className="glass-card p-6 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 text-primary-400 text-2xl font-bold mb-4">
            {initials}
          </div>

          {/* Name & Email */}
          <h2 className="text-lg font-bold text-dark-50">{displayName}</h2>
          <p className="text-sm text-dark-400 mt-1">{profile.email}</p>

          {/* Premium Badge */}
          {profile.is_premium && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-medium text-accent-400">
              <Crown className="h-3 w-3" />
              Premium Member
            </span>
          )}

          {/* Edit Profile Button (Coming Soon) */}
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
            <ScanLine className="h-5 w-5 text-accent-400 mb-2" />
            <span className="text-xl font-bold text-dark-50">
              {profile.free_scans_remaining}
            </span>
            <span className="text-[10px] text-dark-400 mt-0.5">Free Left</span>
          </div>
          <div className="glass-card flex flex-col items-center p-4">
            <Calendar className="h-5 w-5 text-dark-400 mb-2" />
            <span className="text-xs font-bold text-dark-50">
              {formatMemberSince(profile.created_at)}
            </span>
            <span className="text-[10px] text-dark-400 mt-0.5">Member Since</span>
          </div>
        </section>

        {/* ===== Settings Section ===== */}
        <section>
          <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 px-1">
            Settings
          </h3>
          <div className="glass-card divide-y divide-dark-700">
            {/* Dietary Restrictions */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10">
                  <Shield className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">
                    Dietary Restrictions
                  </p>
                  <p className="text-xs text-dark-500">Manage your preferences</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-dark-600" />
            </div>

            {/* Allergen Alerts */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10">
                  <Bell className="h-4 w-4 text-accent-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">
                    Allergen Alerts
                  </p>
                  <p className="text-xs text-dark-500">Set your allergens</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-dark-600" />
            </div>

            {/* Theme */}
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
            <button
              disabled
              className="w-full rounded-xl bg-accent-500/10 py-2.5 text-sm font-medium text-accent-400 cursor-not-allowed"
            >
              Coming Soon
            </button>
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-800 bg-dark-900/90 backdrop-blur-xl pb-safe">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => router.push("/home")}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Home className="h-5 w-5 text-dark-500" />
            <span className="text-[10px] font-medium text-dark-500">Home</span>
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
            <User className="h-5 w-5 text-primary-500" />
            <span className="text-[10px] font-medium text-primary-500">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
