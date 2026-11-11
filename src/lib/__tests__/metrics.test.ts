import { describe, expect, it } from "vitest";
import {
  buildAppointmentStatusSeries,
  buildDepartmentVolumeSeries,
  buildRevenueSeries,
  computeDashboardSummary,
  getRecentPatients,
} from "../metrics";
import type { Appointment, Doctor, Invoice, Patient, Ward } from "../types";

const mockPatients: Patient[] = [
  {
    id: "PAT-1",
    fullName: "Alice One",
    age: 34,
    gender: "Female",
    phone: "555-0001",
    email: "alice@example.org",
    address: "1 Main St",
    bloodGroup: "A+",
    status: "Active",
    registeredAt: "2026-10-10",
  },
  {
    id: "PAT-2",
    fullName: "Bob Two",
    age: 50,
    gender: "Male",
    phone: "555-0002",
    email: "bob@example.org",
    address: "2 Main St",
    bloodGroup: "O+",
    status: "Inpatient",
    registeredAt: "2026-11-05",
  },
];

const mockDoctors: Doctor[] = [
  {
    id: "DOC-1",
    fullName: "Dr. Jane",
    profileImage: "/avatars/doctor-1.svg",
    specialization: "Cardiology",
    department: "Cardiology",
    phone: "555-1000",
    email: "jane@medaxis.org",
    experience: 10,
    availability: "Available",
    consultationFee: 200,
  },
  {
    id: "DOC-2",
    fullName: "Dr. John",
    profileImage: "/avatars/doctor-2.svg",
    specialization: "Neurology",
    department: "Neurology",
    phone: "555-1001",
    email: "john@medaxis.org",
    experience: 8,
    availability: "On Leave",
    consultationFee: 180,
  },
];

const mockAppointments: Appointment[] = [
  {
    id: "APT-1",
    patientId: "PAT-1",
    patientName: "Alice One",
    doctorId: "DOC-1",
    doctorName: "Dr. Jane",
    department: "Cardiology",
    date: "2026-11-11",
    time: "09:00",
    reason: "Checkup",
    status: "Confirmed",
  },
  {
    id: "APT-2",
    patientId: "PAT-2",
    patientName: "Bob Two",
    doctorId: "DOC-1",
    doctorName: "Dr. Jane",
    department: "Cardiology",
    date: "2026-11-11",
    time: "10:30",
    reason: "Follow-up",
    status: "Pending",
  },
  {
    id: "APT-3",
    patientId: "PAT-2",
    patientName: "Bob Two",
    doctorId: "DOC-2",
    doctorName: "Dr. John",
    department: "Neurology",
    date: "2026-11-11",
    time: "11:00",
    reason: "Cancelled slot",
    status: "Cancelled",
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "INV-1",
    patientId: "PAT-1",
    patientName: "Alice One",
    serviceDescription: "ECG",
    quantity: 1,
    unitPrice: 300,
    totalAmount: 300,
    invoiceDate: "2026-11-11",
    status: "Paid",
  },
  {
    id: "INV-2",
    patientId: "PAT-2",
    patientName: "Bob Two",
    serviceDescription: "Ward Stay",
    quantity: 2,
    unitPrice: 450,
    totalAmount: 900,
    invoiceDate: "2026-11-11",
    status: "Unpaid",
  },
];

const mockWards: Ward[] = [
  {
    id: "WRD-1",
    name: "ICU",
    department: "ICU",
    floor: "Floor 2",
    beds: [
      {
        id: "B-1",
        bedNumber: "ICU-1",
        wardId: "WRD-1",
        status: "Occupied",
        patientId: "PAT-2",
        patientName: "Bob Two",
      },
      { id: "B-2", bedNumber: "ICU-2", wardId: "WRD-1", status: "Available" },
    ],
  },
];

describe("dashboard metrics utilities", () => {
  it("computes dashboard KPIs accurately excluding cancelled appointments from today count", () => {
    const summary = computeDashboardSummary(
      mockPatients,
      mockDoctors,
      mockAppointments,
      mockInvoices,
      mockWards,
      "2026-11-11"
    );

    expect(summary.totalPatients).toBe(2);
    expect(summary.activeInpatients).toBe(1);
    expect(summary.totalDoctors).toBe(2);
    expect(summary.availableDoctors).toBe(1);
    expect(summary.appointmentsToday).toBe(2);
    expect(summary.pendingAppointments).toBe(1);
    expect(summary.paidRevenue).toBe(300);
    expect(summary.unpaidAmount).toBe(900);
    expect(summary.totalRevenue).toBe(1200);
    expect(summary.occupiedBeds).toBe(1);
    expect(summary.totalBeds).toBe(2);
  });

  it("aggregates revenue series across recent months", () => {
    const series = buildRevenueSeries(mockInvoices, "2026-11-11");
    expect(series).toHaveLength(6);
    const novPoint = series[series.length - 1];
    expect(novPoint.paid).toBe(300);
    expect(novPoint.unpaid).toBe(900);
    expect(novPoint.total).toBe(1200);
  });

  it("builds appointment status and department volume distributions", () => {
    const statusSeries = buildAppointmentStatusSeries(mockAppointments);
    expect(statusSeries.find((s) => s.name === "Confirmed")?.count).toBe(1);
    expect(statusSeries.find((s) => s.name === "Pending")?.count).toBe(1);
    expect(statusSeries.find((s) => s.name === "Cancelled")?.count).toBe(1);

    const deptSeries = buildDepartmentVolumeSeries(mockAppointments);
    expect(deptSeries).toEqual([{ department: "Cardiology", appointments: 2 }]);
  });

  it("sorts recent patients newest first", () => {
    const recent = getRecentPatients(mockPatients, 2);
    expect(recent[0].id).toBe("PAT-2");
    expect(recent[1].id).toBe("PAT-1");
  });
});
