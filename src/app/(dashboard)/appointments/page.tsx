import type { Metadata } from "next";
import { AppointmentsView } from "@/features/appointments/AppointmentsView";

export const metadata: Metadata = {
  title: "Appointments",
  description: "Book, reschedule, cancel, and inspect appointments in list or calendar view.",
};

export default function AppointmentsPage() {
  return <AppointmentsView />;
}
