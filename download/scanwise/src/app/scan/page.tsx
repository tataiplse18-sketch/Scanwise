"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  ScanLine,
  Keyboard,
  X,
  Camera,
  AlertCircle,
  Crown,
} from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const [manualBarcode, setManualBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    async function checkAccess() {
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
          .select("scan_count, is_premium")
          .eq("id", user.id)
          .single();

        if (profile) {
          setScanCount(profile.scan_count);
          setIsPremium(profile.is_premium);
        }
      } catch {
        // Fallback
      }
    }

    checkAccess();
  }, []);

  const freeScansLeft = Math.max(0, 5 - scanCount);
  const canScan = isPremium || freeScansLeft > 0;

  // Start camera scanner
  async function startScanner() {
    if (!canScan) {
      setError("No free scans left. Upgrade to Premium for unlimited scans.");
      return;
    }

    setScanning(true);
    setError(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // On successful scan
          html5QrCode.stop();
          setScanning(false);
          handleBarcodeScanned(decodedText);
        },
        () => {
          // QR code not found in frame (ignore)
        }
      );
    } catch (err: any) {
      setScanning(false);
      setError("Camera access denied. Use manual entry instead.");
    }
  }

  // Stop scanner
  function stopScanner() {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .catch(() => {})
        .finally(() => {
          html5QrCodeRef.current = null;
        });
    }
    setScanning(false);
  }

  // Handle scanned barcode
  async function handleBarcodeScanned(barcode: string) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Increment scan count
      await supabase.rpc("increment_scan_count", { user_id: user.id });

      // Fetch product data from Open Food Facts
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;

        // Calculate health score
        const healthScore = calculateHealthScore(product);

        // Save to scan_results
        const { data: scanResult, error: insertError } = await supabase
          .from("scan_results")
          .insert({
            user_id: user.id,
            barcode,
            health_score: healthScore.score,
            risk_level: healthScore.label,
            nutrition: {
              calories: product.nutriments?.["energy-kcal_100g"] || 0,
              protein: product.nutriments?.proteins_100g || 0,
              carbs: product.nutriments?.carbohydrates_100g || 0,
              sugar: product.nutriments?.sugars_100g || 0,
              fat: product.nutriments?.fat_100g || 0,
              saturated_fat: product.nutriments?.["saturated-fat_100g"] || 0,
              fiber: product.nutriments?.fiber_100g || 0,
              sodium: product.nutriments?.sodium_100g || 0,
            },
            ingredients: extractIngredients(product),
            allergens: product.allergens_tags || [],
            nova_group: product.nova_group || 4,
            alternatives: [],
            ai_verdict: healthScore.verdict,
            scanned_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (scanResult) {
          // Also save product to products table
          await supabase.from("products").upsert({
            barcode,
            name: product.product_name || "Unknown Product",
            brand: product.brands || null,
            image_url: product.image_url || null,
            category: product.categories_tags?.[0] || null,
          });

          router.push(`/result?id=${scanResult.id}`);
        } else {
          setError("Failed to save scan result. Please try again.");
        }
      } else {
        setError(`Product not found for barcode: ${barcode}. Try another product.`);
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    }
  }

  // Calculate health score from product data
  function calculateHealthScore(product: any) {
    let score = 70; // Start at 70, deduct for issues

    const nutriments = product.nutriments || {};
    const novaGroup = product.nova_group || 4;
    const additives = product.additives_tags?.length || 0;

    // NOVA group penalty
    if (novaGroup === 4) score -= 25;
    else if (novaGroup === 3) score -= 15;
    else if (novaGroup === 2) score -= 5;

    // Sugar penalty
    const sugar = nutriments.sugars_100g || 0;
    if (sugar > 20) score -= 15;
    else if (sugar > 10) score -= 8;
    else if (sugar > 5) score -= 3;

    // Saturated fat penalty
    const satFat = nutriments["saturated-fat_100g"] || 0;
    if (satFat > 5) score -= 12;
    else if (satFat > 3) score -= 6;

    // Sodium penalty
    const sodium = nutriments.sodium_100g || 0;
    if (sodium > 0.5) score -= 10;
    else if (sodium > 0.3) score -= 5;

    // Additive penalty
    if (additives > 5) score -= 10;
    else if (additives > 2) score -= 5;

    // Fiber bonus
    const fiber = nutriments.fiber_100g || 0;
    if (fiber > 5) score += 5;
    else if (fiber > 2) score += 3;

    // Protein bonus
    const protein = nutriments.proteins_100g || 0;
    if (protein > 10) score += 5;
    else if (protein > 5) score += 2;

    score = Math.max(0, Math.min(100, score));

    let label: string;
    let verdict: string;

    if (score < 30) {
      label = "poor";
      verdict = "This product is highly processed with concerning levels of sugar, sodium, or additives. Consider choosing a healthier alternative.";
    } else if (score < 60) {
      label = "fair";
      verdict = "This product has moderate nutritional quality. Some ingredients may be concerning — consume in moderation.";
    } else if (score < 80) {
      label = "good";
      verdict = "This is a reasonably good choice with a decent nutritional profile. Minor areas for improvement.";
    } else {
      label = "great";
      verdict = "Excellent choice! This product has clean ingredients and strong nutritional value.";
    }

    return { score, label, verdict };
  }

  // Extract ingredients with risk levels
  function extractIngredients(product: any): any[] {
    const ingredients: any[] = [];
    const highRisk = ["e102", "e110", "e120", "e129", "e211", "e220", "e250", "e320", "e621", "e951"];
    const moderateRisk = ["e412", "e415", "e471", "e322", "e407"];

    (product.additives_tags || []).forEach((tag: string) => {
      const code = tag.replace("en:", "");
      let risk = "safe";
      if (highRisk.includes(code)) risk = "high";
      else if (moderateRisk.includes(code)) risk = "moderate";

      ingredients.push({
        name: code.toUpperCase(),
        risk_level: risk,
        explanation: risk === "high"
          ? "Known health risk — try to avoid"
          : risk === "moderate"
          ? "Some concerns in excess"
          : "Generally safe",
      });
    });

    return ingredients.slice(0, 10);
  }

  // Manual submit
  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    if (!canScan) {
      setError("No free scans left. Upgrade to Premium.");
      return;
    }
    handleBarcodeScanned(manualBarcode.trim());
  }

  return (
    <main className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-dark-50">Scan Product</h1>
        <p className="text-sm text-dark-400">Scan a barcode or enter it manually</p>
      </div>

      {/* Paywall Overlay */}
      {!canScan && (
        <div className="mx-4 mb-4 rounded-2xl border border-danger-500/20 bg-danger-500/5 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-danger-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-danger-400">No free scans left</p>
              <p className="text-xs text-dark-400">Upgrade to Premium for unlimited scans</p>
            </div>
            <Link
              href="/premium"
              className="rounded-lg bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-400"
            >
              <Crown className="h-3.5 w-3.5 inline mr-1" />
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Scanner Area */}
      <div className="mx-4 mb-4">
        <div className="glass-card overflow-hidden">
          {scanning ? (
            <div className="relative">
              <div id="qr-reader" ref={scannerRef} className="w-full" style={{ minHeight: "300px" }} />
              <button
                onClick={stopScanner}
                className="absolute top-4 right-4 z-10 rounded-full bg-dark-900/80 p-2 text-dark-50 hover:bg-dark-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-500/10">
                <Camera className="h-10 w-10 text-primary-400" />
              </div>
              <p className="mb-6 text-sm text-dark-400">
                Tap below to start scanning
              </p>
              <button
                onClick={startScanner}
                disabled={!canScan}
                className="flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
              >
                <ScanLine className="h-5 w-5" />
                Start Scanner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
          {error}
        </div>
      )}

      {/* Manual Entry Toggle */}
      <div className="mx-4 mb-3">
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dark-700/50 bg-dark-800/50 px-4 py-3 text-sm font-medium text-dark-300 transition-colors hover:border-primary-500/30 hover:text-primary-400"
        >
          <Keyboard className="h-4 w-4" />
          {showManual ? "Hide Manual Entry" : "Enter Barcode Manually"}
        </button>
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <form onSubmit={handleManualSubmit} className="mx-4 mb-4">
          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode number (e.g., 8901234567890)"
              className="flex-1 bg-transparent text-sm text-dark-50 placeholder-dark-500 outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim() || !canScan}
              className="rounded-lg bg-primary-500 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </form>
      )}

      {/* Free Scans Counter */}
      {!isPremium && (
        <div className="mx-4">
          <div className="flex items-center justify-center gap-2 text-xs text-dark-500">
            <ScanLine className="h-3 w-3" />
            <span>{freeScansLeft}/5 free scans remaining</span>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
