"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Mail, ArrowLeft, ScanLine, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Success state - reset link sent confirmation
  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
              <Mail className="h-8 w-8 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-dark-50">
              Reset link sent!
            </h2>
            <p className="text-dark-400 text-sm leading-relaxed">
              Password reset link sent to{" "}
              <span className="text-primary-400 font-medium">{email}</span>.
              Check your inbox and follow the instructions to reset your
              password.
            </p>
            <a
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 glow-primary">
            <ScanLine className="h-8 w-8 text-primary-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">ScanWise</span>
          </h1>
          <p className="text-sm text-dark-400">
            Know what you&apos;re really eating
          </p>
        </div>

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <h2 className="text-xl font-semibold text-dark-50 text-center">
            Forgot your password?
          </h2>
          <p className="text-dark-400 text-sm text-center">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-danger-500/10 border border-danger-500/20 px-4 py-3">
              <p className="text-danger-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-dark-300 text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 pl-11 text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          {/* Back to Login Link */}
          <a
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </a>
        </form>
      </div>
    </main>
  );
}
