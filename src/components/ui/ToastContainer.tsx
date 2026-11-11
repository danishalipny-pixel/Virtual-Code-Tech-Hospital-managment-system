"use client";

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import type { ToastType } from "@/lib/types";
import { cn } from "@/lib/cn";

const toastStyles: Record<
  ToastType,
  { icon: React.ReactNode; classes: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    classes:
      "border-emerald-200 bg-white dark:border-emerald-800/80 dark:bg-[#111c2e]",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
    classes: "border-rose-200 bg-white dark:border-rose-800/80 dark:bg-[#111c2e]",
  },
  warning: {
    icon: <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    classes:
      "border-amber-200 bg-white dark:border-amber-800/80 dark:bg-[#111c2e]",
  },
  info: {
    icon: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
    classes: "border-sky-200 bg-white dark:border-sky-800/80 dark:bg-[#111c2e]",
  },
};

export function ToastContainer() {
  const toasts = useHospitalStore((s) => s.toasts);
  const dismissToast = useHospitalStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, 4200)
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="no-print fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-3.5 shadow-lg transition-all",
              style.classes
            )}
          >
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              {style.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
