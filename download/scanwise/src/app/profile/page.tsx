"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  User,
  Mail,
  Edit3,
  Shield,
  Crown,
  ChevronRight,
  LogOut,
  Moon,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

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

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile({ ...profileData, email: user.email });
          setNameValue(profileData.full_name || "");
        } else {
          setProfile({ email: user.email, full_name: null, age: null, dietary_pref: null, allergens: [], scan_count: 0, is_premium: false });
        }
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function saveName() {
    if (!nameValue.trim()) return;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("profiles").update({ full_name: nameValue.trim() }).eq("id", user.id);
      setProfile((prev: any) => ({ ...prev, full_name: nameValue.trim() }));
      setEditingName(false);
    } catch {
      // Fallback
    }
  }

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      // Fallback
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-dark-900 pb-24 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary-500/30 border-t-primary-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-dark-50">Profile</h1>
      </div>

      {/* User Card */}
      <div className="mx-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10">
              <User className="h-7 w-7 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="flex-1 rounded-lg bg-dark-700/50 px-3 py-1.5 text-sm text-dark-50 outline-none border border-primary-500/30"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                  />
                  <button
                    onClick={saveName}
                    className="text-xs text-primary-400 font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-dark-50 truncate">
                    {profile?.full_name || "Set your name"}
                  </h2>
                  <button onClick={() => setEditingName(true)} className="text-dark-500 hover:text-dark-300">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-dark-400">{profile?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                {profile?.is_premium ? (
                  <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-[10px] font-semibold text-accent-400">
                    <Crown className="h-3 w-3 inline mr-0.5" />
                    Premium
                  </span>
                ) : (
                  <span className="rounded-full bg-dark-700/50 px-2 py-0.5 text-[10px] font-medium text-dark-400">
                    Free Plan
                  </span>
                )}
                <span className="text-dark-600">·</span>
                <span className="text-[10px] text-dark-500">{profile?.scan_count || 0} scans</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mx-4 space-y-2">
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 px-1">Account</p>

        <Link
          href="/premium"
          className="glass-card flex items-center gap-3 p-4 transition-colors hover:bg-dark-700/30"
        >
          <Crown className="h-5 w-5 text-accent-400" />
          <span className="flex-1 text-sm font-medium text-dark-50">
            {profile?.is_premium ? "Premium Active" : "Upgrade to Premium"}
          </span>
          <ChevronRight className="h-4 w-4 text-dark-600" />
        </Link>

        <Link
          href="/onboarding"
          className="glass-card flex items-center gap-3 p-4 transition-colors hover:bg-dark-700/30"
        >
          <Edit3 className="h-5 w-5 text-primary-400" />
          <span className="flex-1 text-sm font-medium text-dark-50">Edit Dietary Preferences</span>
          <ChevronRight className="h-4 w-4 text-dark-600" />
        </Link>
      </div>

      <div className="mx-4 mt-6 space-y-2">
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2 px-1">More</p>

        <div className="glass-card flex items-center gap-3 p-4">
          <Moon className="h-5 w-5 text-dark-400" />
          <span className="flex-1 text-sm font-medium text-dark-50">Dark Mode</span>
          <span className="text-xs text-dark-500">Always On</span>
        </div>

        <div className="glass-card flex items-center gap-3 p-4">
          <HelpCircle className="h-5 w-5 text-dark-400" />
          <span className="flex-1 text-sm font-medium text-dark-50">Help & Support</span>
          <ChevronRight className="h-4 w-4 text-dark-600" />
        </div>

        <div className="glass-card flex items-center gap-3 p-4">
          <FileText className="h-5 w-5 text-dark-400" />
          <span className="flex-1 text-sm font-medium text-dark-50">Privacy Policy</span>
          <ChevronRight className="h-4 w-4 text-dark-600" />
        </div>
      </div>

      {/* Logout */}
      <div className="mx-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl border border-danger-500/20 bg-danger-500/5 p-4 text-sm font-medium text-danger-400 transition-colors hover:bg-danger-500/10"
        >
          <LogOut className="h-4 w-4 inline mr-2" />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
