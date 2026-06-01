"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { showToast } from "@/components/Toast";
import {
  ArrowLeft,
  Trophy,
  Lock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AchievementWithProgress,
  AchievementCategory,
} from "@/types";
import {
  TIER_COLORS,
  CATEGORY_LABELS,
  getLevelFromXP,
  getXPForNextLevel,
} from "@/types";
import { checkAndUnlockAchievements } from "@/lib/achievements";

// Celebration Modal
interface CelebrationModalProps {
  achievement: {
    id: string;
    title: string;
    icon: string;
    points: number;
    description: string;
  };
  onDismiss: () => void;
}

function CelebrationModal({ achievement, onDismiss }: CelebrationModalProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-900/80 backdrop-blur-sm p-4">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              backgroundColor: [
                "#FFD700",
                "#CD7F32",
                "#C0C0C0",
                "#10b981",
                "#3b82f6",
                "#f59e0b",
              ][i % 6],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="glass-card-elevated p-8 text-center max-w-xs w-full relative animate-bounce-in border border-primary-500/20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 mx-auto mb-4 text-4xl">
          {achievement.icon}
        </div>
        <h2 className="text-lg font-bold text-dark-50 mb-1">
          Achievement Unlocked!
        </h2>
        <p className="text-sm font-semibold gradient-text mb-2">
          {achievement.title}
        </p>
        <p className="text-xs text-dark-400 mb-4">
          {achievement.description}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-400 mb-4">
          +{achievement.points} XP
        </span>
        <div>
          <button
            onClick={onDismiss}
            className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 py-2.5 text-sm font-bold text-white transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

// Achievement Card
function AchievementCard({
  achievement,
}: {
  achievement: AchievementWithProgress;
}) {
  const progressPercent = achievement.is_unlocked
    ? 100
    : Math.min(
        Math.round((achievement.progress / achievement.requirement) * 100),
        100
      );

  const tierColor = TIER_COLORS[achievement.tier];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        achievement.is_unlocked
          ? "bg-white/[0.04] border-primary-500/15 shadow-lg shadow-primary-500/5"
          : achievement.progress > 0
          ? "bg-white/[0.02] border-white/[0.06]"
          : "bg-white/[0.01] border-white/[0.03]"
      )}
    >
      {/* Icon + Tier */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl text-2xl",
            achievement.is_unlocked
              ? "bg-primary-500/8"
              : achievement.progress > 0
              ? "bg-white/[0.03]"
              : "bg-white/[0.02]"
          )}
        >
          {achievement.is_unlocked ? (
            achievement.icon
          ) : achievement.progress > 0 ? (
            <span className="opacity-40">{achievement.icon}</span>
          ) : (
            <Lock className="h-5 w-5 text-dark-600" />
          )}
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
          style={{
            backgroundColor: `${tierColor}10`,
            color: tierColor,
          }}
        >
          {achievement.tier}
        </span>
      </div>

      {/* Title */}
      <p
        className={cn(
          "text-xs font-semibold mb-0.5",
          achievement.is_unlocked
            ? "text-dark-50"
            : achievement.progress > 0
            ? "text-dark-200"
            : "text-dark-600"
        )}
      >
        {achievement.is_unlocked || achievement.progress > 0
          ? achievement.title
          : "???"}
      </p>

      {/* Description */}
      <p
        className={cn(
          "text-[10px] mb-2",
          achievement.is_unlocked
            ? "text-dark-400"
            : achievement.progress > 0
            ? "text-dark-500"
            : "text-dark-600"
        )}
      >
        {achievement.is_unlocked || achievement.progress > 0
          ? achievement.description
          : "Keep scanning to unlock"}
      </p>

      {/* Progress Bar */}
      {!achievement.is_unlocked && (
        <div className="mt-1">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-dark-500">
              {achievement.progress}/{achievement.requirement}
            </span>
            <span className="text-[10px] text-dark-500">
              {progressPercent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500/50 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* XP Badge (unlocked only) */}
      {achievement.is_unlocked && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/8 px-2 py-0.5 text-[10px] font-bold text-primary-400 mt-1">
          +{achievement.points} XP
        </span>
      )}
    </div>
  );
}

// Main Page
function AchievementsContent() {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [profile, setProfile] = useState<{
    xp_points: number;
    level: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | AchievementCategory>("all");
  const [celebration, setCelebration] = useState<{
    id: string;
    title: string;
    icon: string;
    points: number;
    description: string;
  } | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const newUnlocks = await checkAndUnlockAchievements(user.id);

      if (newUnlocks.length > 0) {
        setCelebration(newUnlocks[0]);
        if (newUnlocks.length > 1) {
          showToast({
            message: `${newUnlocks.length - 1} more achievement${newUnlocks.length > 2 ? "s" : ""} unlocked!`,
            type: "success",
          });
        }
      }

      const { data: allAchs } = await supabase
        .from("achievements")
        .select("*")
        .order("category", { ascending: true })
        .order("requirement", { ascending: true });

      const { data: userAchs } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);

      const userAchMap = new Map<string, { progress: number; is_unlocked: boolean; unlocked_at: string | null }>();
      (userAchs || []).forEach((ua: { achievement_id: string; progress: number; is_unlocked: boolean; unlocked_at: string | null }) => {
        userAchMap.set(ua.achievement_id, {
          progress: ua.progress,
          is_unlocked: ua.is_unlocked,
          unlocked_at: ua.unlocked_at,
        });
      });

      const { data: prof } = await supabase
        .from("profiles")
        .select("xp_points, level")
        .eq("id", user.id)
        .single();

      setProfile(prof ?? { xp_points: 0, level: 1 });

      if (allAchs) {
        const { count: healthyCount } = await supabase
          .from("scans")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("health_score", 61);

        const { count: junkCount } = await supabase
          .from("scans")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .lt("health_score", 30);

        const { data: profData } = await supabase
          .from("profiles")
          .select("scan_count, is_premium, current_streak, shares_count, compares_count")
          .eq("id", user.id)
          .single();

        const achsWithProgress: AchievementWithProgress[] = allAchs.map((ach: AchievementWithProgress) => {
          const existing = userAchMap.get(ach.id);
          let calculatedProgress = 0;

          if (ach.category === "scans") calculatedProgress = profData?.scan_count ?? 0;
          else if (ach.category === "health") {
            if (ach.id.startsWith("healthy_")) calculatedProgress = healthyCount ?? 0;
            else if (ach.id.startsWith("avoid_junk_")) calculatedProgress = junkCount ?? 0;
          } else if (ach.category === "streak") calculatedProgress = profData?.current_streak ?? 0;
          else if (ach.category === "social") {
            if (ach.id.startsWith("compare_")) calculatedProgress = profData?.compares_count ?? 0;
            else if (ach.id.startsWith("share_")) calculatedProgress = profData?.shares_count ?? 0;
          } else if (ach.category === "premium") calculatedProgress = (profData?.is_premium ?? false) ? 1 : 0;

          return {
            ...ach,
            progress: existing?.is_unlocked
              ? ach.requirement
              : Math.min(calculatedProgress, ach.requirement),
            is_unlocked: existing?.is_unlocked ?? false,
            unlocked_at: existing?.unlocked_at ?? null,
          };
        });

        setAchievements(achsWithProgress);
      }
    } catch (err) {
      console.error("Failed to load achievements:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredAchievements =
    activeFilter === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeFilter);

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;
  const totalXP = profile?.xp_points ?? 0;
  const level = profile?.level ?? getLevelFromXP(totalXP);
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = getXPForNextLevel(level);
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpPercent = Math.min(Math.round((xpInCurrentLevel / xpForNextLevel) * 100), 100);

  const filterTabs: Array<{ key: "all" | AchievementCategory; label: string }> = [
    { key: "all", label: "All" },
    { key: "scans", label: "Scans" },
    { key: "health", label: "Health" },
    { key: "streak", label: "Streaks" },
    { key: "social", label: "Social" },
    { key: "premium", label: "Premium" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 pb-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Celebration Modal */}
      {celebration && (
        <CelebrationModal
          achievement={celebration}
          onDismiss={() => setCelebration(null)}
        />
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-white/[0.04] bg-dark-900/80 backdrop-blur-xl">
        <Link
          href="/home"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold text-dark-300">Achievements</h1>
        <div className="w-9" />
      </header>

      <main className="px-4 py-6 pb-28 space-y-6">
        {/* Level + XP Progress */}
        <section className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/8">
              <Trophy className="h-6 w-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-50">
                Level {level}
              </p>
              <p className="text-xs text-dark-400">
                {totalXP} XP total
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold gradient-text">{unlockedCount}</p>
              <p className="text-[10px] text-dark-500">Unlocked</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-dark-500">
                {xpInCurrentLevel} / {xpForNextLevel} XP
              </span>
              <span className="text-[10px] text-primary-400">
                Level {level + 1}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap",
                activeFilter === key
                  ? "bg-primary-500 text-white"
                  : "bg-white/[0.04] text-dark-500 hover:text-dark-300"
              )}
            >
              {label}
            </button>
          ))}
        </section>

        {/* Achievement Grid */}
        <section className="grid grid-cols-2 gap-3">
          {filteredAchievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </section>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03]">
              <Trophy className="h-8 w-8 text-dark-600" />
            </div>
            <p className="text-dark-500 text-sm">
              No achievements in this category yet
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <AchievementsContent />
    </Suspense>
  );
}
