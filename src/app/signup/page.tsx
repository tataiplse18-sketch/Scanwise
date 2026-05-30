"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Mail, Lock, Eye, EyeOff, ScanLine, Loader2 } from "lucide-react";

export default function SignupPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  function validateForm(): string | null {
    if (!fullName.trim()) {
      return "Full name is required.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Check if email confirmation is required
      // If data.session exists, user is auto-confirmed and logged in
      if (data.session) {
        // Auto-confirmed — redirect to home
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.href = "/home";
        return;
      }

      // Email confirmation required — show success message
      setSuccessEmail(email);
      setSuccess(true);
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  // Success state - email verification message
  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
              <Mail className="h-8 w-8 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-dark-50">
              Check your email
            </h2>
            <p className="text-dark-400 text-sm leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <span className="text-primary-400 font-medium">{successEmail}</span>.
              Please check your inbox and click the link to verify your account.
            </p>
            <a
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors mt-4"
            >
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <h2 className="text-xl font-semibold text-dark-50 text-center">
            Create your account
          </h2>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-danger-500/10 border border-danger-500/20 px-4 py-3">
              <p className="text-danger-400 text-sm">{error}</p>
            </div>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-dark-300 text-sm font-medium">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
            />
          </div>

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
                placeholder="At least 8 characters"
                required
                minLength={8}
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-dark-300 text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={8}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 pl-11 pr-11 text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-dark-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
