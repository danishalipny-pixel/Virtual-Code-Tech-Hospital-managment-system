import React from "react";
import { cn } from "@/lib/cn";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  accent?: "sky" | "emerald" | "amber" | "indigo";
}

const accentStyles = {
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "sky",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-sky-100/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-[#111c2e]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            accentStyles[accent]
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}
