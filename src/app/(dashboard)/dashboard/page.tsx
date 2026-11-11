import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Real-time hospital KPIs, patient trends, revenue charts, and operational overview.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
