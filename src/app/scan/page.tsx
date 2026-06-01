"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        () => {}
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
        setTimeout(() => {
          startScanner();
        }, 300);
      } catch {
        setCheckingLimit(false);
        setTimeout(() => {
          startScanner();
        }, 300);
      }
    }

    checkLimitAndStart();

    return () => {
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

  // Paywall screen
  if (scanLocked) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 pt-safe border-b border-white/[0.04] bg-dark-900/80 backdrop-blur-xl">
          <Link
            href="/home"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-dark-400 hover:text-dark-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-sm font-semibold text-dark-300">Scan Barcode</h1>
          <div className="w-9" />
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card-elevated p-8 text-center max-w-sm w-full">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-500/8 mb-5">
              <Lock className="h-10 w-10 text-accent-400" />
            </div>
            <h2 className="text-xl font-bold text-dark-50 mb-2">
              All free scans used!
            </h2>
            <p className="text-dark-400 text-sm mb-6">
              You&apos;ve used all 5 free scans. Upgrade to Premium for unlimited scanning.
            </p>
            <Link
              href="/premium"
              className="block w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3 text-sm font-bold text-dark-900 hover:opacity-90 transition-opacity mb-3 text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4" />
                Upgrade to Premium
              </span>
            </Link>
            <Link
              href="/home"
              className="block w-full rounded-xl bg-white/[0.04] py-3 text-sm font-medium text-dark-400 hover:text-dark-200 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (checkingLimit) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 pt-safe border-b border-white/[0.04] bg-dark-900/80 backdrop-blur-xl">
        <Link
          href="/home"
          onClick={(e) => {
            e.preventDefault();
            stopScanner();
            router.push("/home");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold text-dark-300">Scan Barcode</h1>
        <div className="w-9" />
      </header>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative w-full max-w-md aspect-[3/4] mx-auto overflow-hidden">
          {/* QR Scanner Element */}
          <div
            id={SCANNER_REGION_ID}
            className="w-full h-full"
          />

          {/* Overlay when scanning */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-dark-900/60" />

              {/* Scanner window */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[160px]">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-400 rounded-br-lg" />

                {/* Animated scan line */}
                <div className="absolute left-3 right-3 h-0.5 bg-primary-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-scan-line" />
              </div>

              {/* Instruction */}
              <div className="absolute bottom-10 left-0 right-0 text-center z-20">
                <p className="text-dark-300 text-sm font-medium">
                  Point your camera at a food barcode
                </p>
              </div>
            </div>
          )}

          {/* Scanning indicator */}
          {isScanning && (
            <div className="absolute top-5 left-0 right-0 flex items-center justify-center gap-2 z-20">
              <div className="flex items-center gap-2 rounded-full bg-dark-900/80 backdrop-blur-sm border border-white/[0.06] px-4 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-400" />
                <span className="text-primary-400 text-xs font-medium">
                  Scanning...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-4 mt-4 max-w-md w-full">
            <div className="rounded-xl bg-danger-500/8 border border-danger-500/15 px-4 py-3">
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
              "mt-4 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
              torchOn
                ? "bg-primary-500/15 text-primary-400 border border-primary-500/20"
                : "bg-white/[0.04] text-dark-400 border border-white/[0.06]"
            )}
          >
            <Zap className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/[0.04] bg-dark-900/90 backdrop-blur-xl pb-safe">
        {/* Toggle Manual Entry */}
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex w-full items-center justify-center gap-2 py-3 text-sm text-dark-400 hover:text-dark-300 transition-colors"
        >
          <Keyboard className="h-4 w-4" />
          {showManual ? "Hide manual entry" : "Enter barcode manually"}
        </button>

        {/* Manual Input */}
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
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-dark-50 placeholder-dark-600 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all duration-200 text-sm"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-[0.97]"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] py-3 text-sm font-medium text-dark-400 hover:text-dark-200 transition-colors active:scale-[0.97]"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
