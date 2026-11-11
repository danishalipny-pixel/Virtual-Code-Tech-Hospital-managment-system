import type { Metadata } from "next";
import { InvoicesView } from "@/features/billing/InvoicesView";

export const metadata: Metadata = {
  title: "Billing & Invoices",
  description: "Hospital invoice ledger, automated billing calculation, CSV export, and PDF printing.",
};

export default function BillingPage() {
  return <InvoicesView />;
}
