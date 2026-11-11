import React from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral"
  | "purple";

const toneStyles: Record<BadgeTone, string> = {
  success:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70",
  info:
    "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/70",
  warning:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70",
  danger:
    "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70",
  neutral:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  purple:
    "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/70",
};

const statusToneMap: Record<string, BadgeTone> = {
  Active: "success",
  Available: "success",
  Confirmed: "info",
  Completed: "success",
  Paid: "success",
  Inpatient: "info",
  "In Consultation": "warning",
  Pending: "warning",
  Occupied: "info",
  Maintenance: "warning",
  Unpaid: "danger",
  Cancelled: "danger",
  "On Leave": "danger",
  Discharged: "neutral",
  admin: "purple",
  doctor: "info",
  receptionist: "success",
};

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  status?: string;
  className?: string;
}

export function Badge({ children, tone, status, className }: BadgeProps) {
  const resolvedTone =
    tone ?? (status ? statusToneMap[status] ?? "neutral" : "neutral");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneStyles[resolvedTone],
        className
      )}
    >
      {children}
    </span>
  );
}
