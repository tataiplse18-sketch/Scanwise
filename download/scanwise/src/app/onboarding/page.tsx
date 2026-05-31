"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Cake,
  Leaf,
} from "lucide-react";

const DIETARY_OPTIONS = [
  { value: "none", label: "No Preference", emoji: "🍽️" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥬" },
  { value: "vegan", label: "Vegan", emoji: "🌱" },
  { value: "keto", label: "Keto", emoji: "🥑" },
  { value: "paleo", label: "Paleo", emoji: "🥩" },
  { value: "halal", label: "Halal", emoji: "🕌" },
  { value: "kosher", label: "Kosher", emoji: "✡️" },
  { value: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { value: "dairy-free", label: "Dairy-Free", emoji: "🥛" },
];

const ALLERGEN_OPTIONS = [
  { value: "peanuts", label: "Peanuts", emoji: "🥜" },
  { value: "dairy", label: "Dairy", emoji: "🥛" },
  { value: "gluten", label: "Gluten", emoji: "🌾" },
  { value: "soy", label: "Soy", emoji: "🫘" },
  { value: "eggs", label: "Eggs", emoji: "🥚" },
  { value: "fish", label: "Fish", emoji: "🐟" },
  { value: "shellfish", label: "Shellfish", emoji: "🦐" },
  { value: "tree-nuts", label: "Tree Nuts", emoji: "🌰" },
  { value: "sesame", label: "Sesame", emoji: "🫘" },
  { value: "mustard", label: "Mustard", emoji: "🌶️" },
  { value: "celery", label: "Celery", emoji: "🥬" },
  { value: "sulphites", label: "Sulphites", emoji: "🧪" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [dietaryPref, setDietaryPref] = useState("none");
  const [allergens, setAllergens] = useState<string[]>([]);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_done, full_name, age, dietary_pref, allergens")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_done) {
          window.location.href = "/home";
          return;
        }

        // Pre-fill if exists
        if (profile?.full_name) setFullName(profile.full_name);
        if (profile?.age) setAge(String(profile.age));
        if (profile?.dietary_pref) setDietaryPref(profile.dietary_pref);
        if (profile?.allergens?.length) setAllergens(profile.allergens);
      } catch {
        // Profile doesn't exist yet, that's fine
      }
    }

    checkOnboarding();
  }, []);

  function toggleAllergen(value: string) {
    setAllergens((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Upsert profile
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName || null,
        age: age ? parseInt(age) : null,
        dietary_pref: dietaryPref,
        allergens: allergens,
        onboarding_done: true,
      });

      window.location.href = "/home";
    } catch {
      setLoading(false);
    }
  }

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <main className="min-h-screen bg-dark-900 flex flex-col">
      {/* Progress Bar */}
      <div className="px-4 pt-6">
        <div className="h-1 rounded-full bg-dark-700">
          <div
            className="h-1 rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-dark-500">Step {step} of {totalSteps}</span>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs text-dark-400 hover:text-dark-200 flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm page-transition">
          {/* Step 1: Name & Age */}
          {step === 1 && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10">
                  <User className="h-8 w-8 text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-dark-50">About You</h1>
                <p className="mt-2 text-sm text-dark-400">Let&apos;s personalize your experience</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-dark-400">
                    Full Name
                  </label>
                  <div className="glass-card flex items-center gap-3 px-4 py-3">
                    <User className="h-5 w-5 text-dark-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-dark-400">
                    Age
                  </label>
                  <div className="glass-card flex items-center gap-3 px-4 py-3">
                    <Cake className="h-5 w-5 text-dark-500" />
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                      className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-600"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Step 2: Dietary Preference */}
          {step === 2 && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10">
                  <Leaf className="h-8 w-8 text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-dark-50">Dietary Preference</h1>
                <p className="mt-2 text-sm text-dark-400">Select your eating style</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {DIETARY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDietaryPref(option.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      dietaryPref === option.value
                        ? "border-primary-500/50 bg-primary-500/10"
                        : "border-dark-700/50 bg-dark-800/50 hover:border-dark-600"
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span
                      className={`text-xs font-medium ${
                        dietaryPref === option.value ? "text-primary-400" : "text-dark-300"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-600"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Step 3: Allergens */}
          {step === 3 && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500/10">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-dark-50">Allergens</h1>
                <p className="mt-2 text-sm text-dark-400">
                  Select any allergens you have (optional)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((option) => {
                  const isSelected = allergens.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleAllergen(option.value)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-danger-500/50 bg-danger-500/10 text-danger-400"
                          : "border-dark-700/50 bg-dark-800/50 text-dark-300 hover:border-dark-600"
                      }`}
                    >
                      <span>{option.emoji}</span>
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleComplete}
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Get Started <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
