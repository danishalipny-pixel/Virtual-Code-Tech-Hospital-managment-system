"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { formatCurrency, formatDisplayDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DoctorFormModal } from "./DoctorFormModal";

export function DoctorProfileView() {
  const params = useParams<{ id: string }>();
  const doctorId = params?.id ?? "";

  const doctors = useHospitalStore((s) => s.doctors);
  const appointments = useHospitalStore((s) => s.appointments);
  const { canManageDoctors } = useRoleAccess();

  const [editOpen, setEditOpen] = useState(false);

  const doctor = doctors.find((d) => d.id === doctorId);

  if (!doctor) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Physician Not Found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No doctor matching ID <span className="font-mono">{doctorId}</span> exists.
          </p>
          <div className="mt-5">
            <Link href="/doctors">
              <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Doctors Directory
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const docAppointments = appointments
    .filter((a) => a.doctorId === doctor.id)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/doctors">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            All Doctors
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/appointments">
            <Button variant="secondary" size="sm">
              Book Consultation
            </Button>
          </Link>
          {canManageDoctors && (
            <Button
              variant="primary"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit Doctor
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={doctor.profileImage}
                alt={doctor.fullName}
                width={80}
                height={80}
                unoptimized
                className="h-20 w-20 rounded-2xl border border-sky-100 bg-sky-50 object-cover dark:border-slate-700"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {doctor.fullName}
                  </h2>
                  <Badge status={doctor.availability}>{doctor.availability}</Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-sky-700 dark:text-sky-400">
                  {doctor.specialization} · {doctor.department}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">{doctor.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-sky-50/70 p-3.5 text-center dark:bg-slate-900/70">
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-500">
                  Experience
                </span>
                <span className="mt-0.5 block text-base font-bold text-slate-900 dark:text-white">
                  {doctor.experience} yrs
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-500">
                  Consult Fee
                </span>
                <span className="mt-0.5 block text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(doctor.consultationFee)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-500">
                  Visits
                </span>
                <span className="mt-0.5 block text-base font-bold text-slate-900 dark:text-white">
                  {docAppointments.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-3 dark:border-slate-800">
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <Award className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <div>
                <span className="block text-xs font-semibold text-slate-500">
                  Qualifications
                </span>
                <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {doctor.qualifications || "MD — Board Certified Specialist"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <CalendarDays className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <div>
                <span className="block text-xs font-semibold text-slate-500">
                  Schedule Days
                </span>
                <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {doctor.scheduleDays?.join(", ") || "Mon – Fri"}
                </p>
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-slate-100 p-3.5 text-xs dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{doctor.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Appointments ({docAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {docAppointments.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No appointments scheduled with this physician yet.
            </p>
          ) : (
            docAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
                      {apt.id}
                    </span>
                    <Link
                      href={`/patients/${apt.patientId}`}
                      className="text-sm font-semibold text-slate-900 hover:underline dark:text-white"
                    >
                      {apt.patientName}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDisplayDate(apt.date)} at {apt.time} · {apt.reason}
                  </p>
                </div>
                <Badge status={apt.status}>{apt.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <DoctorFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editingDoctor={doctor}
      />
    </div>
  );
}
