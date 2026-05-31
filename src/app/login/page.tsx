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
        // Full page reload → browser sends cookies with the request
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <h2 className="text-xl font-semibold text-dark-50 text-center">
            Welcome back
          </h2>

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

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-dark-300 text-sm font-medium">
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
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 pl-11 pr-11 text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
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

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Forgot password?
            </a>
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-dark-400">
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
