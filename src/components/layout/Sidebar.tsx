"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  BedDouble,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const session = useHospitalStore((s) => s.session);
  const logout = useHospitalStore((s) => s.logout);
  const resetDemoData = useHospitalStore((s) => s.resetDemoData);
  const pushToast = useHospitalStore((s) => s.pushToast);
  const { canAccessBilling, canResetSystem } = useRoleAccess();
  const [confirmResetOpen, setConfirmResetOpen] = React.useState(false);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      label: "Patients",
      href: "/patients",
      icon: Users,
      visible: true,
    },
    {
      label: "Doctors",
      href: "/doctors",
      icon: Stethoscope,
      visible: true,
    },
    {
      label: "Appointments",
      href: "/appointments",
      icon: CalendarClock,
      visible: true,
    },
    {
      label: "Billing & Invoices",
      href: "/billing",
      icon: CreditCard,
      visible: canAccessBilling,
    },
    {
      label: "Wards & Beds",
      href: "/wards",
      icon: BedDouble,
      visible: true,
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleReset = () => {
    resetDemoData();
    pushToast({
      type: "info",
      title: "Demo data restored",
      message: "All patients, doctors, appointments, invoices, and beds were reset.",
    });
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Primary Sidebar"
        className={cn(
          "no-print fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sky-100 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-[#0d1726] lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-sky-100/80 px-5 dark:border-slate-800">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <Image
              src="/medaxis-logo.svg"
              alt="MedAxis HMS logo"
              width={34}
              height={34}
              className="h-8.5 w-8.5 rounded-xl shadow-xs"
            />
            <div>
              <span className="block text-base font-bold tracking-tight text-slate-900 dark:text-white">
                MedAxis <span className="text-sky-600 dark:text-sky-400">HMS</span>
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Clinical Suite
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Hospital Modules
          </p>
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-sky-50 text-sky-700 shadow-2xs ring-1 ring-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800/70"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      active
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* System Status & Footer Actions */}
        <div className="space-y-3 border-t border-sky-100/80 p-4 dark:border-slate-800">
          {session && (
            <div className="rounded-xl bg-sky-50/70 p-3 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                  <span>Active Role</span>
                </div>
                <Badge status={session.role} className="capitalize">
                  {session.role}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {session.title}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            {canResetSystem && (
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>Reset Demo Data</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                onCloseMobile();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleReset}
        title="Reset Demo Data?"
        message="This will restore the default patients, doctors, appointments, invoices, and ward bed statuses in your browser."
        confirmLabel="Restore Defaults"
        variant="primary"
      />
    </>
  );
}
