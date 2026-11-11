import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PatientProfileView } from "@/features/patients/PatientProfileView";
import { LoadingSpinner } from "@/components/ui/LoadingState";

export const metadata: Metadata = {
  title: "Patient Profile",
  description: "Detailed patient record, appointment history, and ward status.",
};

export default function PatientProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading patient profile..." />}>
      <PatientProfileView />
    </Suspense>
  );
}
