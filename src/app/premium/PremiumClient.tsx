"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Crown,
  Zap,
  BarChart3,
  GitCompare,
  Brain,
  ArrowLeft,
  Shield,
  Star,
  Check,
  X,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface PremiumClientProps {
  scanCount: number;
  isPremium: boolean;
}

const PREMIUM_FEATURES = [
  {
    icon: Zap,
    title: "Unlimited Scans",
    desc: "Scan as many products as you want, no daily limits",
    gradient: "from-primary-400 to-primary-600",
  },
  {
    icon: BarChart3,
    title: "Weekly Health Reports",
    desc: "Detailed nutrition insights and trends sent to your inbox",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    icon: Brain,
    title: "AI Food Verdict",
    desc: "Personalized AI analysis based on your dietary profile",
    gradient: "from-violet-400 to-violet-600",
  },
  {
    icon: GitCompare,
    title: "Product Comparison",
    desc: "Compare two products side-by-side to make smarter choices",
    gradient: "from-accent-400 to-accent-600",
  },
  {
    icon: Shield,
    title: "Allergen Alerts Pro",
    desc: "Real-time alerts for your specific allergens and dietary restrictions",
    gradient: "from-rose-400 to-rose-600",
  },
  {
    icon: Star,
    title: "Priority Support",
    desc: "Get faster responses and early access to new features",
    gradient: "from-amber-400 to-amber-600",
  },
];

const COMPARISON_ITEMS = [
  { label: "Scans", free: "5 only", premium: "Unlimited" },
  { label: "Health Score", free: "Basic", premium: "AI Verdict" },
  { label: "Weekly Reports", free: "No", premium: "Yes" },
  { label: "Comparison", free: "No", premium: "Yes" },
];

export default function PremiumClient({ scanCount, isPremium }: PremiumClientProps) {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-white/[0.04] bg-dark-900/80 backdrop-blur-xl">
        <Link
          href="/home"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold text-dark-300">Premium</h1>
        <div className="w-9" />
      </header>

      <div className="px-4 py-8 space-y-8 pb-32">
        {/* Hero Section */}
        <section className="text-center">
          {/* Animated Crown */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute h-28 w-28 rounded-full bg-accent-500/15 animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/20">
              <Crown className="h-10 w-10 text-dark-900" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-dark-50">
            {isPremium ? "You're Premium!" : "Go Premium"}
          </h1>

          {!isPremium && (
            <>
              <p className="text-accent-400 font-medium mt-2 text-sm">
                You&apos;ve used {scanCount} of 5 free scans
              </p>
              <p className="text-dark-500 text-sm mt-1">
                Unlock unlimited scans and powerful features
              </p>
            </>
          )}

          {isPremium && (
            <p className="text-primary-400 font-medium mt-2 text-sm">
              You have unlimited scans and all premium features
            </p>
          )}
        </section>

        {/* Free vs Premium Comparison */}
        {!isPremium && (
          <section className="glass-card overflow-hidden">
            <div className="grid grid-cols-3">
              {/* Header Row */}
              <div className="p-3 border-b border-white/[0.04]" />
              <div className="p-3 border-b border-white/[0.04] text-center">
                <p className="text-[10px] font-semibold text-dark-500 uppercase tracking-widest">Free</p>
              </div>
              <div className="p-3 border-b border-white/[0.04] bg-accent-500/[0.03] text-center">
                <p className="text-[10px] font-semibold text-accent-400 uppercase tracking-widest">Premium</p>
              </div>

              {/* Rows */}
              {COMPARISON_ITEMS.map((item) => (
                <>
                  <div key={`label-${item.label}`} className="p-3 text-xs text-dark-300 border-b border-white/[0.03]">
                    {item.label}
                  </div>
                  <div key={`free-${item.label}`} className="p-3 text-center border-b border-white/[0.03]">
                    <X className="h-4 w-4 text-dark-600 mx-auto" />
                  </div>
                  <div key={`premium-${item.label}`} className="p-3 text-center border-b border-white/[0.03] bg-accent-500/[0.03]">
                    <Check className="h-4 w-4 text-accent-400 mx-auto" />
                  </div>
                </>
              ))}
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section>
          <h2 className="text-base font-semibold text-dark-50 mb-4">
            {isPremium ? "Your Premium Features" : "What You Get"}
          </h2>
          <div className="space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="glass-card flex items-start gap-4 p-4 hover:border-white/[0.1] transition-all duration-200"
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                  feature.gradient
                )}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">{feature.title}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Card */}
        {!isPremium && (
          <section className="glass-card-elevated border-2 border-accent-500/20 p-6 text-center">
            <p className="text-[10px] text-accent-400 font-semibold uppercase tracking-widest mb-2">
              Premium Plan
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl font-bold text-dark-50">
                &#8377;199
              </span>
              <span className="text-dark-500 text-sm">/month</span>
            </div>
            <p className="text-xs text-dark-600 mb-6">
              Cancel anytime. No hidden fees.
            </p>
            <button
              disabled
              className="w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-dark-900 cursor-not-allowed opacity-80"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4" />
                Upgrade to Premium
              </span>
            </button>
            <p className="text-[10px] text-dark-600 mt-2">
              Payment integration coming soon
            </p>
          </section>
        )}

        {/* Already Premium state */}
        {isPremium && (
          <section className="glass-card-elevated border border-primary-500/15 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10 mx-auto mb-3">
              <Crown className="h-6 w-6 text-primary-400" />
            </div>
            <p className="text-sm font-medium text-primary-400">
              You have access to all premium features
            </p>
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
