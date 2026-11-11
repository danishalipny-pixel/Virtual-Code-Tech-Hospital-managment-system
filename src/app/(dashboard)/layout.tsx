import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardSkeleton } from "@/components/ui/LoadingState";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] p-6 sm:p-8">
          <DashboardSkeleton />
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
