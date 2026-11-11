"use client";

import React, { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCheck,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { Badge } from "@/components/ui/Badge";
import { getTodayIso } from "@/lib/date";

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Executive & Clinical Dashboard",
  "/patients": "Patient Records & Directory",
  "/doctors": "Medical Staff & Specialists",
  "/appointments": "Appointment Scheduling",
  "/billing": "Billing & Invoice Management",
  "/wards": "Ward & Bed Availability",
};

function resolvePageTitle(pathname: string): string {
  for (const [route, title] of Object.entries(routeTitles)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return title;
    }
  }
  return "MedAxis Hospital Portal";
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useHospitalStore((s) => s.session);
  const theme = useHospitalStore((s) => s.theme);
  const toggleTheme = useHospitalStore((s) => s.toggleTheme);
  const logout = useHospitalStore((s) => s.logout);
  const appointments = useHospitalStore((s) => s.appointments);
  const invoices = useHospitalStore((s) => s.invoices);

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Reset transient dropdown menus on route hide (Next.js 16 Activity)
  useLayoutEffect(() => {
    return () => {
      setAlertsOpen(false);
      setProfileOpen(false);
    };
  }, [pathname]);

  const todayIso = getTodayIso();
  const todayAppointments = appointments.filter(
    (a) => a.date === todayIso && a.status !== "Cancelled"
  );
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;
  const unpaidCount = invoices.filter((inv) => inv.status === "Unpaid").length;
  const alertTotal = pendingCount + (session?.role !== "doctor" ? unpaidCount : 0);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    router.replace("/login");
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-sky-100 bg-white/95 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-[#0d1726]/95">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg dark:text-white">
            {resolvePageTitle(pathname)}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
            MedAxis International Medical Center · {todayAppointments.length} active appointments today
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAlertsOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            aria-label={`Clinical alerts (${alertTotal})`}
            aria-expanded={alertsOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" aria-hidden="true" />
            {alertTotal > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                {alertTotal}
              </span>
            )}
          </button>

          {alertsOpen && (
            <div
              role="region"
              aria-label="Clinical alerts"
              className="absolute right-0 mt-2 w-72 rounded-2xl border border-sky-100 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-[#111c2e]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Operational Alerts
                </span>
                <Badge tone="info">{alertTotal} active</Badge>
              </div>
              <div className="mt-2 space-y-2">
                <Link
                  href="/appointments"
                  onClick={() => setAlertsOpen(false)}
                  className="block rounded-xl bg-sky-50/70 p-2.5 text-xs transition-colors hover:bg-sky-100/70 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {pendingCount} Pending Appointments
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    Review and confirm upcoming patient bookings.
                  </p>
                </Link>
                {session?.role !== "doctor" && (
                  <Link
                    href="/billing"
                    onClick={() => setAlertsOpen(false)}
                    className="block rounded-xl bg-amber-50/70 p-2.5 text-xs transition-colors hover:bg-amber-100/70 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {unpaidCount} Unpaid Invoices
                    </p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Follow up on outstanding hospital billing statements.
                    </p>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        {session && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setAlertsOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-label="Account menu"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-200">
                {session.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-none text-slate-900 dark:text-slate-100">
                  {session.name}
                </p>
                <p className="mt-0.5 text-[11px] capitalize text-slate-500 dark:text-slate-400">
                  {session.role}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-sky-100 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-[#111c2e]"
              >
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {session.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    <span className="text-xs font-medium capitalize text-sky-700 dark:text-sky-300">
                      {session.role} Access
                    </span>
                  </div>
                </div>
                <div className="pt-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Sign Out & Switch Role</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
