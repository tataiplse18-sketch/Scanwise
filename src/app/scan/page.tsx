"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { checkScanLimitAction } from "@/app/auth-actions";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Keyboard, X, Zap, Crown, Lock } from "lucide-react";

const SCANNER_REGION_ID = "scanwise-reader";

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);

  const startScanner = useCallback(async () => {
    if (isScanningRef.current) return;

    try {
      setError(null);

      const scanner = new Html5Qrcode(SCANNER_REGION_ID);
      scannerRef.current = scanner;
      isScanningRef.current = true;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
        },
        (decodedText) => {
          // Successful scan — stop scanner and navigate to result
          if (isScanningRef.current) {
            isScanningRef.current = false;
            scanner
              .stop()
              .then(() => {
                scanner.clear();
                router.push(`/result?barcode=${encodeURIComponent(decodedText)}`);
              })
              .catch(() => {
                router.push(`/result?barcode=${encodeURIComponent(decodedText)}`);
              });
          }
        },
        () => {
          // QR code scan failure (ignored — continuous scanning)
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      isScanningRef.current = false;
      const message =
        err instanceof Error ? err.message : "Failed to start scanner";

      if (message.includes("Permission") || message.includes("denied")) {
        setError(
          "Camera permission denied. Please allow camera access in your browser settings and try again."
        );
      } else if (
        message.includes("NotFoundError") ||
        message.includes("Requested device not found")
      ) {
        setError(
          "No camera found on this device. You can enter the barcode manually below."
        );
      } else if (message.includes("NotReadableError")) {
        setError(
          "Camera is already in use by another application. Please close it and try again."
        );
      } else {
        setError(
          "Scanner not supported on this device. Please enter the barcode manually."
        );
      }
    }
  }, [router]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Scanner already stopped
      }
      isScanningRef.current = false;
      setIsScanning(false);
    }
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!scannerRef.current || !isScanningRef.current) return;

    try {
      const track = scannerRef.current.getRunningTrackCameraCapabilities();
      if (track && track.torchFeature && track.torchFeature().isSupported()) {
        const newState = !torchOn;
        await track.torchFeature().apply(newState);
        setTorchOn(newState);
      }
    } catch {
      // Torch not supported
    }
  }, [torchOn]);

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const barcode = manualBarcode.trim();
    if (barcode) {
      stopScanner();
      router.push(`/result?barcode=${encodeURIComponent(barcode)}`);
    }
  };

  // Check scan limit on mount, then start scanner if allowed
  useEffect(() => {
    async function checkLimitAndStart() {
      try {
        const result = await checkScanLimitAction();
        if (!result.canScan) {
          setScanLocked(true);
          setCheckingLimit(false);
          return;
        }
        setCheckingLimit(false);
        // Small delay to ensure DOM element exists
        setTimeout(() => {
          startScanner();
        }, 300);
      } catch {
        setCheckingLimit(false);
        // If check fails, allow scan (graceful fallback)
        setTimeout(() => {
          startScanner();
        }, 300);
      }
    }

    checkLimitAndStart();

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current && isScanningRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {
          // Already stopped
        }
        isScanningRef.current = false;
      }
    };
  }, [startScanner]);

  // Paywall screen — all free scans used
  if (scanLocked) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 pt-safe border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
          <button
            onClick={() => router.push("/home")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-dark-200">Scan Barcode</h1>
          <div className="w-9" />
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card p-8 text-center max-w-sm w-full">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-500/10 mb-5">
              <Lock className="h-10 w-10 text-accent-400" />
            </div>
            <h2 className="text-xl font-bold text-dark-50 mb-2">
              All free scans used!
            </h2>
            <p className="text-dark-400 text-sm mb-6">
              You&apos;ve used all 5 free scans. Upgrade to Premium for unlimited scanning and exclusive features.
            </p>
            <button
              onClick={() => router.push("/premium")}
              className="w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3 text-sm font-bold text-dark-900 hover:opacity-90 transition-opacity mb-3"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4" />
                Upgrade to Premium
              </span>
            </button>
            <button
              onClick={() => router.push("/home")}
              className="w-full rounded-xl bg-dark-800 py-3 text-sm font-medium text-dark-400 hover:text-dark-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while checking scan limit
  if (checkingLimit) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* ===== Top Bar ===== */}
      <header className="flex items-center justify-between px-4 py-3 pt-safe border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl">
        <button
          onClick={() => {
            stopScanner();
            router.push("/home");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-dark-200">Scan Barcode</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* ===== Scanner Area ===== */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Scanner Container */}
        <div className="relative w-full max-w-md aspect-[3/4] mx-auto overflow-hidden">
          {/* QR Scanner Element */}
          <div
            id={SCANNER_REGION_ID}
            className="w-full h-full"
          />

          {/* Animated Scan Line Overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Dark overlay with transparent center */}
              <div className="absolute inset-0 bg-dark-900/60" />

              {/* Scanner window cutout area - green border indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[160px]">
                {/* Corner borders */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-400 rounded-br-lg" />

                {/* Animated scan line */}
                <div className="absolute left-2 right-2 h-0.5 bg-primary-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-bounce" />
              </div>

              {/* Instruction text */}
              <div className="absolute bottom-8 left-0 right-0 text-center z-20">
                <p className="text-dark-300 text-sm">
                  Point your camera at a food barcode
                </p>
              </div>
            </div>
          )}

          {/* Scanning indicator */}
          {isScanning && (
            <div className="absolute top-4 left-0 right-0 flex items-center justify-center gap-2 z-20">
              <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
              <span className="text-primary-400 text-sm font-medium">
                Scanning...
              </span>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-4 mt-4 max-w-md w-full">
            <div className="rounded-xl bg-danger-500/10 border border-danger-500/20 px-4 py-3">
              <p className="text-danger-400 text-sm">{error}</p>
              <button
                onClick={startScanner}
                className="mt-2 text-danger-300 text-sm font-medium hover:text-danger-200 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Torch Toggle */}
        {isScanning && (
          <button
            onClick={toggleTorch}
            className={cn(
              "mt-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              torchOn
                ? "bg-primary-500/20 text-primary-400"
                : "bg-dark-800 text-dark-400"
            )}
          >
            <Zap className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ===== Bottom Section: Manual Entry ===== */}
      <div className="border-t border-dark-800 bg-dark-900/90 backdrop-blur-xl pb-safe">
        {/* Toggle Manual Entry */}
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex w-full items-center justify-center gap-2 py-3 text-sm text-dark-400 hover:text-dark-300 transition-colors"
        >
          <Keyboard className="h-4 w-4" />
          {showManual ? "Hide manual entry" : "Or enter barcode manually"}
        </button>

        {/* Manual Barcode Input */}
        {showManual && (
          <form
            onSubmit={handleManualSubmit}
            className="flex items-center gap-2 px-4 pb-4"
          >
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="e.g. 8901234567890"
              inputMode="numeric"
              className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Go
            </button>
          </form>
        )}

        {/* Cancel Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              stopScanner();
              router.push("/home");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-dark-800 py-3 text-sm font-medium text-dark-400 hover:text-dark-200 transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
