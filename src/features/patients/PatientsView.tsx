"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { downloadCsv } from "@/lib/csv";
import { formatDisplayDate } from "@/lib/date";
import type { Patient } from "@/lib/types";
import { BLOOD_GROUPS, GENDERS, PATIENT_STATUSES } from "./patient-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Pagination, type TableColumn } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { PatientFormModal } from "./PatientFormModal";

const PAGE_SIZE = 7;

export function PatientsView() {
  const patients = useHospitalStore((s) => s.patients);
  const appointments = useHospitalStore((s) => s.appointments);
  const deletePatient = useHospitalStore((s) => s.deletePatient);
  const pushToast = useHospitalStore((s) => s.pushToast);
  const { canDeletePatients } = useRoleAccess();

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [bloodFilter, setBloodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [previewPatient, setPreviewPatient] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const matchesSearch =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q);
      const matchesGender = genderFilter === "ALL" || p.gender === genderFilter;
      const matchesBlood = bloodFilter === "ALL" || p.bloodGroup === bloodFilter;
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesGender && matchesBlood && matchesStatus;
    });
  }, [patients, search, genderFilter, bloodFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    genderFilter !== "ALL" ||
    bloodFilter !== "ALL" ||
    statusFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setGenderFilter("ALL");
    setBloodFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const handleExportCsv = () => {
    downloadCsv("medaxis-patients.csv", filtered, [
      { header: "Patient ID", accessor: (p) => p.id },
      { header: "Full Name", accessor: (p) => p.fullName },
      { header: "Age", accessor: (p) => p.age },
      { header: "Gender", accessor: (p) => p.gender },
      { header: "Blood Group", accessor: (p) => p.bloodGroup },
      { header: "Status", accessor: (p) => p.status },
      { header: "Phone", accessor: (p) => p.phone },
      { header: "Email", accessor: (p) => p.email },
      { header: "Address", accessor: (p) => p.address },
      { header: "Registered Date", accessor: (p) => p.registeredAt },
    ]);
    pushToast({
      type: "info",
      title: "Patients exported",
      message: `Downloaded ${filtered.length} patient records as CSV.`,
    });
  };

  const columns: TableColumn<Patient>[] = [
    {
      key: "id",
      header: "Patient ID",
      render: (p) => (
        <Link
          href={`/patients/${p.id}`}
          className="font-mono text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
        >
          {p.id}
        </Link>
      ),
    },
    {
      key: "name",
      header: "Patient Name",
      render: (p) => (
        <div>
          <Link
            href={`/patients/${p.id}`}
            className="font-semibold text-slate-900 hover:text-sky-700 dark:text-slate-100 dark:hover:text-sky-400"
          >
            {p.fullName}
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">{p.email}</p>
        </div>
      ),
    },
    {
      key: "demographics",
      header: "Age / Gender",
      render: (p) => (
        <span className="text-xs sm:text-sm">
          {p.age} yrs · {p.gender}
        </span>
      ),
    },
    {
      key: "bloodGroup",
      header: "Blood",
      render: (p) => (
        <span className="inline-flex rounded-lg bg-rose-50 px-2 py-0.5 font-mono text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          {p.bloodGroup}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (p) => <span className="text-xs whitespace-nowrap">{p.phone}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge status={p.status}>{p.status}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (p) => (
        <div className="inline-flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setPreviewPatient(p)}
            title="Quick View"
            aria-label={`Quick view ${p.fullName}`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-300 cursor-pointer"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPatient(p);
              setFormModalOpen(true);
            }}
            title="Edit Patient"
            aria-label={`Edit ${p.fullName}`}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-300 cursor-pointer"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          {canDeletePatients && (
            <button
              type="button"
              onClick={() => setDeleteTarget(p)}
              title="Delete Patient"
              aria-label={`Delete ${p.fullName}`}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Patient Directory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {patients.length} registered patients · {patients.filter((p) => p.status === "Inpatient").length} active inpatients
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingPatient(null);
              setFormModalOpen(true);
            }}
          >
            Add Patient
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <label htmlFor="patient-search" className="sr-only">
                Search patients by name or ID
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="patient-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, patient ID (PAT-1001), or phone..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="patient-gender-filter" className="sr-only">
                Filter by gender
              </label>
              <select
                id="patient-gender-filter"
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Genders</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="patient-blood-filter" className="sr-only">
                Filter by blood group
              </label>
              <select
                id="patient-blood-filter"
                value={bloodFilter}
                onChange={(e) => {
                  setBloodFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <label htmlFor="patient-status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="patient-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                {PATIENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  aria-label="Clear filters"
                  icon={<X className="h-4 w-4" />}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Patients ({filtered.length})</CardTitle>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click a patient name or ID to open full clinical profile
          </span>
        </CardHeader>
        <DataTable
          caption="Hospital patients listing"
          columns={columns}
          data={paginated}
          rowKey={(p) => p.id}
          emptyTitle="No matching patients"
          emptyDescription="No patients matched your current search or filter settings."
          emptyAction={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<UserPlus className="h-4 w-4" />}
                onClick={() => setFormModalOpen(true)}
              >
                Add First Patient
              </Button>
            )
          }
        />
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      {/* Add / Edit Modal */}
      <PatientFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingPatient(null);
        }}
        editingPatient={editingPatient}
      />

      {/* Quick View Details Modal */}
      <Modal
        open={Boolean(previewPatient)}
        onClose={() => setPreviewPatient(null)}
        title={previewPatient ? `${previewPatient.fullName}` : "Patient Details"}
        description={previewPatient ? `Patient ID: ${previewPatient.id}` : undefined}
        size="md"
      >
        {previewPatient && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={previewPatient.status}>{previewPatient.status}</Badge>
              <Badge tone="danger">Blood Group {previewPatient.bloodGroup}</Badge>
              <Badge tone="neutral">
                {previewPatient.age} yrs · {previewPatient.gender}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 gap-3 rounded-2xl bg-sky-50/60 p-4 text-sm sm:grid-cols-2 dark:bg-slate-900/70">
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Phone
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {previewPatient.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Email
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {previewPatient.email}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Address
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {previewPatient.address}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Registered Date
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {formatDisplayDate(previewPatient.registeredAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Appointments Logged
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {
                    appointments.filter((a) => a.patientId === previewPatient.id)
                      .length
                  }{" "}
                  visit(s)
                </dd>
              </div>
              {previewPatient.medicalNotes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Clinical Notes
                  </dt>
                  <dd className="mt-0.5 text-slate-700 dark:text-slate-300">
                    {previewPatient.medicalNotes}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setPreviewPatient(null)}>
                Close
              </Button>
              <Link href={`/patients/${previewPatient.id}`}>
                <Button variant="primary">Open Full Profile</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePatient(deleteTarget.id);
          pushToast({
            type: "warning",
            title: "Patient removed",
            message: `${deleteTarget.fullName} (${deleteTarget.id}) was deleted.`,
          });
        }}
        title="Delete Patient Record?"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.fullName} (${deleteTarget.id})? This will also remove their scheduled appointments and release any assigned ward bed.`
            : ""
        }
        confirmLabel="Delete Patient"
      />
    </div>
  );
}
