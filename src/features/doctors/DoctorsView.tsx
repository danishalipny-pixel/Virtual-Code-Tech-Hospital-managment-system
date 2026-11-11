"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BriefcaseMedical,
  Download,
  LayoutGrid,
  List,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/date";
import type { Doctor, DoctorAvailability } from "@/lib/types";
import { DOCTOR_AVAILABILITY_OPTIONS } from "./doctor-schema";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type TableColumn } from "@/components/ui/Table";
import { DoctorFormModal } from "./DoctorFormModal";

export function DoctorsView() {
  const doctors = useHospitalStore((s) => s.doctors);
  const session = useHospitalStore((s) => s.session);
  const updateDoctorAvailability = useHospitalStore(
    (s) => s.updateDoctorAvailability
  );
  const deleteDoctor = useHospitalStore((s) => s.deleteDoctor);
  const pushToast = useHospitalStore((s) => s.pushToast);
  const { canManageDoctors } = useRoleAccess();

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const specializations = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialization))).sort(),
    [doctors]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((doc) => {
      const matchesSearch =
        !q ||
        doc.fullName.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q);
      const matchesSpec =
        specializationFilter === "ALL" ||
        doc.specialization === specializationFilter;
      const matchesAvail =
        availabilityFilter === "ALL" ||
        doc.availability === availabilityFilter;
      return matchesSearch && matchesSpec && matchesAvail;
    });
  }, [doctors, search, specializationFilter, availabilityFilter]);

  const hasFilters =
    search.trim() !== "" ||
    specializationFilter !== "ALL" ||
    availabilityFilter !== "ALL";

  const canChangeAvailability = (doc: Doctor) =>
    canManageDoctors || session?.doctorId === doc.id;

  const handleAvailabilityChange = (doc: Doctor, status: DoctorAvailability) => {
    updateDoctorAvailability(doc.id, status);
    pushToast({
      type: "info",
      title: "Availability updated",
      message: `${doc.fullName} is now marked as ${status}.`,
    });
  };

  const handleExportCsv = () => {
    downloadCsv("medaxis-doctors.csv", filtered, [
      { header: "Doctor ID", accessor: (d) => d.id },
      { header: "Full Name", accessor: (d) => d.fullName },
      { header: "Specialization", accessor: (d) => d.specialization },
      { header: "Department", accessor: (d) => d.department },
      { header: "Experience (Years)", accessor: (d) => d.experience },
      { header: "Availability", accessor: (d) => d.availability },
      { header: "Consultation Fee", accessor: (d) => d.consultationFee },
      { header: "Phone", accessor: (d) => d.phone },
      { header: "Email", accessor: (d) => d.email },
    ]);
    pushToast({
      type: "info",
      title: "Doctors exported",
      message: `Downloaded ${filtered.length} physician records as CSV.`,
    });
  };

  const tableColumns: TableColumn<Doctor>[] = [
    {
      key: "doctor",
      header: "Physician",
      render: (doc) => (
        <div className="flex items-center gap-3">
          <Image
            src={doc.profileImage}
            alt={doc.fullName}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-full border border-sky-100 object-cover dark:border-slate-700"
          />
          <div>
            <Link
              href={`/doctors/${doc.id}`}
              className="font-semibold text-slate-900 hover:text-sky-700 dark:text-slate-100 dark:hover:text-sky-400"
            >
              {doc.fullName}
            </Link>
            <p className="font-mono text-xs text-slate-500">{doc.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "specialization",
      header: "Specialization",
      render: (doc) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {doc.specialization}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {doc.department}
          </p>
        </div>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      render: (doc) => <span>{doc.experience} years</span>,
    },
    {
      key: "contact",
      header: "Contact",
      render: (doc) => (
        <div className="text-xs">
          <p>{doc.phone}</p>
          <p className="text-slate-500 dark:text-slate-400">{doc.email}</p>
        </div>
      ),
    },
    {
      key: "availability",
      header: "Availability",
      render: (doc) =>
        canChangeAvailability(doc) ? (
          <select
            aria-label={`Availability for ${doc.fullName}`}
            value={doc.availability}
            onChange={(e) =>
              handleAvailabilityChange(doc, e.target.value as DoctorAvailability)
            }
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {DOCTOR_AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <Badge status={doc.availability}>{doc.availability}</Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (doc) => (
        <div className="inline-flex items-center gap-1">
          <Link href={`/doctors/${doc.id}`}>
            <Button size="sm" variant="ghost">
              Profile
            </Button>
          </Link>
          {canManageDoctors && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditingDoctor(doc);
                  setModalOpen(true);
                }}
                aria-label={`Edit ${doc.fullName}`}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(doc)}
                aria-label={`Delete ${doc.fullName}`}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/60 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Medical Specialists & Physicians
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {doctors.length} active physicians ·{" "}
            {doctors.filter((d) => d.availability === "Available").length} available now
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                viewMode === "grid"
                  ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              aria-pressed={viewMode === "table"}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                viewMode === "table"
                  ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>

          {canManageDoctors && (
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditingDoctor(null);
                setModalOpen(true);
              }}
            >
              Add Doctor
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <label htmlFor="doctor-search" className="sr-only">
                Search doctors
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="doctor-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name, ID, or specialization..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-4">
              <label htmlFor="doctor-spec-filter" className="sr-only">
                Filter by specialization
              </label>
              <select
                id="doctor-spec-filter"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Specializations</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <label htmlFor="doctor-avail-filter" className="sr-only">
                Filter by availability
              </label>
              <select
                id="doctor-avail-filter"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Availability</option>
                {DOCTOR_AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSpecializationFilter("ALL");
                    setAvailabilityFilter("ALL");
                  }}
                  icon={<X className="h-4 w-4" />}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid or Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              No physicians matched your criteria
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try clearing search or specialization filters.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <DataTable
            caption="Medical specialists directory"
            columns={tableColumns}
            data={filtered}
            rowKey={(d) => d.id}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Image
                      src={doc.profileImage}
                      alt={doc.fullName}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 rounded-2xl border border-sky-100 bg-sky-50 object-cover dark:border-slate-700"
                    />
                    <div>
                      <Link
                        href={`/doctors/${doc.id}`}
                        className="text-base font-bold text-slate-900 hover:text-sky-700 dark:text-white dark:hover:text-sky-400"
                      >
                        {doc.fullName}
                      </Link>
                      <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                        {doc.specialization}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">
                        {doc.id}
                      </p>
                    </div>
                  </div>
                  <Badge status={doc.availability}>{doc.availability}</Badge>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <BriefcaseMedical className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>
                      {doc.experience} yrs experience · Fee{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {formatCurrency(doc.consultationFee)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{doc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                </div>

                {canChangeAvailability(doc) && (
                  <div className="mt-4">
                    <label
                      htmlFor={`avail-${doc.id}`}
                      className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Quick Availability
                    </label>
                    <select
                      id={`avail-${doc.id}`}
                      value={doc.availability}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          doc,
                          e.target.value as DoctorAvailability
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-sky-50/40 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {DOCTOR_AVAILABILITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  <Link href={`/doctors/${doc.id}`}>
                    <Button size="sm" variant="secondary">
                      View Profile
                    </Button>
                  </Link>
                  {canManageDoctors && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingDoctor(doc);
                          setModalOpen(true);
                        }}
                        aria-label={`Edit ${doc.fullName}`}
                        icon={<Pencil className="h-3.5 w-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(doc)}
                        aria-label={`Delete ${doc.fullName}`}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400"
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DoctorFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDoctor(null);
        }}
        editingDoctor={editingDoctor}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteDoctor(deleteTarget.id);
          pushToast({
            type: "warning",
            title: "Doctor removed",
            message: `${deleteTarget.fullName} (${deleteTarget.id}) removed from staff directory.`,
          });
        }}
        title="Remove Physician?"
        message={
          deleteTarget
            ? `Are you sure you want to remove ${deleteTarget.fullName} (${deleteTarget.specialization}) from the active medical roster?`
            : ""
        }
        confirmLabel="Remove Doctor"
      />
    </div>
  );
}
