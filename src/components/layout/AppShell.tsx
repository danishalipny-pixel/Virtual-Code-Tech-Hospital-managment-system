"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useHospitalStore } from "@/store/useHospitalStore";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { DashboardSkeleton } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const session = useHospitalStore((s) => s.session);
  const theme = useHospitalStore((s) => s.theme);
  const { canAccessBilling } = useRoleAccess();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync theme attribute on mount/change
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [hydrated, theme]);

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (hydrated && !session) {
      router.replace("/login");
    }
  }, [hydrated, session, router]);

  if (!hydrated || !session) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6 sm:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const isBillingRestricted =
    !canAccessBilling &&
    (pathname === "/billing" || pathname.startsWith("/billing/"));

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-7">
          {isBillingRestricted ? (
            <div className="mx-auto max-w-lg py-12">
              <Card>
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <ShieldAlert className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    Access Restricted by Role Policy
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    The Billing & Invoices module is restricted to{" "}
                    <span className="font-semibold">Admin</span> and{" "}
                    <span className="font-semibold">Receptionist</span> accounts.
                    You are currently signed in as{" "}
                    <span className="font-semibold capitalize">{session.role}</span>.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/dashboard">
                      <Button variant="primary">Return to Dashboard</Button>
                    </Link>
                    <Link href="/appointments">
                      <Button variant="outline">View Appointments</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
