import type { Metadata } from "next";
import { DoctorsView } from "@/features/doctors/DoctorsView";

export const metadata: Metadata = {
  title: "Doctors",
  description: "Medical specialists roster, availability management, and profiles.",
};

export default function DoctorsPage() {
  return <DoctorsView />;
}
