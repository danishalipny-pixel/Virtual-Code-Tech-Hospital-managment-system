"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CalendarClock,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { formatCurrency, formatDisplayDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PatientFormModal } from "./PatientFormModal";

export function PatientProfileView() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id ?? "";

  const patients = useHospitalStore((s) => s.patients);
  const appointments = useHospitalStore((s) => s.appointments);
  const invoices = useHospitalStore((s) => s.invoices);
  const wards = useHospitalStore((s) => s.wards);
  const { canAccessBilling } = useRoleAccess();

  const [editOpen, setEditOpen] = useState(false);

  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Patient Record Not Found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No patient matching ID <span className="font-mono">{patientId}</span> exists.
          </p>
          <div className="mt-5">
            <Link href="/patients">
              <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Patients Directory
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const patientAppointments = appointments
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  const patientInvoices = invoices
    .filter((inv) => inv.patientId === patient.id)
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));

  let assignedWardName: string | null = null;
  let assignedBedNumber: string | null = null;
  for (const w of wards) {
    const bed = w.beds.find((b) => b.patientId === patient.id);
    if (bed) {
      assignedWardName = w.name;
      assignedBedNumber = bed.bedNumber;
      break;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/patients">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            All Patients
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/appointments">
            <Button variant="secondary" size="sm" icon={<CalendarClock className="h-4 w-4" />}>
              Schedule Appointment
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => setEditOpen(true)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Patient Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-xl font-bold text-sky-700 dark:bg-sky-900/70 dark:text-sky-200">
                {patient.fullName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {patient.fullName}
                  </h2>
                  <Badge status={patient.status}>{patient.status}</Badge>
                </div>
                <p className="mt-1 font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
                  {patient.id} · Registered {formatDisplayDate(patient.registeredAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {patient.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {patient.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {patient.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-sky-50/70 p-3.5 text-center dark:bg-slate-900/70">
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-500">
                  Age
                </span>
                <span className="mt-0.5 block text-base font-bold text-slate-900 dark:text-white">
                  {patient.age}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-500">
                  Gender
                </span>
                <span className="mt-0.5 block text-base font-bold text-slate-900 dark:text-white">
                  {patient.gender}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-500">
                  Blood
                </span>
                <span className="mt-0.5 block font-mono text-base font-bold text-rose-600 dark:text-rose-400">
                  {patient.bloodGroup}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-3 dark:border-slate-800">
            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <ShieldAlert className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span>Emergency Contact</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                {patient.emergencyContact || "Not recorded"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <BedDouble className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Current Ward / Bed</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                {assignedWardName && assignedBedNumber
                  ? `${assignedWardName} · Bed ${assignedBedNumber}`
                  : "Outpatient / No bed assigned"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Clinical Notes
              </div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {patient.medicalNotes || "No clinical remarks entered."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment History + Billing */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Appointment History ({patientAppointments.length})
            </CardTitle>
            <Link
              href="/appointments"
              className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
            >
              Manage Schedule
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientAppointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No appointments logged for this patient yet.
              </p>
            ) : (
              patientAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
                        {apt.id}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {apt.department}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {apt.doctorName} · {formatDisplayDate(apt.date)} at {apt.time}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {apt.reason}
                    </p>
                  </div>
                  <Badge status={apt.status}>{apt.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {canAccessBilling && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Billing History ({patientInvoices.length})</span>
              </CardTitle>
              <Link
                href="/billing"
                className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
              >
                Open Billing
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {patientInvoices.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  No invoices issued for this patient yet.
                </p>
              ) : (
                patientInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800"
                  >
                    <div>
                      <Link
                        href={`/billing/${inv.id}`}
                        className="font-mono text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
                      >
                        {inv.id}
                      </Link>
                      <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {inv.serviceDescription}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDisplayDate(inv.invoiceDate)} · Qty {inv.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(inv.totalAmount)}
                      </p>
                      <Badge status={inv.status} className="mt-1">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <PatientFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editingPatient={patient}
      />
    </div>
  );
}
