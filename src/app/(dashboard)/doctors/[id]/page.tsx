import React, { Suspense } from "react";
import type { Metadata } from "next";
import { DoctorProfileView } from "@/features/doctors/DoctorProfileView";
import { LoadingSpinner } from "@/components/ui/LoadingState";

export const metadata: Metadata = {
  title: "Doctor Profile",
  description: "Physician credentials, schedule, and clinical appointments.",
};

export default function DoctorProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading physician profile..." />}>
      <DoctorProfileView />
    </Suspense>
  );
}
