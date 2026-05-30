"use client";

import { useState } from "react";
import { saveOnboardingAction } from "@/app/auth-actions";
import { cn } from "@/lib/utils";
import {
  ScanLine,
  User,
  Utensils,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
} from "lucide-react";

interface OnboardingClientProps {
  defaultName: string;
}

// Dietary preference options
const DIETARY_OPTIONS = [
  { id: "veg", label: "Vegetarian", emoji: "🥬", desc: "No meat or fish" },
  { id: "non-veg", label: "Non-Vegetarian", emoji: "🍗", desc: "All food types" },
  { id: "vegan", label: "Vegan", emoji: "🌱", desc: "No animal products" },
  { id: "jain", label: "Jain", emoji: "🙏", desc: "No root vegetables" },
] as const;

// Allergen options
const ALLERGEN_OPTIONS = [
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "dairy", label: "Dairy", emoji: "🥛" },
  { id: "gluten", label: "Gluten", emoji: "🌾" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "tree-nuts", label: "Tree Nuts", emoji: "🌰" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "sesame", label: "Sesame", emoji: "⚪" },
  { id: "mustard", label: "Mustard", emoji: "🟡" },
] as const;

const TOTAL_STEPS = 3;

export default function OnboardingClient({ defaultName }: OnboardingClientProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 data
  const [fullName, setFullName] = useState(defaultName);
  const [age, setAge] = useState("");

  // Step 2 data
  const [dietaryPref, setDietaryPref] = useState("");

  // Step 3 data
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canGoNext = () => {
    if (step === 1) return fullName.trim().length > 0 && age.length > 0;
    if (step === 2) return dietaryPref.length > 0;
    return true; // Step 3: allergens are optional
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("age", age);
    formData.append("dietaryPref", dietaryPref);
    formData.append("allergens", JSON.stringify(selectedAllergens));

    try {
      const result = await saveOnboardingAction(formData);

      if (result?.success) {
        // Full page reload to /home
        window.location.href = "/home";
        return;
      }

      if (result?.error) {
        setError(result.error);
        setSaving(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-dark-900">
      {/* ===== Progress Bar ===== */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                s <= step ? "bg-primary-500" : "bg-dark-800"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-dark-500 text-center">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      {/* ===== Content Area ===== */}
      <div className="flex-1 px-4 py-6 flex flex-col">
        {/* Error */}
        {error && (
          <div className="rounded-xl bg-danger-500/10 border border-danger-500/20 px-4 py-3 mb-4">
            <p className="text-danger-400 text-sm">{error}</p>
          </div>
        )}

        {/* ──── Step 1: Name + Age ──── */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 glow-primary mb-4">
                <User className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-dark-50">
                Tell us about yourself
              </h1>
              <p className="text-dark-400 text-sm mt-2">
                We&apos;ll personalize your food scanning experience based on your profile.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-dark-300 text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="age" className="text-dark-300 text-sm font-medium">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  min={1}
                  max={120}
                  inputMode="numeric"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ──── Step 2: Dietary Preference ──── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 glow-primary mb-4">
                <Utensils className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-dark-50">
                Dietary Preference
              </h1>
              <p className="text-dark-400 text-sm mt-2">
                Select your diet type so we can better assess food products for you.
              </p>
            </div>

            <div className="space-y-3">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setDietaryPref(option.id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl p-4 transition-all text-left",
                    dietaryPref === option.id
                      ? "bg-primary-500/10 border-2 border-primary-500/40"
                      : "glass-card border-2 border-transparent hover:border-dark-600"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium",
                      dietaryPref === option.id ? "text-primary-300" : "text-dark-200"
                    )}>
                      {option.label}
                    </p>
                    <p className="text-xs text-dark-500 mt-0.5">{option.desc}</p>
                  </div>
                  {dietaryPref === option.id && (
                    <Check className="h-5 w-5 text-primary-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ──── Step 3: Allergens ──── */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 glow-primary mb-4">
                <ShieldAlert className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-dark-50">
                Any Allergies?
              </h1>
              <p className="text-dark-400 text-sm mt-2">
                Select any allergens you have. We&apos;ll flag them in scan results.
                <br />
                <span className="text-dark-500">Skip if none apply.</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {ALLERGEN_OPTIONS.map((allergen) => {
                const isSelected = selectedAllergens.includes(allergen.id);
                return (
                  <button
                    key={allergen.id}
                    onClick={() => toggleAllergen(allergen.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all",
                      isSelected
                        ? "bg-accent-500/15 border-2 border-accent-500/40"
                        : "bg-dark-800 border-2 border-transparent hover:border-dark-600"
                    )}
                  >
                    <span className="text-lg">{allergen.emoji}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-accent-300" : "text-dark-300"
                    )}>
                      {allergen.label}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-accent-400" />}
                  </button>
                );
              })}
            </div>

            {selectedAllergens.length > 0 && (
              <p className="text-xs text-dark-500 mt-4">
                {selectedAllergens.length} allergen{selectedAllergens.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}
      </div>

      {/* ===== Bottom Navigation ===== */}
      <div className="px-4 pb-8 pt-4 border-t border-dark-800 bg-dark-900">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-2 rounded-xl bg-dark-800 px-6 py-3 text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors",
                canGoNext()
                  ? "bg-primary-500 hover:bg-primary-600 text-white"
                  : "bg-dark-700 text-dark-500 cursor-not-allowed"
              )}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors",
                "bg-primary-500 hover:bg-primary-600 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4" />
                  Start Scanning
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
