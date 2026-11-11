import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/auth/auth-schema";
import { patientSchema } from "@/features/patients/patient-schema";
import { doctorSchema } from "@/features/doctors/doctor-schema";
import { appointmentSchema } from "@/features/appointments/appointment-schema";
import { invoiceSchema } from "@/features/billing/invoice-schema";

describe("Zod validation schemas", () => {
  it("validates login credentials", () => {
    expect(
      loginSchema.safeParse({
        email: "admin@medaxis.org",
        password: "Admin@2026",
      }).success
    ).toBe(true);

    expect(
      loginSchema.safeParse({ email: "not-an-email", password: "123" }).success
    ).toBe(false);
  });

  it("validates patient fields and enforces realistic age bounds", () => {
    expect(
      patientSchema.safeParse({
        fullName: "Clara Test",
        age: 32,
        gender: "Female",
        phone: "+1 555-321-0000",
        email: "clara@example.org",
        address: "400 Brookline Ave",
        bloodGroup: "A+",
        status: "Active",
      }).success
    ).toBe(true);

    expect(
      patientSchema.safeParse({
        fullName: "A",
        age: 140,
        gender: "Female",
        phone: "12",
        email: "bad",
        address: "no",
        bloodGroup: "A+",
        status: "Active",
      }).success
    ).toBe(false);
  });

  it("validates doctor, appointment, and invoice schemas", () => {
    expect(
      doctorSchema.safeParse({
        fullName: "Dr. Clara Vance",
        profileImage: "/avatars/doctor-1.svg",
        specialization: "Cardiology",
        department: "Cardiology",
        phone: "+1 555-000-1234",
        email: "c.vance@medaxis.org",
        experience: 12,
        availability: "Available",
        consultationFee: 200,
      }).success
    ).toBe(true);

    expect(
      appointmentSchema.safeParse({
        patientId: "PAT-1001",
        doctorId: "DOC-201",
        department: "Cardiology",
        date: "2026-11-11",
        time: "09:30",
        reason: "Annual cardiac checkup",
        status: "Confirmed",
      }).success
    ).toBe(true);

    expect(
      invoiceSchema.safeParse({
        patientId: "PAT-1001",
        serviceDescription: "Cardiology Consult",
        quantity: 0,
        unitPrice: 100,
        invoiceDate: "2026-11-11",
        status: "Unpaid",
      }).success
    ).toBe(false);
  });
});
