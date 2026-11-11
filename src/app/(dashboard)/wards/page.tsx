import type { Metadata } from "next";
import { WardsView } from "@/features/wards/WardsView";

export const metadata: Metadata = {
  title: "Wards & Beds",
  description: "Hospital ward occupancy and interactive bed availability tracker.",
};

export default function WardsPage() {
  return <WardsView />;
}
