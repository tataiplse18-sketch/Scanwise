"use client";

import { useState, useEffect, useCallback } from "react";

interface ToastConfig {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastItem extends ToastConfig {
  id: number;
}

let toastIdCounter = 0;
const toastListeners: Array<(toast: ToastItem) => void> = [];

function addToast(config: ToastConfig) {
  const toast: ToastItem = {
    id: ++toastIdCounter,
    message: config.message,
    type: config.type ?? "info",
    duration: config.duration ?? 3000,
  };
  toastListeners.forEach((listener) => listener(toast));
}

export function showToast(config: ToastConfig) {
  addToast(config);
}

const TYPE_STYLES: Record<string, string> = {
  success: "bg-primary-500/10 border-primary-500/15 text-primary-300",
  error: "bg-danger-500/10 border-danger-500/15 text-danger-300",
  info: "bg-white/[0.06] border-white/[0.08] text-dark-200",
  warning: "bg-accent-500/10 border-accent-500/15 text-accent-300",
};

const TYPE_ICONS: Record<string, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration);
    };

    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-xl animate-slide-down shadow-lg ${
            TYPE_STYLES[toast.type ?? "info"] ?? TYPE_STYLES.info
          }`}
        >
          <span className="text-sm opacity-70">{TYPE_ICONS[toast.type ?? "info"] ?? "ℹ"}</span>
          <span className="flex-1 text-xs">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
