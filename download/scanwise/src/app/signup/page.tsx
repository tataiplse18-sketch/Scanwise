"use client";

import { useState } from "react";
import { signup } from "@/app/auth-actions";
import { ScanLine, Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await signup(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      window.location.href = "/onboarding";
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-sm page-transition">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 glow-primary">
            <ScanLine className="h-8 w-8 text-primary-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Create Account</span>
          </h1>
          <p className="text-sm text-dark-400">Start scanning and eating smarter</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <User className="h-5 w-5 text-dark-400" />
            <input
              name="full_name"
              type="text"
              placeholder="Full name"
              required
              className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
            />
          </div>

          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <Mail className="h-5 w-5 text-dark-400" />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
            />
          </div>

          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <Lock className="h-5 w-5 text-dark-400" />
            <input
              name="password"
              type="password"
              placeholder="Password (min 6 chars)"
              required
              minLength={6}
              className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Create Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-dark-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
