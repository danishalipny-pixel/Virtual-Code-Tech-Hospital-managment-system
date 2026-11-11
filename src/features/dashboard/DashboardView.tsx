"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  BedDouble,
  CalendarCheck2,
  DollarSign,
  Download,
  Plus,
  Printer,
  Stethoscope,
  Users,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  buildAppointmentStatusSeries,
  buildDepartmentVolumeSeries,
  buildPatientStatisticsSeries,
  buildRevenueSeries,
  computeDashboardSummary,
  getRecentPatients,
  getUpcomingAndRecentAppointments,
} from "@/lib/metrics";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDisplayDate, getTodayIso } from "@/lib/date";
import { StatCard } from "./StatCard";
import {
  AppointmentStatisticsChart,
  PatientStatisticsChart,
  RevenueChart,
} from "./Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function DashboardView() {
  const session = useHospitalStore((s) => s.session);
  const patients = useHospitalStore((s) => s.patients);
  const doctors = useHospitalStore((s) => s.doctors);
  const appointments = useHospitalStore((s) => s.appointments);
  const invoices = useHospitalStore((s) => s.invoices);
  const wards = useHospitalStore((s) => s.wards);
  const pushToast = useHospitalStore((s) => s.pushToast);
  const { canAccessBilling } = useRoleAccess();

  const todayIso = getTodayIso();

  const summary = useMemo(
    () =>
      computeDashboardSummary(
        patients,
        doctors,
        appointments,
        invoices,
        wards,
        todayIso
      ),
    [patients, doctors, appointments, invoices, wards, todayIso]
  );

  const patientSeries = useMemo(
    () => buildPatientStatisticsSeries(patients, appointments, todayIso),
    [patients, appointments, todayIso]
  );

  const revenueSeries = useMemo(
    () => buildRevenueSeries(invoices, todayIso),
    [invoices, todayIso]
  );

  const appointmentStatusSeries = useMemo(
    () => buildAppointmentStatusSeries(appointments),
    [appointments]
  );

  const departmentVolumeSeries = useMemo(
    () => buildDepartmentVolumeSeries(appointments),
    [appointments]
  );

  const recentAppointments = useMemo(
    () => getUpcomingAndRecentAppointments(appointments, todayIso, 6),
    [appointments, todayIso]
  );

  const recentPatients = useMemo(
    () => getRecentPatients(patients, 5),
    [patients]
  );

  const handleExportReportCsv = () => {
    downloadCsv(
      "medaxis-executive-summary.csv",
      [
        { metric: "Total Patients", value: summary.totalPatients },
        { metric: "Active Inpatients", value: summary.activeInpatients },
        { metric: "Total Doctors", value: summary.totalDoctors },
        { metric: "Available Doctors", value: summary.availableDoctors },
        { metric: "Appointments Today", value: summary.appointmentsToday },
        { metric: "Pending Appointments", value: summary.pendingAppointments },
        { metric: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
        { metric: "Paid Revenue", value: formatCurrency(summary.paidRevenue) },
        { metric: "Unpaid Amount", value: formatCurrency(summary.unpaidAmount) },
        {
          metric: "Bed Occupancy",
          value: `${summary.occupiedBeds}/${summary.totalBeds}`,
        },
      ],
      [
        { header: "Hospital KPI Metric", accessor: (r) => r.metric },
        { header: "Current Value", accessor: (r) => r.value },
      ]
    );
    pushToast({
      type: "info",
      title: "Summary report exported",
      message: "Downloaded executive KPI report as CSV.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Role Greeting & Quick Actions */}
      <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-sky-50/60 to-teal-50/40 p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:from-[#111c2e] dark:via-[#111c2e] dark:to-[#0f2036]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Welcome, {session?.name}
            </h2>
            {session && (
              <Badge status={session.role} className="capitalize">
                {session.role} View
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Hospital operations snapshot for {formatDisplayDate(todayIso)} ·{" "}
            {summary.occupiedBeds} of {summary.totalBeds} beds occupied
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportReportCsv}
          >
            Export Summary CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Print / PDF Report
          </Button>
          <Link href="/appointments">
            <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
              New Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <section aria-label="Key hospital performance indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={summary.totalPatients}
          subtitle={`${summary.activeInpatients} currently admitted inpatients`}
          icon={<Users className="h-5 w-5" />}
          accent="sky"
        />
        <StatCard
          title="Total Doctors"
          value={summary.totalDoctors}
          subtitle={`${summary.availableDoctors} available for consultation`}
          icon={<Stethoscope className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          title="Appointments Today"
          value={summary.appointmentsToday}
          subtitle={`${summary.pendingAppointments} pending confirmation overall`}
          icon={<CalendarCheck2 className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          subtitle={`${formatCurrency(summary.paidRevenue)} paid · ${formatCurrency(summary.unpaidAmount)} unpaid`}
          icon={<DollarSign className="h-5 w-5" />}
          accent="indigo"
        />
      </section>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PatientStatisticsChart data={patientSeries} />
        <RevenueChart data={revenueSeries} />
      </div>

      {/* Appointment Statistics & Quick Bed Occupancy */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <AppointmentStatisticsChart
            statusData={appointmentStatusSeries}
            departmentData={departmentVolumeSeries}
          />
        </div>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Ward Capacity Live</span>
            </CardTitle>
            <Link
              href="/wards"
              className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
            >
              Manage Beds
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {wards.map((ward) => {
              const occupied = ward.beds.filter((b) => b.status === "Occupied").length;
              const available = ward.beds.filter((b) => b.status === "Available").length;
              const pct = Math.round((occupied / ward.beds.length) * 100);
              return (
                <div key={ward.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {ward.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {available} free / {ward.beds.length}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-600 dark:bg-sky-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments & Recent Patients */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <Link
              href="/appointments"
              className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
            >
              View All Appointments
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-sky-50/40 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/patients/${apt.patientId}`}
                        className="font-semibold text-sm text-slate-900 hover:text-sky-700 hover:underline dark:text-white"
                      >
                        {apt.patientName}
                      </Link>
                      <span className="font-mono text-[11px] text-slate-400">
                        {apt.id}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {apt.doctorName} · {apt.department} ·{" "}
                      {formatDisplayDate(apt.date)} at {apt.time}
                    </p>
                  </div>
                  <Badge status={apt.status}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <Link
              href="/patients"
              className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
            >
              View Directory
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-sky-50/40 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-sky-700 hover:underline dark:text-white"
                    >
                      {patient.fullName}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {patient.id} · {patient.age} yrs · Blood {patient.bloodGroup}
                    </p>
                  </div>
                  <Badge status={patient.status}>{patient.status}</Badge>
                </div>
              ))}
            </div>

            {canAccessBilling && (
              <div className="no-print border-t border-slate-100 p-4 dark:border-slate-800">
                <Link href="/billing">
                  <Button variant="secondary" size="sm" className="w-full">
                    Open Billing & Invoices Ledger
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
