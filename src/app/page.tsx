"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { useHospitalStore } from "@/store/useHospitalStore";
import { LoadingSpinner } from "@/components/ui/LoadingState";

export default function HomePage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const session = useHospitalStore((s) => s.session);

  useEffect(() => {
    if (!hydrated) return;
    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [hydrated, session, router]);

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <LoadingSpinner label="Launching MedAxis Hospital System..." />
    </main>
  );
}
