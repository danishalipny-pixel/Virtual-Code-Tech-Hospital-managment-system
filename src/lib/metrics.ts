import type { Appointment, Doctor, Invoice, Patient, Ward } from "./types";
import { addDaysToIso, getTodayIso } from "./date";

export interface DashboardSummary {
  totalPatients: number;
  activeInpatients: number;
  totalDoctors: number;
  availableDoctors: number;
  appointmentsToday: number;
  pendingAppointments: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidAmount: number;
  occupiedBeds: number;
  totalBeds: number;
}

export interface PatientTrendPoint {
  month: string;
  newPatients: number;
  visits: number;
}

export interface RevenueChartPoint {
  month: string;
  paid: number;
  unpaid: number;
  total: number;
}

export interface AppointmentStatusPoint {
  name: string;
  count: number;
  fill: string;
}

export interface DepartmentVolumePoint {
  department: string;
  appointments: number;
}

export function computeDashboardSummary(
  patients: Patient[],
  doctors: Doctor[],
  appointments: Appointment[],
  invoices: Invoice[],
  wards: Ward[],
  todayIso: string = getTodayIso()
): DashboardSummary {
  const paidRevenue = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const unpaidAmount = invoices
    .filter((inv) => inv.status === "Unpaid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalBeds = wards.reduce((sum, w) => sum + w.beds.length, 0);
  const occupiedBeds = wards.reduce(
    (sum, w) => sum + w.beds.filter((b) => b.status === "Occupied").length,
    0
  );

  return {
    totalPatients: patients.length,
    activeInpatients: patients.filter((p) => p.status === "Inpatient").length,
    totalDoctors: doctors.length,
    availableDoctors: doctors.filter((d) => d.availability === "Available").length,
    appointmentsToday: appointments.filter(
      (a) => a.date === todayIso && a.status !== "Cancelled"
    ).length,
    pendingAppointments: appointments.filter((a) => a.status === "Pending").length,
    totalRevenue: paidRevenue + unpaidAmount,
    paidRevenue,
    unpaidAmount,
    occupiedBeds,
    totalBeds,
  };
}

function getMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  if (!y || !m) return yearMonth;
  const date = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function getRecentMonths(todayIso: string, count = 6): string[] {
  const [y, m] = todayIso.split("-").map(Number);
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const yy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    months.push(`${yy}-${mm}`);
  }
  return months;
}

export function buildPatientStatisticsSeries(
  patients: Patient[],
  appointments: Appointment[],
  todayIso: string = getTodayIso()
): PatientTrendPoint[] {
  const months = getRecentMonths(todayIso, 6);
  return months.map((ym) => ({
    month: formatMonthLabel(ym),
    newPatients: patients.filter((p) => getMonthKey(p.registeredAt) === ym).length,
    visits: appointments.filter(
      (a) => getMonthKey(a.date) === ym && a.status !== "Cancelled"
    ).length,
  }));
}

export function buildRevenueSeries(
  invoices: Invoice[],
  todayIso: string = getTodayIso()
): RevenueChartPoint[] {
  const months = getRecentMonths(todayIso, 6);
  return months.map((ym) => {
    const monthInvoices = invoices.filter((inv) => getMonthKey(inv.invoiceDate) === ym);
    const paid = monthInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const unpaid = monthInvoices
      .filter((inv) => inv.status === "Unpaid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    return {
      month: formatMonthLabel(ym),
      paid,
      unpaid,
      total: paid + unpaid,
    };
  });
}

export function buildAppointmentStatusSeries(
  appointments: Appointment[]
): AppointmentStatusPoint[] {
  return [
    {
      name: "Confirmed",
      count: appointments.filter((a) => a.status === "Confirmed").length,
      fill: "#0284c7",
    },
    {
      name: "Pending",
      count: appointments.filter((a) => a.status === "Pending").length,
      fill: "#f59e0b",
    },
    {
      name: "Completed",
      count: appointments.filter((a) => a.status === "Completed").length,
      fill: "#059669",
    },
    {
      name: "Cancelled",
      count: appointments.filter((a) => a.status === "Cancelled").length,
      fill: "#ef4444",
    },
  ];
}

export function buildDepartmentVolumeSeries(
  appointments: Appointment[]
): DepartmentVolumePoint[] {
  const map = new Map<string, number>();
  for (const apt of appointments) {
    if (apt.status === "Cancelled") continue;
    map.set(apt.department, (map.get(apt.department) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([department, count]) => ({ department, appointments: count }))
    .sort((a, b) => b.appointments - a.appointments);
}

export function getRecentPatients(patients: Patient[], limit = 5): Patient[] {
  return [...patients]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, limit);
}

export function getUpcomingAndRecentAppointments(
  appointments: Appointment[],
  todayIso: string = getTodayIso(),
  limit = 6
): Appointment[] {
  const windowStart = addDaysToIso(todayIso, -7);
  return [...appointments]
    .filter((a) => a.date >= windowStart)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
    .slice(0, limit);
}
