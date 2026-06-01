"use client";

import { useState } from "react";
import { signupAction } from "@/app/auth-actions";
import { cn } from "@/lib/utils";
import { Mail, Lock, Eye, EyeOff, ScanLine, Loader2, User } from "lucide-react";

export default function SignupPage() {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    try {
      const result = await signupAction(formData);

      if (result?.success) {
        window.location.href = "/home";
        return;
      }

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.emailConfirmation) {
        setSuccessEmail(result.email ?? email);
        setSuccess(true);
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // Success state - email verification message
  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass-card-elevated p-8 text-center space-y-4 page-transition">
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
              className="inline-flex w-full items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.97] mt-4"
            >
              Back to Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-dark-900">
      {/* Gradient Top Section */}
      <div className="relative overflow-hidden px-4 pt-16 pb-8">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-primary-500/[0.04] blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col items-center gap-4 page-transition">
          {/* Logo */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/8 glow-primary">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400/10 to-primary-600/10" />
            <ScanLine className="relative h-8 w-8 text-primary-400" strokeWidth={1.5} />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-dark-50">
              Create Account
            </h1>
            <p className="text-sm text-dark-500 mt-1">
              Start your journey with <span className="gradient-text font-medium">ScanWise</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-4 pb-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-danger-500/8 border border-danger-500/15 px-4 py-3">
              <p className="text-danger-400 text-sm">{error}</p>
            </div>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-dark-300 text-xs font-medium uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 pl-11 text-dark-50 placeholder-dark-600 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

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
                placeholder="At least 8 characters"
                required
                minLength={8}
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-dark-300 text-xs font-medium uppercase tracking-wider">
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
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 pl-11 pr-11 text-dark-50 placeholder-dark-600 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all duration-200 text-sm"
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
              "w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2 active:scale-[0.97]"
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

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-xs text-dark-600">or</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-dark-500">
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
