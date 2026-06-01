"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ScanLine,
  Brain,
  ShieldCheck,
  GitCompare,
  Search,
  ChevronRight,
  Star,
  Users,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace("/home");
        }
      } catch {
        // Not logged in — stay on landing
      }
    }
    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/[0.04] blur-[120px] pointer-events-none" />

        <div className="relative max-w-lg mx-auto text-center page-transition">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-500/8 glow-primary">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400/10 to-primary-600/10" />
              <ScanLine className="relative h-10 w-10 text-primary-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* App Name */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="gradient-text">ScanWise</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-dark-300 font-medium mb-3">
            Scan Any Food. Know What You Eat.
          </p>
          <p className="text-sm text-dark-500 max-w-sm mx-auto mb-10">
            Get instant health scores, AI-powered ingredient analysis, and personalized dietary insights — just by scanning a barcode.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 transition-all duration-200 active:scale-[0.97] glow-primary"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-white/[0.06] transition-all duration-200 active:scale-[0.97]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="px-4 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              icon={<Brain className="h-5 w-5" />}
              title="AI Health Score"
              desc="Instant 0-100 rating"
              color="primary"
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Ingredient Analysis"
              desc="Risk-level breakdown"
              color="primary"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Allergen Alerts"
              desc="Personalized warnings"
              color="accent"
            />
            <FeatureCard
              icon={<GitCompare className="h-5 w-5" />}
              title="Smart Comparison"
              desc="Side-by-side choices"
              color="accent"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="glass-card p-6 text-center">
            <p className="text-sm font-medium text-dark-400 mb-6">
              Join <span className="text-primary-400 font-semibold">10,000+</span> healthy eaters
            </p>
            <div className="grid grid-cols-3 gap-4">
              <StatItem icon={<Users className="h-4 w-4" />} value="10K+" label="Users" />
              <StatItem icon={<ScanLine className="h-4 w-4" />} value="500K+" label="Scans" />
              <StatItem icon={<Star className="h-4 w-4" />} value="4.8" label="Rating" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 pb-20">
        <div className="max-w-lg mx-auto">
          <h2 className="text-center text-xl font-bold text-dark-50 mb-8">
            How It Works
          </h2>
          <div className="space-y-4">
            <StepCard step={1} title="Scan" desc="Point your camera at any food barcode" />
            <StepCard step={2} title="Analyze" desc="AI breaks down ingredients, nutrition & risks" />
            <StepCard step={3} title="Choose Wisely" desc="Make informed decisions about what you eat" />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="glass-card-elevated p-8">
            <h2 className="text-2xl font-bold text-dark-50 mb-2">
              Start Eating Smarter Today
            </h2>
            <p className="text-sm text-dark-400 mb-6">
              It&apos;s free to start. No credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 transition-all duration-200 active:scale-[0.97] glow-primary"
            >
              Create Free Account
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] px-4 py-8">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary-400" strokeWidth={1.5} />
            <span className="text-sm font-semibold gradient-text">ScanWise</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-dark-500">
            <span className="hover:text-dark-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-dark-300 transition-colors cursor-pointer">Terms of Service</span>
          </div>
          <p className="text-[10px] text-dark-600">
            © 2024 ScanWise. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "primary" | "accent";
}) {
  return (
    <div className="glass-card p-5 hover:border-white/[0.1] transition-all duration-200">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${
          color === "primary"
            ? "bg-primary-500/8 text-primary-400"
            : "bg-accent-500/8 text-accent-400"
        }`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-dark-50 mb-1">{title}</p>
      <p className="text-xs text-dark-500">{desc}</p>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-dark-400 mb-1">{icon}</div>
      <p className="text-lg font-bold text-dark-50">{value}</p>
      <p className="text-[10px] text-dark-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass-card flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-sm font-bold text-primary-400">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-dark-50">{title}</p>
        <p className="text-xs text-dark-400">{desc}</p>
      </div>
    </div>
  );
}
