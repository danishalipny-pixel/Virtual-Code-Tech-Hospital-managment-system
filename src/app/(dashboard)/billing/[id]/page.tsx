import React, { Suspense } from "react";
import type { Metadata } from "next";
import { InvoiceDetailView } from "@/features/billing/InvoiceDetailView";
import { LoadingSpinner } from "@/components/ui/LoadingState";

export const metadata: Metadata = {
  title: "Invoice Statement",
  description: "Printable hospital invoice details and PDF export.",
};

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading invoice statement..." />}>
      <InvoiceDetailView />
    </Suspense>
  );
}
