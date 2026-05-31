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
    gradient: "from-blue-400 to-blue-600",
  },
  {
    icon: Brain,
    title: "AI Food Verdict",
    desc: "Personalized AI analysis based on your dietary profile",
    gradient: "from-purple-400 to-purple-600",
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
    gradient: "from-red-400 to-red-600",
  },
  {
    icon: Star,
    title: "Priority Support",
    desc: "Get faster responses and early access to new features",
    gradient: "from-yellow-400 to-yellow-600",
  },
];

export default function PremiumClient({ scanCount, isPremium }: PremiumClientProps) {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <Link
          href="/home"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold text-dark-200">Upgrade</h1>
        <div className="w-9" />
      </header>

      <div className="px-4 py-8 space-y-8 pb-32">
        {/* ===== Hero Section ===== */}
        <section className="text-center">
          {/* Animated Crown Logo */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute h-28 w-28 rounded-full bg-accent-500/20 animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/30">
              <Crown className="h-10 w-10 text-dark-900" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-dark-50">
            {isPremium ? "You're Premium!" : "Go Premium"}
          </h1>

          {!isPremium && (
            <>
              <p className="text-accent-400 font-medium mt-2">
                You&apos;ve used all {scanCount} free scans!
              </p>
              <p className="text-dark-400 text-sm mt-1">
                Upgrade to unlock unlimited scans and powerful features
              </p>
            </>
          )}

          {isPremium && (
            <p className="text-primary-400 font-medium mt-2">
              You have unlimited scans and all premium features
            </p>
          )}
        </section>

        {/* ===== Free vs Premium Comparison ===== */}
        {!isPremium && (
          <section className="glass-card overflow-hidden">
            <div className="grid grid-cols-2">
              {/* Free Column */}
              <div className="p-4 border-r border-dark-700">
                <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3">Free</p>
                <div className="space-y-2.5">
                  <p className="text-sm text-dark-400 line-through">5 scans only</p>
                  <p className="text-sm text-dark-400 line-through">Basic health score</p>
                  <p className="text-sm text-dark-400 line-through">No weekly reports</p>
                  <p className="text-sm text-dark-400 line-through">No product comparison</p>
                </div>
              </div>
              {/* Premium Column */}
              <div className="p-4 bg-accent-500/5">
                <p className="text-xs font-semibold text-accent-400 uppercase tracking-wider mb-3">Premium</p>
                <div className="space-y-2.5">
                  <p className="text-sm text-dark-200 font-medium">Unlimited scans</p>
                  <p className="text-sm text-dark-200 font-medium">AI food verdict</p>
                  <p className="text-sm text-dark-200 font-medium">Weekly health reports</p>
                  <p className="text-sm text-dark-200 font-medium">Product comparison</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== Features Grid ===== */}
        <section>
          <h2 className="text-lg font-semibold text-dark-50 mb-4">
            {isPremium ? "Your Premium Features" : "What You Get"}
          </h2>
          <div className="space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="glass-card flex items-start gap-4 p-4"
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                  feature.gradient
                )}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">{feature.title}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Pricing Card ===== */}
        {!isPremium && (
          <section className="glass-card border-2 border-accent-500/30 p-6 text-center">
            <p className="text-xs text-accent-400 font-semibold uppercase tracking-wider mb-2">
              Premium Plan
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl font-bold text-dark-50">
                &#8377;199
              </span>
              <span className="text-dark-400 text-sm">/month</span>
            </div>
            <p className="text-xs text-dark-500 mb-6">
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
      </div>

      {/* ===== Bottom Navigation ===== */}
      <BottomNav />
    </main>
  );
}
