"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4">
      <div className="flex flex-col items-center gap-6 page-transition">
        {/* Logo Icon */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-500/10 glow-primary">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-400/20 to-primary-600/20" />
          <ScanLine className="h-12 w-12 text-primary-400" strokeWidth={1.5} />
        </div>

        {/* App Name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">ScanWise</span>
          </h1>
          <p className="text-sm text-dark-400">
            Know what you&apos;re really eating
          </p>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center gap-2 text-dark-500">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
          <div
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </main>
  );
}
