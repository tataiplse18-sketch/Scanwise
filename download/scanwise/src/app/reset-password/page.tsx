"use client";

import { useState } from "react";
import { updatePassword } from "@/app/auth-actions";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await updatePassword(formData);
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
        {success ? (
          <div className="glass-card p-6 text-center">
            <div className="mb-3 text-3xl">&#10003;</div>
            <h2 className="mb-2 text-lg font-semibold text-primary-400">Password Updated</h2>
            <p className="text-sm text-dark-400">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-50">Set New Password</h1>
              <p className="text-sm text-dark-400">Enter your new password below</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="flex flex-col gap-4">
              <div className="glass-card flex items-center gap-3 px-4 py-3">
                <Lock className="h-5 w-5 text-dark-400" />
                <input
                  name="password"
                  type="password"
                  placeholder="New password (min 6 chars)"
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
                    Update Password <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
