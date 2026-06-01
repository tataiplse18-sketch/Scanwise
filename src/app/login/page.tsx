"use client";

import { useState } from "react";
import { loginAction } from "@/app/auth-actions";
import { cn } from "@/lib/utils";
import { Mail, Lock, Eye, EyeOff, ScanLine, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await loginAction(formData);

      if (result?.success) {
        window.location.href = "/home";
        return;
      }

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-dark-900">
      {/* Gradient Top Section */}
      <div className="relative overflow-hidden px-4 pt-16 pb-8">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-primary-500/[0.04] blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col items-center gap-4 page-transition">
          {/* Logo with animation */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/8 glow-primary">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400/10 to-primary-600/10" />
            <ScanLine className="relative h-8 w-8 text-primary-400" strokeWidth={1.5} />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-dark-50">
              Welcome Back
            </h1>
            <p className="text-sm text-dark-500 mt-1">
              Sign in to your <span className="gradient-text font-medium">ScanWise</span> account
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-4 pb-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-danger-500/8 border border-danger-500/15 px-4 py-3">
              <p className="text-danger-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-dark-300 text-xs font-medium uppercase tracking-wider">
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
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 pl-11 text-dark-50 placeholder-dark-600 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-dark-300 text-xs font-medium uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 pl-11 pr-11 text-dark-50 placeholder-dark-600 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all duration-200 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-xs text-dark-400 hover:text-primary-400 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2 active:scale-[0.97]"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-xs text-dark-600">or</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>

          {/* Signup Link */}
          <p className="text-center text-sm text-dark-500">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
