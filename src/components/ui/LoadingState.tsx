import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-sky-600 dark:text-sky-400" aria-hidden="true" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading workspace">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-sky-100 bg-white p-5 dark:border-slate-800 dark:bg-[#111c2e]"
          >
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 h-7 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-2xl border border-sky-100 bg-white p-5 dark:border-slate-800 dark:bg-[#111c2e]" />
        <div className="h-80 rounded-2xl border border-sky-100 bg-white p-5 dark:border-slate-800 dark:bg-[#111c2e]" />
      </div>
    </div>
  );
}
