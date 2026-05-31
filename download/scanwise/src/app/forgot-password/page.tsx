"use client";

import { useState } from "react";
import { resetPassword } from "@/app/auth-actions";
import { ScanLine, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);
    const result = await resetPassword(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
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
          <h1 className="text-2xl font-bold text-dark-50">Reset Password</h1>
          <p className="text-sm text-dark-400">We&apos;ll send you a reset link</p>
        </div>

        {success ? (
          <div className="glass-card p-6 text-center">
            <div className="mb-3 text-3xl">&#9993;</div>
            <h2 className="mb-2 text-lg font-semibold text-primary-400">Check your email</h2>
            <p className="text-sm text-dark-400">
              We&apos;ve sent a password reset link to your email address. Click the link to set a new password.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="flex flex-col gap-4">
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

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
