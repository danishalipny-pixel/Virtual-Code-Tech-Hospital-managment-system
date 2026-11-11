import type { Metadata } from "next";
import { PatientsView } from "@/features/patients/PatientsView";

export const metadata: Metadata = {
  title: "Patients",
  description: "Manage fictional patient directory, records, search, filters, and exports.",
};

export default function PatientsPage() {
  return <PatientsView />;
}
