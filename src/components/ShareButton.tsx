"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { incrementShareCountAction } from "@/app/auth-actions";

interface ShareButtonProps {
  productName: string;
  healthScore: number;
  barcode?: string;
}

export default function ShareButton({ productName, healthScore, barcode }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I scanned ${productName} on ScanWise — Health Score: ${healthScore}/100. Check your food at scan-wise-l7bt.vercel.app${barcode ? ` #${barcode}` : ""}`;

  async function handleShare() {
    // Track share achievement
    incrementShareCountAction().catch(() => {});

    if (navigator.share) {
      try {
        await navigator.share({
          title: "ScanWise - Food Health Score",
          text: shareText,
          url: "https://scan-wise-l7bt.vercel.app",
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API failed
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-xl border border-dark-700/50 bg-dark-800/50 px-4 py-2.5 text-sm font-medium text-dark-300 transition-all hover:border-primary-500/30 hover:text-primary-400 hover:bg-primary-500/5 active:scale-95"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-primary-400" />
          <span className="text-primary-400">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
